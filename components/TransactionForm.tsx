"use client";

import { Textarea } from "@/components/ui/textarea";
import { useShoppingCart } from "@/context/ShoppingCartContext";
import gambarqris from "@/public/gambarqris.png";
import { useFetchProducts } from "@/utils/api";
import supabase from "@/utils/supabase";
import { CheckIcon, RefreshCcw } from "lucide-react";
import Image from "next/image";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useReducer,
  useState,
} from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Inputs = {
  name: string;
  phone: string;
  notes: string;
  address: string;
  proof_of_transaction_url: string;
  additional_forms: Record<string, string | number>;
};

type TransactionFormProps = {
  id?: string;
  value?: Inputs;
  total_price: number;
  accordionValue: Dispatch<SetStateAction<string>>;
};

export function TransactionForm({
  accordionValue,
  total_price,
}: TransactionFormProps) {
  const { cartItems } = useShoppingCart();
  const [loading, setLoading] = useState(false);

  const products = useFetchProducts();
  // const item = products.find((i) => i.id === id);
  let dataProducts: any = [];
  cartItems.map((item) => {
    const id = item.id;
    const product = products?.find((i) => i.id === id);

if (!product) {
  console.warn(`Produk dengan ID ${id} tidak ditemukan.`);
} else if (product.additional_forms !== null) {
  dataProducts.push(product);
}

  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Inputs>({
    defaultValues: {
      name: "",
      phone: "",
      notes: "",
      address: "",
      proof_of_transaction_url: "",
    },
  });

  const [productForm, setProductForm] = useReducer(
    (prev: any, next: any) => {
      return { ...prev, ...next };
    },
    {
      name: "",
      phone: "",
      notes: "",
      address: "",
      proof_of_transaction_url: "",
      additional_forms: [],
    },
  );

  function toKebabCase(str: string) {
    return str
      .toLowerCase() // Step 1: Convert to lowercase
      .replace(/[^\w\s-]/g, "") // Step 2: Remove non-alphanumeric characters (excluding spaces and hyphens)
      .replace(/\s+/g, "-") // Step 3: Replace spaces with hyphens
      .trim(); // Optional: Trim leading/trailing whitespace
  }

  const onSubmitProject: SubmitHandler<Inputs> = async (data) => {
    let req;
    let reqOrder;
    let additional_forms_arr = null;

    console.log(data.additional_forms);

    if (data.additional_forms !== undefined) {
      additional_forms_arr = Object.entries(data.additional_forms);
    }

    const ProductData = {
      name: data?.name || "",
      phone: data?.phone || "",
      notes: data?.notes || "",
      address: data?.address || "",
      proof_of_transaction_url: productForm?.proof_of_transaction_url || "",
      total_price: total_price || 0,
      additional_forms: additional_forms_arr || null,
    };

    console.log(ProductData);

    setLoading(true);

    req = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // ✅ Sudah diperbaik
      },
      body: JSON.stringify(ProductData),
    });
    
    const response = await req.json();

    if (!response || !response.data) {
      console.error("Error: Response dari API tidak valid", response);
      alert("Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.");
      return;
    }
    
    const OrderItemsData = cartItems.map((item) => ({
      uuid_transactions: response.data.id, // Aman, karena sudah dicek di atas
      uuid_product: item.id,
      product_quantity: item.quantity,
      label: item.label,
    }));

    reqOrder = await fetch("/api/order-items", {
      method: "POST",
      headers: {
        "Contet-type": "application/json",
      },
      body: JSON.stringify(OrderItemsData),
    });

    const responseOrder = await reqOrder.json();

    setLoading(false);
    if (responseOrder?.data[0]?.id) {
      alert("Pesananmu telah berhasil");
      location.reload();
    }
  };

  function deleteImage(imageUrl: string[] | string) {
    if (typeof imageUrl === "string") {
      imageUrl = [imageUrl];
    }
    imageUrl.map(async (url) => {
      const startIndex =
        url.indexOf("/transactions/") + "/transactions/".length;
      const remainingUrl = url.substring(startIndex);
      const { error } = await supabase.storage
        .from("transactions")
        .remove([remainingUrl]);

      if (error) {
        return alert(error);
      }
    });
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    let files = (e.target as HTMLInputElement).files;

    if (files && files?.length > 0 && files.length <= 5) {
      const file = files[0];
      setLoading(true);
      deleteImage(productForm.proof_of_transaction_url);

      if (!checkImageSize(file)) {
        if (e.target) {
          e.target.value = "";
        }
      } else {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": file.type,
            "X-Vercel-Filename": `transactions/${uuidv4()}-${file.name}`,
          },
          body: file,
        }).then((res) => res.json());

        setProductForm({
          proof_of_transaction_url: response.url,
        });
        setValue("proof_of_transaction_url", response.url);
      }
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitProject)} className="space-y-4 px-2">
      <div className="_NAME">
        <Label htmlFor="name" className="capitalize">
          Full Name
        </Label>
        <Input
          type="text"
          {...register("name", { required: true })}
          placeholder="John Doe"
          className={`mt-2 ${errors.name ? "border-red-500 bg-red-100" : ""}`}
        />
        {errors.name && (
          <span className="mt-1 text-sm text-red-500">
            Nama panjang perlu diisi
          </span>
        )}
      </div>
      <div className="_PHONE mt-5">
        <Label htmlFor="phone" className="capitalize">
          Phone Number
        </Label>
        <Input
          type="text"
          placeholder="08123456789"
          {...register("phone", {
            required: true,
            pattern: {
              value: /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/,
              message: "Please enter a valid phone number",
            },
          })}
          className={`mt-2 ${errors.phone ? "border-red-500 bg-red-100" : ""}`}
        />
        {errors.phone && (
          <span className="mt-1 text-sm text-red-500">
            Please enter a valid phone number
          </span>
        )}
      </div>
      <div className="_ADDRESS mt-5">
        <Label htmlFor="address" className="capitalize">
          Address
        </Label>
        <Textarea
          placeholder="Address"
          {...register("address", { required: true })}
          className={`mt-2 ${errors.phone ? "border-red-500 bg-red-100" : ""}`}
        />
        {errors.phone && (
          <span className="mt-1 text-sm text-red-500">Alamat perlu diisi</span>
        )}
      </div>
      <div className="_NOTES mt-5">
        <Label htmlFor="notes" className="capitalize">
          Notes
        </Label>
        <Textarea
          placeholder="Notes"
          {...register("notes")}
          className={"mt-2 min-h-[50px]"}
        />
      </div>
      {dataProducts.map((data: any, i: number) => (
        <div className="_CUSTOM" key={i}>
          {data.additional_forms.map((form: any, j: number) => (
            <div className="mt-4" key={j}>
              <Label className="capitalize">
                {form.label} | Data untuk produk {data.name}
              </Label>
              <Input
                type={form.type}
                {...register(`additional_forms.${toKebabCase(form.label)}`, {
                  required: form.required,
                })}
                placeholder={form.placeholder}
                className={`mt-2 ${errors.additional_forms && errors.additional_forms[form.name] ? "border-red-500 bg-red-100" : ""}`}
              />
              {errors.additional_forms &&
                errors.additional_forms[form.label] && (
                  <span className="mt-1 text-sm text-red-500">
                    Data tambahan perlu diisi
                  </span>
                )}
            </div>
          ))}
        </div>
      ))}
      <div className="_PROOF_OF_TRANSACTION_URL mt-5 grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="proof_of_transaction_url">
          Bukti Pembayaran ( .jpg, .png )
          <div className="mt-2 text-base text-slate-500">
          Jago: 105852900512 A/n Stefanus Derren Kurniawan
          </div>
          <div className="_QRIS mt-5 grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="qris">
              Scan QRIS untuk Pembayaran (Percetakan Beringin)
              <div className="mt-2 text-base text-slate-500">
                Pastikan untuk mengunggah bukti pembayaran setelah transfer.
              </div>
            </Label>
            <Image
              src={gambarqris} // Ganti dengan path QRIS Anda
              alt="QRIS Payment"
              width={250}
              height={250}
              className="h-auto rounded-md border object-contain"
            />
          </div>

        </Label>
        {productForm.proof_of_transaction_url && (
          <div>
            <Image
              src={productForm.proof_of_transaction_url}
              alt=""
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
                deleteImage(productForm.proof_of_transaction_url);
                setProductForm({
                  proof_of_transaction_url: "",
                });
              }}
            >
              Delete
            </Button>
          </div>
        )}
        <input
          type="hidden"
          value={productForm.proof_of_transaction_url}
          {...register("proof_of_transaction_url", { required: true })}
        />
        <Input
          id="picture"
          type="file"
          accept=".jpg, .jpeg, .png"
          className={`mt-2 ${
            errors.proof_of_transaction_url ? "border-red-500 bg-red-100" : ""
          }`}
          onChange={(e) => handleFileChange(e)}
        />
        {errors.proof_of_transaction_url && (
          <span className="mt-1 text-sm text-red-500">
            This field is required
          </span>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={() => accordionValue("item-1")} variant={"outline"}>
          Sebelumnya
        </Button>
        <Button>
          {loading ? (
            <>
              <RefreshCcw size={20} className="mr-2 animate-spin" />
              Please wait
            </>
          ) : (
            <>
              <CheckIcon size={20} className="mr-2" />
              Pesan Sekarang
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
