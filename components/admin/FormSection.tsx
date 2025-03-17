"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/utils/formatCurrency";
import supabase from "@/utils/supabase";
import { CheckIcon, RefreshCcw } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useReducer, useState } from "react";
import {
  SubmitHandler,
  useFieldArray,
  useForm
} from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(999).optional(),
  price: z.coerce.number().int().min(0),
  img: z.nullable(z.string().max(999)),
  stock: z.coerce.number().int().min(0),
  has_label: z.boolean(),
  // TODO: Fix this any types schema
  label: z.any(),
  additional_img_url: z.nullable(z.array(z.string().max(9999).optional())),
  has_additional_forms: z.nullable(z.boolean()).optional(),
  additional_forms: z.nullable(
    z.array(
      z.object({
        label: z.string().max(50).optional(),
        type: z.enum(["text", "number", ""]).optional(),
        placeholder: z.string().max(50).optional(),
        required: z.boolean().optional(),
      }),
    ),
  ),
});

const productDefaultValues: Partial<z.infer<typeof createProductSchema>> = {
  img: "",
  name: "Buku",
  price: 23000,
  stock: 23,
  description: "sadasdas",
  has_label: false,
  label: "",
  additional_img_url: [""],
  has_additional_forms: false,
  additional_forms: [
    {
      label: "",
      type: "text",
      placeholder: "",
      required: true,
    },
  ],
};

interface FormSectionProps {
  id?: string;
  value?: z.infer<typeof createProductSchema>;
}

