"use client";

import { Search, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ChangeEvent, useEffect, useReducer, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDebouncedCallback } from "use-debounce";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Page() {
  const [response, setResponse] = useReducer(
    (prev: any, next: any) => {
      return { ...prev, ...next };
    },
    {
      data: [],
      transactionsData: [],
      orderData: [],
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

  const fetchTransactions = async () => {
    setResponse({ loading: true });
    // TODO: I think we need to fix this limit :/
    const res = await fetch(`/api/transactions?limit=999`, {
      method: "GET",
    });
    const response = await res.json();

    setResponse({
      transactionsData: response.data,
      loading: false,
    });
  };

  const fetchOrderItems = async () => {
    setResponse({ loading: true });
    const res = await fetch(`/api/order-items`, {
      method: "GET",
    });
    const response = await res.json();

    setResponse({
      orderData: response.data,
      loading: false,
    });
  };

  useEffect(() => {
    fetchProducts();
    fetchTransactions();
    fetchOrderItems();
  }, []);

  const transactions = response.transactionsData;
  const items = response.orderData;
  const products = response.data;

  // TODO: Change types for this function
  let groupedTransactions: any = [];

  products.forEach((product: any) => {
    const transactionsForProduct = items
      .filter((item: any) => item.uuid_product === product.id)
      .map((item: any) => {
        const transaction = transactions.find(
          (transaction: any) => transaction.id === item.uuid_transactions,
        );
        return {
          ...transaction,
          product_quantity: item.product_quantity,
          label: item.label,
        };
      });

    groupedTransactions.push({
      id_product: product.id,
      name: product.name,
      img: product.img,
      price: product.price,
      data: transactionsForProduct,
    });
  });

  groupedTransactions = groupedTransactions.filter(
    (item: any) => item.data.length !== 0,
  );

  let customLabel: any = [];
  console.log("Ini data", groupedTransactions);
  groupedTransactions.map((item: any) => {
    customLabel.push(item.data[0].additional_forms);
  });
  console.log("Custom label:", customLabel);

  function formatCreatedAt(createdAt: string) {
    // Create a new Date object
    const date = new Date(createdAt);

    // Extract date components
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-based, so we add 1
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Format the components
    const formattedDate = `${day < 10 ? "0" : ""}${day}-${
      month < 10 ? "0" : ""
    }${month}-${year}, ${hours < 10 ? "0" : ""}${hours}:${
      minutes < 10 ? "0" : ""
    }${minutes}`;

    return formattedDate;
  }

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
          {groupedTransactions.length > 0 ? (
            <>
              {groupedTransactions.map(
                (
                  d: {
                    name: string;
                    id_product: string;
                    img: string;
                    price: number;
                    data: [];
                  },
                  i: number,
                ) => (
                  <Accordion
                    key={d.id_product}
                    className="mb-4 flex w-full items-center justify-between"
                    type="single"
                    collapsible
                  >
                    <AccordionItem value="item-1" className="w-full">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="mr-4 flex w-full items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Image
                              src={d.img}
                              alt={d.name}
                              className="h-16 w-16 rounded-xl border-2 object-cover"
                              width={64}
                              height={64}
                            />
                            <div className="text-left">
                              <h1 className="flex items-center gap-4 text-xl font-semibold">
                                {d.name}{" "}
                              </h1>
                              <p className="text-sm font-extralight text-gray-500">
                                {formatCurrency(d.price)}
                              </p>
                            </div>
                          </div>
                          <Badge className="h-fit" variant={"outline"}>
                            {d.data.length} Order
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="min-w-[150px]">
                                Tanggal Order
                              </TableHead>
                              <TableHead className="w-full min-w-[250px]">
                                Name
                              </TableHead>
                              <TableHead className="min-w-[150px]">
                                Phone
                              </TableHead>
                              <TableHead className="min-w-[250px]">
                                Alamat
                              </TableHead>
                              <TableHead className="min-w-[100px]">
                                Label
                              </TableHead>
                              {customLabel[i] !== null &&
                              customLabel[i] !== undefined
                                ? customLabel[i].map(
                                    (label: any, j: number) => (
                                      <TableHead
                                        key={j}
                                        className="min-w-[150px]"
                                      >
                                        {label[0]}
                                      </TableHead>
                                    ),
                                  )
                                : null}
                              <TableHead className="min-w-[150px]">
                                Notes
                              </TableHead>
                              <TableHead className="min-w-[80px] text-center">
                                Bukti Transfer
                              </TableHead>
                              <TableHead className="min-w-[80px] text-center">
                                Banyak Pesanan
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {d.data.map(
                              (t: {
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
                                product_quantity: number;
                                label: string;
                                additional_forms: string[];
                              }) => (
                                <TableRow key={t.id}>
                                  <TableCell className="">
                                    {formatCreatedAt(t.created_at)}
                                  </TableCell>
                                  <TableCell>{t.name}</TableCell>
                                  <TableCell>{t.phone}</TableCell>
                                  <TableCell>{t.address}</TableCell>
                                  <TableCell>{t.label}</TableCell>
                                  {t.additional_forms &&
                                  Array.isArray(t.additional_forms)
                                    ? t.additional_forms.map(
                                        (label: any, k: number) => (
                                          <TableCell key={k}>
                                            {label[1]}
                                          </TableCell>
                                        ),
                                      )
                                    : null}
                                  <TableCell>{t.notes}</TableCell>
                                  <TableCell className="text-center">
                                    <Link
                                      className="text-blue-500 hover:underline"
                                      target="_blank"
                                      href={t.proof_of_transaction_url}
                                    >
                                      Link
                                    </Link>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {t.product_quantity}
                                  </TableCell>
                                </TableRow>
                              ),
                            )}
                          </TableBody>
                        </Table>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ),
              )}
            </>
          ) : (
            <h1>No transaction found</h1>
          )}
        </>
      )}
    </>
  );
}
