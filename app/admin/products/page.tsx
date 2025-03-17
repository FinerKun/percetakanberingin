"use client";

import {
  TrashIcon,
  RefreshCcw,
  Search,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ChangeEvent, useEffect, useReducer, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDebouncedCallback } from "use-debounce";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { formatCurrency } from "@/utils/formatCurrency";

export default function Page() {
  const [loading, setLoading] = useState(false);

  const [response, setResponse] = useReducer(
    (prev: any, next: any) => {
      return { ...prev, ...next };
    },
    {
      data: [],
      loading: true,
      searchTerm: "",
      page: 0,
    },
  );

  const handleSearch = useDebouncedCallback((term) => {
    console.log(`Searching... ${term}`);
    fetchProducts(term);
  }, 1000);

  const fetchProducts = async (value: string = "", page: number = 0) => {
    setResponse({ loading: true });
    const res = await fetch(
      `/api/products?term=${value}&page=${page}&limit=20`,
      {
        method: "GET",
      },
    );
    const response = await res.json();

    setResponse({
      data: response.data,
      loading: false,
    });
  };

  const deleteProject = async (id: string) => {
    setLoading(true);
    const res = await fetch("/api/products", {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    const response = await res.json();
    if (response?.status === 204) {
      // Reload the list data
      fetchProducts();
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <>
      <section className="mb-5 flex justify-between">
        <div className="_SEARCH_INPUT relative flex items-center">
          <Search size={20} className="absolute left-2 text-gray-400" />
          <Input
            type="text"
            placeholder="Enter products name"
            className="pl-10"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setResponse({ searchTerm: e.target.value });
              handleSearch(e.target.value);
            }}
          />
        </div>
        <div className="_PAGINATION_ICON text-right">
          <Button
            disabled={response.page === 0 ? true : false}
            variant="outline"
            size="icon"
            onClick={() => {
              const page = response.page - 1;
              setResponse({ page });
              fetchProducts(response.term, page);
            }}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const page = response.page + 1;
              setResponse({ page });
              fetchProducts(response.term, page);
            }}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </section>
      {response.loading ? (
        <div className="space-y-4">
          <div className="flex h-16 items-center gap-2">
            <Skeleton className="h-full w-16 bg-slate-200" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-[250px] bg-slate-200" />
              <Skeleton className="h-4 w-[200px] bg-slate-200" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {response.data.length > 0 ? (
            <>
              {response.data.map(
                (d: {
                  name: string;
                  id: string;
                  img: string;
                  description: string;
                  price: number;
                  stock: number;
                }) => (
                  <div
                    key={d.id}
                    className="group mb-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <Image
                        src={d.img}
                        alt={d.description}
                        className="h-16 w-16 rounded-xl border-2 object-cover"
                        width={64}
                        height={64}
                      />
                      <div>
                        <Link
                          className="text-xl font-semibold hover:underline"
                          href={`/admin/products/${d.id}`}
                        >
                          {d.name}
                        </Link>
                        <p className="text-sm font-extralight text-gray-500">
                          {formatCurrency(d.price)} | Stock: {d.stock}
                        </p>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-90">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant={"outline"} size={"icon"}>
                            <TrashIcon />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Delete confirmation?</DialogTitle>
                            <DialogDescription>
                              Make sure you want to delete <b>{d.name}</b>?
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="mt-5">
                            <Button
                              onClick={() => {
                                deleteProject(d.id);
                              }}
                              variant={"destructive"}
                            >
                              {loading ? (
                                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                "Delete"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ),
              )}
            </>
          ) : (
            <h1>No data found</h1>
          )}
        </>
      )}
    </>
  );
}