export function FormSection({ id, value }: FormSectionProps) {
  const router = useRouter();

  const {
    watch,
    register,
    setValue,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof createProductSchema>>({
    defaultValues: value ? value : productDefaultValues,
  });

  const price = parseInt(watch("price").toString()) || 0;

  const [loading, setLoading] = useState(false);
  const [productForm, setProductForm] = useReducer(
    (prev: any, next: any) => {
      // If the 'img_url' property exists in the next object and is an array
      if (next.additional_img_url && Array.isArray(next.additional_img_url)) {
        // Concatenate the new 'img_url' data with the existing one
        return {
          ...prev,
          additional_img_url: [
            ...prev.additional_img_url,
            ...next.additional_img_url,
          ],
        };
      } else {
        // Otherwise, perform the default behavior (merging the entire object)
        return { ...prev, ...next };
      }
    },
    {
      img: value?.img || "",
      name: value?.name || "",
      price: value?.price || 0,
      stock: value?.stock || 0,
      description: value?.description || "",
      has_label: value?.has_label || false,
      label: value?.label || "",
      additional_img_url: value?.additional_img_url || [],
    },
  );

  const onSubmitProject: SubmitHandler<
    z.infer<typeof createProductSchema>
  > = async (data) => {
    let req;

    // removing any leading or trailing whitespace from each item from data.label.
    if (typeof data.label === "string" && data.label.trim() !== "") {
      data.has_label = true;
      data.label = data.label
        .split(/,\s*/)
        .map((item: string) => item.trim())
        .filter((item: string) => item !== "");
    }
    console.log("data.label: ", data.label);

    const ProductData = {
      img: productForm?.img || "",
      name: data?.name || "",
      price: data?.price || 0,
      stock: data?.stock || 0,
      description: data?.description || "",
      has_label: data?.has_label || false,
      label: data?.label || null,
      additional_img_url: productForm?.additional_img_url || null,
      additional_forms: data.additional_forms
        ? data.additional_forms.map((form) => ({
            ...form,
            label: form.label,
            type: "text",
            required: true,
            placeholder: form.placeholder,
          }))
        : null,
      has_additional_forms: data.has_additional_forms || false,
    };

    console.log(ProductData);

    if (id) {
      req = await fetch(`/api/products?id=${id}`, {
        method: "PATCH",
        headers: {
          "Contet-type": "application/json",
        },
        body: JSON.stringify(ProductData),
      });
    } else {
      req = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Contet-type": "application/json",
        },
        body: JSON.stringify(ProductData),
      });
    }

    const response = await req.json();

    setLoading(false);
    if (response?.data?.id) {
      router.push("/admin/products");
    } else console.log("Data tidak masuk");
  };

  const [images, setImages] = useState<any[]>([]);
  const CDNURL =
    "https://vdmsolvdwppbygjhxslv.supabase.co/storage/v1/s3/object/public/images/";
  async function getImages() {
    const { data, error } = await supabase.storage
      .from("images")
      .list("products/", {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    if (data !== null) {
      setImages(data);
    } else {
      alert("Error loading images");
      console.log(error);
    }
  }

  useEffect(() => {
    getImages();
  }, []);

  // async function uploadImage(e: any) {
  //   let files = (e.target as HTMLInputElement).files;

  //   if (files && files?.length > 0) {
  //     const file = files[0];
  //     const { data, error } = await supabase.storage
  //       .from("images")
  //       .upload("products/" + file.name, file);

  //     if (data) {
  //       getImages();
  //     } else {
  //       console.log(error);
  //     }
  //   }
  // }

  function deleteImage(imageUrl: string[] | string) {
    if (typeof imageUrl === "string") {
      imageUrl = [imageUrl];
    }
    imageUrl.map(async (url) => {
      const startIndex = url.indexOf("/images/") + "/images/".length;
      const remainingUrl = url.substring(startIndex);
      const { error } = await supabase.storage
        .from("images")
        .remove([remainingUrl]);

      if (error) {
        return alert(error);
      }
    });
  }

  // setLoading(true);
  // if (files && files?.length > 0 && files.length <= 5) {
  //   for (const file of Array.from(files)) {
  //     if (!checkImageSize(file)) {
  //       e.target.value = "";
  //     } else {
  //       const response = await fetch("/api/upload", {
  //         method: "POST",
  //         headers: {
  //           "Content-type": file.type,
  //           "X-Vercel-Filename": `products/${uuidv4()}-${file.name}`,
  //         },
  //         body: file,
  //       }).then((res) => res.json());

  //       setProductForm({
  //         additional_img_url: [response.url],
  //       });
  //       setValue("additional_img_url", response.url);
  //     }
  //   }
  // }
  // setLoading(false);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    let files = (e.target as HTMLInputElement).files;

    if (files && files?.length > 0 && files.length <= 5) {
      const file = files[0];
      setLoading(true);
      deleteImage(productForm.img);

      if (!checkImageSize(file)) {
        e.target.value = "";
      } else {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-type": file.type,
            "X-Vercel-Filename": `products/${uuidv4()}-${file.name}`,
          },
          body: file,
        }).then((res) => res.json());

        setProductForm({
          img: response.url,
        });
        setValue("img", response.url);
      }
      setLoading(false);
    }
  }

  const { fields, append, remove } = useFieldArray({
    name: "additional_forms",
    control,
  });

  return (
    <form className="pb-16" onSubmit={handleSubmit(onSubmitProject)}>
      <div className="_PRODUCT_NAME">
        <Label htmlFor="name" className="capitalize">
          Product Name
        </Label>
        <Input
          type="text"
          {...register("name", { required: true })}
          placeholder="Product"
          className={`mt-2 ${errors.name ? "border-red-500 bg-red-100" : ""}`}
        />
        {errors.name && (
          <span className="mt-1 text-sm text-red-500">
            This field is required
          </span>
        )}
      </div>
      <div className="_PRICE mt-5">
        <Label htmlFor="price" className="capitalize">
          Product Price
        </Label>
        <Input
          type="number"
          placeholder="0"
          min={0}
          {...register("price", { required: true })}
          className={`mt-2 ${errors.price ? "border-red-500 bg-red-100" : ""}`}
        />
        <span className="mt-1 text-sm text-neutral-500">
          {formatCurrency(price)}
        </span>
        {errors.price && (
          <span className="mt-1 text-sm text-red-500">
            This field is required
          </span>
        )}
      </div>
      <div className="_STOCK mt-5">
        <Label htmlFor="stock" className="capitalize">
          Product Stock
        </Label>
        <Input
          type="number"
          placeholder="0"
          min={0}
          {...register("stock", { required: true })}
          className={`mt-2 ${errors.stock ? "border-red-500 bg-red-100" : ""}`}
        />
        {errors.stock && (
          <span className="mt-1 text-sm text-red-500">
            This field is required
          </span>
        )}
      </div>
      <div className="_DESCRIPTION mt-5">
        <Label htmlFor="description" className="capitalize">
          Product Description
        </Label>
        <Textarea
          placeholder="Description"
          {...register("description", { required: true })}
          className={`mt-2 ${
            errors.description ? "border-red-500 bg-red-100" : ""
          }`}
        />
        {errors.description && (
          <span className="mt-1 text-sm text-red-500">
            This field is required
          </span>
        )}
      </div>
      <div className="_LABEL mt-5">
        <Label htmlFor="label" className="capitalize">
          Label tambahan (Gunakan tanda koma untuk memisahkan setiap label)
        </Label>
        <Input
          placeholder="S, M, L, XL, XXL"
          {...register("label")}
          className="mt-2"
        />
      </div>
      <div className="_IMAGE_PRODUCT mt-5">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="picture">
            Product Image <i>(maximum size: 1 mb)</i>
          </Label>
          {productForm.img && (
            <div key={productForm.img}>
              <Image
                src={productForm.img}
                alt={productForm.img}
                width={200}
                height={200}
                className="h-auto rounded-md border object-contain"
              />
              <Button
                type="button"
                className="w-[200px]"
                variant="destructive"
                disabled={loading}
                onClick={() => {
                  deleteImage(productForm.img);
                  setProductForm({
                    img: "",
                  });
                }}
              >
                Delete
              </Button>
            </div>
          )}
          <input
            type="hidden"
            value={productForm.img}
            {...register("img", { required: true })}
          />
          <Input
            id="picture"
            type="file"
            accept="image/png, image/jpg, image/jpeg"
            className={`mt-2 ${errors.img ? "border-red-500 bg-red-100" : ""}`}
            onChange={(e) => handleFileChange(e)}
          />
          {errors.img && (
            <span className="mt-1 text-sm text-red-500">
              This field is required
            </span>
          )}
        </div>
      </div>
      <div className="ADDITIONAL_IMAGE mt-5">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="additional-picture">
            Additional Image (Max 5)
            <br />
            <i>(maximum size for every image: 1 mb)</i>
          </Label>
          <div className="flex w-full gap-4">
            {productForm.additional_img_url &&
              productForm.additional_img_url.map((url: string) => (
                <div className="flex flex-col justify-between gap-2" key={url}>
                  <Image
                    src={url}
                    alt={url}
                    width={100}
                    height={100}
                    className="h-full rounded-md border object-cover"
                  />
                </div>
              ))}
          </div>
          {productForm.additional_img_url.length > 0 && (
            <Button
              type="button"
              className="w-full"
              variant="destructive"
              disabled={loading}
              onClick={() => {
                deleteImage(productForm.additional_img_url);
                setProductForm({
                  additional_img_url: "",
                });
              }}
            >
              Delete all
            </Button>
          )}
          <input
            type="hidden"
            value={productForm.additional_img_url}
            {...register("additional_img_url")}
          />
          <Input
            id="picture"
            type="file"
            accept="image/png, image/jpg, image/jpeg"
            multiple
            className={`mt-2 ${errors.additional_img_url ? "border-red-500 bg-red-100" : ""}`}
            onChange={async (e) => {
              let files = (e.target as HTMLInputElement).files;

              setLoading(true);
              if (
                files &&
                files?.length > 0 &&
                productForm.additional_img_url.length < 5
              ) {
                for (const file of Array.from(files)) {
                  if (!checkImageSize(file)) {
                    e.target.value = "";
                  } else {
                    const response = await fetch("/api/upload", {
                      method: "POST",
                      headers: {
                        "Content-type": file.type,
                        "X-Vercel-Filename": `products/${uuidv4()}-${file.name}`,
                      },
                      body: file,
                    }).then((res) => res.json());

                    setProductForm({
                      additional_img_url: [response.url],
                    });
                    setValue("additional_img_url", response.url);
                  }
                }
              } else {
                alert("File melebihi 5!!!");
                e.target.value = "";
              }
              setLoading(false);
            }}
          />
        </div>
      </div>
      <div className="_ADDITIONAL_FORMS mt-5">
        <Label className="capitalize">Additional Forms</Label>
        {fields.map((field: any, index: number) => (
          <div key={field.id} className="align-end flex w-full gap-2">
            <div className="w-full">
              <Label className="capitalize">
                Masukan label untuk form tambahan
              </Label>
              <Input
                type="text"
                {...register(`additional_forms.${index}.label` as const)}
                placeholder="Umur"
                className={`mt-2 ${errors.additional_forms ? "border-red-500 bg-red-100" : ""}`}
              />
            </div>
            <div className="w-full">
              <Label className="capitalize">
                Masukan label untuk form tambahan
              </Label>
              <Input
                type="text"
                {...register(`additional_forms.${index}.placeholder` as const)}
                placeholder="Masukan umur anda"
                className={`mt-2 ${errors.additional_forms ? "border-red-500 bg-red-100" : ""}`}
              />
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant={"outline"}
        className="mt-2"
        onClick={() => append({ label: "" })}
      >
        Add other form
      </Button>
      <Button
        type="button"
        variant={"outline"}
        className="h-full"
        onClick={() => remove(fields.length - 1)}
      >
        Remove
      </Button>
      <div className="mt-4 flex justify-end">
        <Button
          variant={"secondary"}
          onClick={() => {
            router.push("/admin/products");
          }}
        >
          Cancel
        </Button>
        <Button disabled={loading} className="ml-5">
          {loading ? (
            <>
              <RefreshCcw size={20} className="mr-2 animate-spin" />
              Please wait
            </>
          ) : (
            <>
              <CheckIcon size={20} className="mr-2" />
              Save
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function checkImageSize(file: File, maxSizeMB: number = 1) {
  const fileSize = file.size;
  const fileSizeMb = fileSize / 1024 ** 2;

  if (fileSizeMb > maxSizeMB) {
    alert(`${file.name} is too big! Select an image under ${maxSizeMB} MB!`);
    return false;
  }

  return true;
}
