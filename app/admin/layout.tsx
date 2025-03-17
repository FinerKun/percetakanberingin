import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

// component
import {
  NavigationHeading,
  SideNavigation,
} from "@/components/admin/Navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin | Percetakan Beringin",
  description: "Percetakan Beringin Admin Website",
};

interface LayoutProps {
  children: ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signOut = async () => {
    "use server";

    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect("/login");
  };

  if (!user) {
    return redirect("/login");
  }

  return (
    <main className="flex">
      <SideNavigation />
      <section className="w-full">
        <header className="fixed left-60 right-0 z-10 border-b bg-white p-3">
          <div className="container flex items-center justify-between">
            <div>
              <NavigationHeading />
            </div>
            <div className="flex justify-center gap-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={"outline"}>
                    <PlusIcon strokeWidth={1} size={20} className="mr-1" />{" "}
                    Create
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40" align="end">
                  <Link href={"/admin/products/create"}>
                    <DropdownMenuItem className="cursor-pointer text-gray-500">
                      New Products
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    Hey, {user.email?.substring(0, user.email?.indexOf("@"))}!
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem className="text-gray-500">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <form action={signOut}>
                    <button className="bg-btn-background block w-full rounded-md px-2 py-2 text-left text-sm no-underline hover:bg-gray-100">
                      Logout
                    </button>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <div className="absolute bottom-0 left-60 right-5 top-24">
          <div className="container pb-16">{children}</div>
        </div>
      </section>
    </main>
  );
}
