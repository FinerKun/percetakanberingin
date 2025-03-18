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

export async function POST(request: Request) {
  const supabase = createClient();
  const data = await request.json();
  console.log("Data pesanan diterima:", JSON.stringify(data, null, 2));

  if (!data || data.length === 0) {
    console.error("Error: Pesanan kosong");
    return NextResponse.json({ error: "Pesanan kosong, tidak ada produk yang dipesan" }, { status: 400 });
  }

  const productIds = data.map((item: { uuid_product: string; }) => item.uuid_product.trim());
  console.log("Product UUIDs yang dikirim ke database:", productIds);

  const { data: products, error } = await supabase
    .from("products")
    .select("id, stock")
    .in("id", productIds);

  if (error) {
    console.error("Error mengambil data produk dari Supabase:", error);
    return NextResponse.json({ error: "Gagal mengambil data produk" }, { status: 500 });
  }

  if (!products || products.length === 0) {
    console.error("Error: Produk tidak ditemukan dalam database. Product IDs yang dikirim:", productIds);
    return NextResponse.json({ error: "Produk tidak ditemukan dalam database" }, { status: 404 });
  }

  for (const item of data) {
    const product = products.find(p => p.id === item.uuid_product);
    if (!product) {
      console.error(`Error: Produk ID ${item.uuid_product} tidak ditemukan dalam database`);
      return NextResponse.json({ error: `Produk ID ${item.uuid_product} tidak ditemukan dalam database` }, { status: 404 });
    }
    if (product.stock < item.quantity) {
      console.error(`Error: Stok tidak mencukupi untuk produk ID ${item.uuid_product}`);
      return NextResponse.json({ error: `Stok tidak mencukupi untuk produk ID ${item.uuid_product}` }, { status: 400 });
    }
  }

  const updates = data.map((item: { uuid_product: any; quantity: number; }) => {
    const product = products.find(p => p.id === item.uuid_product);
    return {
      id: item.uuid_product,
      stock: product ? Math.max(0, product.stock - item.quantity) : 0, // Mencegah stok menjadi NULL
    };
  });

  console.log("Update stok produk:", updates);

  const { error: updateError } = await supabase
    .from("products")
    .upsert(updates, { onConflict: "id" });

  if (updateError) {
    console.error("Error saat memperbarui stok produk:", updateError);
    return NextResponse.json({ error: "Gagal memperbarui stok produk" }, { status: 500 });
  }

  console.log("Stok berhasil diperbarui.");

  const { data: orderResponse, error: orderError } = await supabase.from(tableName).insert(data).select();

  if (orderError) {
    console.error("Error saat menyimpan pesanan:", orderError);
    return NextResponse.json({ error: "Gagal menyimpan pesanan" }, { status: 500 });
  }

  console.log("Pesanan berhasil disimpan:", orderResponse);
  return NextResponse.json({ success: true, message: "Pesanan berhasil", order: orderResponse });
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
    .select();

  return NextResponse.json(response);
}