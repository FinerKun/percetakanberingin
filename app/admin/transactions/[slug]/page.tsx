"use client";

import { TransactionsItem } from "@/components/CartItem";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/formatCurrency";
import supabase from "@/utils/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useReducer } from "react";

interface ParamProps {
  slug: string;
}

interface ProductDetailPageProps {
  params: ParamProps;
}

type CartItem = {
  id: number;
  quantity: number;
  label: string;
};

export default function CustomersDetailPage({
  params,
}: ProductDetailPageProps) {
  const router = useRouter();
  const [response, setResponse] = useReducer(
    (prev: any, next: any) => {
      return { ...prev, ...next };
    },
    {
      loading: true,
      data: {},
      orderData: [],
    },
  );

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch(`/api/transactions?id=${params.slug}`).then(
        (res) => res.json(),
      );
      setResponse({ data: response.data, loading: false });
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  }, [params.slug]);

  // Call fetchCustomers when component mounts
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const fetchOrder = useCallback(async () => {
    setResponse({ loading: true });
    const res = await fetch(
      `/api/order-items?uuid_transactions=${params.slug}`,
      {
        method: "GET",
      },
    );
    const response = await res.json();

    let products: any = [];

    response.data.forEach((order: any) => {
      products.push({
        id: order.uuid_product,
        quantity: order.product_quantity,
        label: order.label,
      });
    });

    setResponse({
      orderData: products,
      loading: false,
    });
  }, [params.slug]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (response.loading) {
    return <h1>Loading...</h1>;
  }

  // Create a new Date object
  const date = new Date(response.data.created_at);

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

  async function updateTransactions(transactionsId: string) {
    const { error } = await supabase
      .from("transactions")
      .update({ status: "Completed" })
      .eq("id", transactionsId);

    if (error) {
      console.log(error);
    } else {
      router.push("/admin/transactions");
    }
  }

  console.log(response.data.additional_forms);

  return (
    <>
      <section className="space-y-4">
        <div className="_TANGGAL_PEMBELIAN flex justify-between">
          <h1>Tanggal Pembelian</h1>
          <p>{formattedDate}</p>
        </div>
        <Separator />
        <div className="space-y-4">
          <h1 className="font-semibold">Detail Produk</h1>
          <ul className="space-y-4">
            {response.orderData.map((item: CartItem) => (
              <TransactionsItem key={item.id} {...item} />
            ))}
          </ul>
          <Separator />
          <div className="flex w-full justify-between font-semibold">
            <h1 className="font-normal">Total Harga</h1>
            {formatCurrency(response.data.total_price)}
          </div>
        </div>
        <Separator />
        <div className="_STATUS flex">
          <h1 className="min-w-64 flex-initial">Status</h1>
          <Badge variant="default">{response.data.status}</Badge>
        </div>
        <div className="_NAMA_PEMBELI flex">
          <h1 className="min-w-64 flex-initial">Nama Pembeli</h1>
          <p>{response.data.name}</p>
        </div>
        <div className="_NAMA_PEMBELI flex">
          <h1 className="min-w-64 flex-initial">Nomor Telepon</h1>
          <p>{response.data.phone}</p>
        </div>
        <div className="_ALAMAT flex">
          <h1 className="min-w-64 flex-initial">Alamat</h1>
          <p>{response.data.address}</p>
        </div>
        <div className="_ALAMAT flex">
          <h1 className="min-w-64 flex-initial">Notes</h1>
          <p>{response.data.notes}</p>
        </div>
        {response.data.additional_forms !== null &&
          response.data.additional_forms.map((form: any, i: number) => (
            <div className="_CUSTOM_FORM flex" key={i}>
              <h1 className="min-w-64 flex-initial">{form[0]}</h1>
              <p>{form[1]}</p>
            </div>
          ))}
        <div className="_BUKTI_TRANSFER flex">
          <h1 className="min-w-64 flex-initial">Bukti Transfer</h1>
          <div className="relative aspect-square w-full overflow-clip rounded-xl border">
            <Image
              src={response.data.proof_of_transaction_url}
              alt={response.data.notes}
              className="object-contain"
              placeholder="empty"
              fill
              sizes="fill"
            />
          </div>
        </div>
        <Separator />
        <div className="flex justify-end">
        <Button
  onClick={() => {
    if (!response || !response.data || !response.data.id) {
      console.error("Error: response.data.id tidak ditemukan", response);
      alert("Gagal memperbarui transaksi. Coba lagi nanti.");
      return;
    }
    updateTransactions(response.data.id);
  }}
>
  Set as completed
</Button>

        </div>
      </section>
    </>
  );
}
