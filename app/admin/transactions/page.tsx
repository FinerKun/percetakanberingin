"use client";

import {
  RefreshCcw,
  Search,
  ChevronLeftIcon,
  ChevronRightIcon,
  Ellipsis,
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    fetchTransactions(term);
  }, 1000);

  const fetchTransactions = async (value: string = "", page: number = 0) => {
    setResponse({ loading: true });
    const res = await fetch(
      `/api/transactions?term=${value}&page=${page}&limit=20`,
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

  const deleteTransactions = async (
    id: string,
    proof_of_transaction_url: string,
  ) => {
    setLoading(true);
    const res = await fetch("/api/transactions", {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ id, proof_of_transaction_url }),
    });
    const response = await res.json();
    if (response?.status === 204) {
      // Reload the list data
      fetchTransactions();
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
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
              fetchTransactions(response.term, page);
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
              fetchTransactions(response.term, page);
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
              <Table>
                <TableCaption>A list of your recent invoices.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="">Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="w-[115px]">Bukti Transfer</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {response.data.map(
                    (d: {
                      id: string;
                      name: string;
                      phone: string;
                      notes: string;
                      status: string;
                      created_at: string;
                      address: string;
                      proof_of_transaction_url: string;
                      transaction_items: string;
                      total_price: number;
                    }) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.name}</TableCell>
                        <TableCell>{d.status}</TableCell>
                        <TableCell>{d.phone}</TableCell>
                        <TableCell className="text-center">
                          <Link
                            className="text-blue-500 hover:underline"
                            target="_blank"
                            href={d.proof_of_transaction_url}
                          >
                            Link
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant={"ghost"} size={"icon"}>
                                  <Ellipsis
                                    strokeWidth={1}
                                    size={20}
                                    className="mr-1"
                                  />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-40" align="end">
                                <Link href={`/admin/transactions/${d.id}`}>
                                  <DropdownMenuItem className="cursor-pointer text-gray-500">
                                    Details
                                  </DropdownMenuItem>
                                </Link>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem className="h-full w-full cursor-pointer text-red-500 hover:bg-red-100">
                                    Delete
                                  </DropdownMenuItem>
                                </DialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
                                    deleteTransactions(
                                      d.id,
                                      d.proof_of_transaction_url,
                                    );
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
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </>
          ) : (
            <h1>No data found</h1>
          )}
        </>
      )}
    </>
  );
}
