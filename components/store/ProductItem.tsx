import { formatCurrency } from "@/utils/formatCurrency";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { useShoppingCart } from "@/context/ShoppingCartContext";
import { ProductsProps } from "@/lib/types";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "../ui/separator";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { AspectRatio } from "../ui/aspect-ratio";

export function ProductItem({
  id,
  name,
  price,
  description,
  img,
  stock,
  has_label,
  label,
  additional_img_url,
}: ProductsProps) {
  const {
    getItemQuantity,
    increaseCartQuantity,
    decreaseCartQuantity,
    getLabel,
    onLabelChange,
  } = useShoppingCart();
  const quantity = getItemQuantity(id);
  const labelName = getLabel(id) || "";

  const [isDisabled, setDisabled] = useState(false);

  // Disable add product button if label not selected first
  useEffect(() => {
    setDisabled(has_label && labelName === "");
  }, [has_label, labelName]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="cursor-pointer">
          <div className="relative aspect-square w-full overflow-clip rounded-xl border hover:grow hover:shadow-lg">
            <ImageProduct img={img} alt={description} />
            {quantity > 0 && (
              <div className="absolute bottom-2 right-2 flex size-6 items-center justify-center rounded-md border border-red-500 bg-white/85 text-sm text-red-500 sm:size-8 sm:rounded-lg sm:text-base">
                {quantity}
              </div>
            )}
          </div>
          <div className="flex justify-between pt-3">
            <div className="flex flex-col items-start">
              <h1 className="line-clamp-2 text-base font-semibold text-[#892217] sm:text-lg">
                {name}
              </h1>
              <h2 className="text-gray-900">{formatCurrency(price)}</h2>
            </div>
          </div>
        </div>
      </SheetTrigger>
      <SheetContent
        closeButton={"back"}
        side={"bottom"}
        className="h-[95%] rounded-t-xl pt-10"
      >
        <div className="relative mx-auto flex h-full max-w-[1280px] flex-col gap-4 overflow-auto pt-6 sm:gap-8 md:flex-row">
          <Carousel
            plugins={[
              Autoplay({
                delay: 5000,
              }),
            ]}
            className="w-full rounded-xl border md:max-h-[500px] md:max-w-[500px]"
          >
            <CarouselContent>
              <CarouselItem>
                <ImageProduct img={img} alt={description} />
              </CarouselItem>
              {additional_img_url !== null
                ? additional_img_url.map((add_img, i) => (
                    <CarouselItem className="relative" key={i}>
                      <ImageProduct img={add_img} alt={add_img} />
                    </CarouselItem>
                  ))
                : null}
            </CarouselContent>
          </Carousel>
          <div className="flex flex-1 flex-col justify-between md:max-h-[500px]">
            <div className="flex flex-col justify-between gap-2">
              <div>
                <h1 className="text-lg font-medium text-[#892217]">{name}</h1>
                <h1 className="text-xl font-bold text-gray-900">
                  {formatCurrency(price)}
                </h1>
                <h2 className="text-sm">Stok Produk {stock}</h2>
              </div>
              <Separator className="mt-2" />
              <h2 className="mt-2 text-sm font-semibold">Deskripsi Produk</h2>
              <ReadMore>{description}</ReadMore>
            </div>
            <div className="sticky bottom-0 bg-gradient-to-t from-white from-40% pt-8">
              {has_label && (
                <Select
                  value={labelName}
                  onValueChange={(value) => onLabelChange(id, value)}
                  // onValueChange={setSelectedLabel}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      aria-label={labelName}
                      placeholder="Pilih varian"
                    >
                      {labelName}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {label.map((d, i) => (
                        <SelectItem key={i} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
              {quantity === 0 ? (
                <Button
                  disabled={isDisabled}
                  onClick={() => increaseCartQuantity(id)}
                  className="mt-4 w-full bg-[#EEEADC] text-[#892217] hover:bg-[#892217] hover:text-[#EEEADC]"
                >
                  Tambah <Plus strokeWidth={1.5} className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <div className="mt-4 flex w-full items-center justify-between">
                  <Button
                    onClick={() => decreaseCartQuantity(id)}
                    size="icon"
                    className="bg-[#EEEADC] hover:bg-[#EEEADC]/70"
                  >
                    <Minus className="h-4 w-4" color="#892217" />
                  </Button>
                  <div>
                    {quantity}
                    <span className="text-sm font-light"> in cart</span>
                  </div>
                  <Button
                    onClick={() => increaseCartQuantity(id)}
                    size="icon"
                    className="bg-[#EEEADC] hover:bg-[#EEEADC]/70"
                  >
                    <Plus className="h-4 w-4" color="#892217" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

type ImageProductProps = {
  img: string;
  alt: string;
};

function ImageProduct({ img, alt }: ImageProductProps) {
  return (
    //   FIXME: Fix Images loaded lazily and replaced with placeholder
    <AspectRatio ratio={1 / 1} className="bg-muted">
      <Image src={img} alt={img} fill className="rounded-md object-cover" />
    </AspectRatio>
  );
}

type ReadMoreProps = {
  children: string;
};

function ReadMore({ children }: ReadMoreProps) {
  const text = children || "";
  const [isReadMore, setIsReadMore] = useState(true);
  const toggleReadMore = () => {
    setIsReadMore(!isReadMore);
  };
  return (
    <p className="whitespace-pre-wrap">
      {text.length <= 200 ? (
        text
      ) : (
        <>
          {isReadMore ? text.slice(0, 200) : text}
          <span
            onClick={toggleReadMore}
            className="cursor-pointer text-[#892217]"
          >
            {isReadMore ? " ...read more" : "\nshow less"}
          </span>
        </>
      )}
    </p>
  );
}
