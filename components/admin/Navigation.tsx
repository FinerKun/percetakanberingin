"use client";

import Link from "next/link";
import { ShoppingBasket, User, HomeIcon } from "lucide-react";
import { usePathname } from "next/navigation";

export function SideNavigation() {
  const path = usePathname();

  return (
    <aside className="fixed bottom-0 left-0 top-0 h-screen w-60 border-r border-gray-300 bg-white p-5">
      <div>
        <Link href={"/admin"} className="px-4 text-lg font-bold uppercase">
          EKRAF&lsquo;S THINGS
        </Link>
      </div>
      <div className="mt-5">
        <ul>
          <li className="mb-2">
            <Link
              href={"/admin/dashboard"}
              className={`${
                path === "/admin/dashboard" ? "bg-slate-100 font-semibold" : ""
              } flex items-center gap-2 rounded px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800`}
            >
              <HomeIcon size={20} />
              Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href={"/admin/products"}
              className={`${
                path === "/admin/products" ? "bg-slate-100 font-semibold" : ""
              } flex items-center gap-2 rounded px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800`}
            >
              <ShoppingBasket size={20} />
              Products
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href={"/admin/transactions"}
              className={`${
                path === "/admin/transactions"
                  ? "bg-slate-100 font-semibold"
                  : ""
              } flex items-center gap-2 rounded px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800`}
            >
              <User size={20} />
              Transactions
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}

export function NavigationHeading() {
  const path = usePathname();
  const pageNames = path.split("/");
  const heading = pageNames.length > 2 ? pageNames[2] : pageNames[1];

  return <h1 className="text-lg font-semibold capitalize">{heading}</h1>;
}
