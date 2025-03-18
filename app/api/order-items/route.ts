import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const tableName = "order-items";

export async function GET(request: Request) {
  let response;
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const uuid_transactions = searchParams.get("uuid_transactions") || "";

  response = await supabase
    .from(tableName)
    .select()
    .ilike("uuid_transactions", `%${uuid_transactions}%`);

  return NextResponse.json(response);
}



interface OrderItem {
  product_id: number;
  quantity: number;
}

export async function POST(request: Request) {
  const supabase = createClient();
  const data: OrderItem[] = await request.json(); // Data berupa array berisi produk yang dipesan

  console.log("Data pesanan diterima:", data);

  // Ambil semua ID produk dari pesanan
  const productIds = data.map((item: OrderItem) => item.product_id);

  // Ambil stok produk dari database
  const { data: products, error } = await supabase
    .from("products")
    .select("id, stock")
    .in("id", productIds);

  if (error || !products) {
    return NextResponse.json({ error: "Gagal mengambil data produk" }, { status: 500 });
  }

  console.log("Data produk di database:", products);

  // Cek apakah stok cukup untuk semua produk
  for (const item of data) {
    const product = products.find(p => p.id === item.product_id);
    if (!product || product.stock < item.quantity) {
      return NextResponse.json({ error: `Stok tidak mencukupi untuk produk ID ${item.product_id}` }, { status: 400 });
    }
  }

  // Kurangi stok produk
  const updates = data.map((item: OrderItem) => {
    const product = products.find(p => p.id === item.product_id);
    return {
      id: item.product_id,
      stock: product!.stock - item.quantity,
    };
  });

  const { error: updateError } = await supabase
    .from("products")
    .upsert(updates, { onConflict: "id" }); // Perbaikan: Ubah onConflict menjadi string tunggal

  if (updateError) {
    return NextResponse.json({ error: "Gagal memperbarui stok produk" }, { status: 500 });
  }

  // Simpan semua order sekaligus
  const { data: orderResponse, error: orderError } = await supabase.from(tableName).insert(data).select();

  if (orderError) {
    return NextResponse.json({ error: "Gagal menyimpan pesanan" }, { status: 500 });
  }

  return NextResponse.json(orderResponse);
}


export async function PATCH(request: Request) {
  const supabase = createClient();
  const data = await request.json();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const response = await supabase
    .from(tableName)
    .update(data)
    .eq("id", id)
    .select()
    .single();

  return NextResponse.json(response);
}

export async function DELETE(request: Request) {
  const supabase = createClient();
  const data = await request.json();

  const response = await supabase.from(tableName).delete().eq("id", data.id);

  return NextResponse.json(response);
}
