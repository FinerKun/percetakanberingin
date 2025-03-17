import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart } from "lucide-react";
import { useShoppingCart } from "@/context/ShoppingCartContext";
import { useFetchProducts } from "@/utils/api";
import { CartItem } from "./CartItem";
import { formatCurrency } from "@/utils/formatCurrency";
import { Separator } from "./ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TransactionForm } from "./TransactionForm";
import { useState } from "react";

export function ShoppingCartDialog() {
  const { cartQuantity, cartItems } = useShoppingCart();
  const products = useFetchProducts();

  const [value, setValue] = useState("item-1"); // Accordian value

  const total_price = cartItems.reduce((total, cartItem) => {
    const item = products.find((i) => i.id === cartItem.id);
    return total + (item?.price || 0) * cartItem.quantity;
  }, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size={"icon"} className="relative">
          <ShoppingCart color="#640000" />
          <div className="absolute right-0 top-0 size-5 rounded-full bg-red-500 align-baseline text-white">
            {cartQuantity}
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent
        side={"bottom"}
        className="h-[95%] overflow-auto rounded-t-xl"
      >
        <div className="mx-auto max-w-[768px]">
          <SheetHeader>
            <SheetTitle>Pemesanan</SheetTitle>
            <SheetDescription>
              Periksa kembali barang yang ingin kamu beli. Isi formulir di bawah
              dan klik pesan sekarang.
            </SheetDescription>
          </SheetHeader>
          <Accordion
            type="single"
            className="w-full"
            value={value}
            onValueChange={setValue}
          >
            <AccordionItem value="item-1">
              <AccordionTrigger
                className={value === "item-1" ? "font-semibold" : ""}
              >
                Item Product
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                {cartItems.map((item) => (
                  <CartItem key={item.id} {...item} />
                ))}
                <Separator />
                <div className="flex w-full justify-between font-semibold">
                  <h1 className="font-normal">Total Harga</h1>
                  {formatCurrency(total_price)}
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button onClick={() => setValue("item-2")}>
                    Selanjutnya
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger
                className={value === "item-2" ? "font-semibold" : ""}
              >
                Form Pemesanan
              </AccordionTrigger>
              <AccordionContent>
                <TransactionForm
                  total_price={total_price}
                  accordionValue={setValue}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
}
