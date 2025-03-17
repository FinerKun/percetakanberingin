import { useShoppingCart } from "@/context/ShoppingCartContext";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ShoppingCartDialog } from "@/components/CartSheet";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";

export function NavBar() {
  const { cartQuantity } = useShoppingCart();
  return (
    <nav id="header" className="sticky top-0 z-50 w-full bg-[#EEEADC] py-2">
      <div className="container mx-auto mt-0 flex w-full flex-wrap items-center justify-between px-6 py-1 md:py-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size={"icon"} className="md:hidden">
              <Menu color="#640000" />
            </Button>
          </SheetTrigger>
          <SheetContent side={"left"} className="bg-[#EEEADC]">
            <div className="grid gap-4 py-8">
              <SheetClose asChild>
                <Button
                  variant={"ghost"}
                  className="font-semibold text-[#640000] hover:bg-[#640000] hover:text-[#EEEADC]"
                  type="submit"
                >
                  <Link href={"#store"}>STORE</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  variant={"ghost"}
                  className="font-semibold text-[#640000] hover:bg-[#640000] hover:text-[#EEEADC]"
                  type="submit"
                >
                  <Link href={"#about"}>ABOUT</Link>
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
        <div
          className="order-3 hidden w-full md:order-1 md:flex md:w-auto md:items-center"
          id="menu"
        >
          <nav>
            <ul className="items-center justify-between pt-4 text-base font-semibold uppercase text-[#640000] md:flex md:pt-0">
              <li>
                <Link
                  className="inline-block px-4 py-2 no-underline hover:bg-[#640000] hover:text-[#EEEADC]"
                  href={"#store"}
                >
                  STORE
                </Link>
              </li>
              <li>
                <a
                  className="inline-block px-4 py-2 no-underline hover:bg-[#640000] hover:text-[#EEEADC]"
                  href="#about"
                >
                  ABOUT
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="order-2 flex items-center md:order-3" id="nav-content">
          {cartQuantity > 0 && <ShoppingCartDialog />}
        </div>
      </div>
    </nav>
  );
}
