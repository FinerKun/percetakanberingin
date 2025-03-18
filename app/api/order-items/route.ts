import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const tableName = "order-items";

interface OrderItem {
  product_id: number;
  quantity: number;
}

export async function POST(request: Request) {
  const supabase = createClient();
  const data: OrderItem[] = await request.json(); // Data berupa array berisi produk yang dipesan

  console.log("Data pesanan diterima:", data);

  // Validasi: Cek apakah data kosong
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Pesanan kosong, tidak ada produk yang dipesan" }, { status: 400 });
  }

  // Ambil semua ID produk dari pesanan
  const productIds = data.map((item: OrderItem) => item.product_id);
  console.log("Product IDs yang diminta:", productIds);

  // Ambil stok produk dari database
  const { data: products, error } = await supabase
    .from("products")
    .select("id, stock")
    .in("id", productIds);

  if (error) {
    console.error("Error mengambil data produk:", error);
    return NextResponse.json({ error: "Gagal mengambil data produk" }, { status: 500 });
  }

  if (!products || products.length === 0) {
    return NextResponse.json({ error: "Produk tidak ditemukan dalam database" }, { status: 404 });
  }

  console.log("Data produk di database:", products);

  // Cek apakah stok cukup untuk semua produk
  for (const item of data) {
    const product = products.find(p => p.id === item.product_id);
    if (!product) {
      return NextResponse.json({ error: `Produk ID ${item.product_id} tidak ditemukan dalam database` }, { status: 404 });
    }
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: `Stok tidak mencukupi untuk produk ID ${item.product_id}` }, { status: 400 });
    }
  }

  // Kurangi stok produk
  const updates = data.map((item: OrderItem) => {
    const product = products.find(p => p.id === item.product_id);
    return {
      id: item.product_id,
      stock: product ? product.stock - item.quantity : 0,
    };
  });

  const { error: updateError } = await supabase
    .from("products")
    .upsert(updates, { onConflict: "id" }); // Perbaikan: Ubah onConflict menjadi string tunggal

  if (updateError) {
    console.error("Error saat memperbarui stok produk:", updateError);
    return NextResponse.json({ error: "Gagal memperbarui stok produk" }, { status: 500 });
  }

  // Simpan semua order sekaligus
  const { data: orderResponse, error: orderError } = await supabase.from(tableName).insert(data).select();

  if (orderError) {
    console.error("Error saat menyimpan pesanan:", orderError);
    return NextResponse.json({ error: "Gagal menyimpan pesanan" }, { status: 500 });
  }

  return NextResponse.json(orderResponse);
}
