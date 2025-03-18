import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const tableName = "order-items";

export async function POST(request: Request) {
  const supabase = createClient();
  const data = await request.json();

  console.log("Data pesanan diterima:", data);

  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Pesanan kosong" }, { status: 400 });
  }

  // Ambil semua ID produk yang dipesan
  const productIds = data.map((item: { uuid_product: string }) => item.uuid_product);
  console.log("Product UUIDs:", productIds);

  // Ambil stok produk dari database
  const { data: products, error } = await supabase
    .from("products")
    .select("id, stock")
    .in("id", productIds);

  if (error || !products) {
    console.error("Gagal mengambil data produk:", error);
    return NextResponse.json({ error: "Gagal mengambil data produk" }, { status: 500 });
  }

  console.log("Data produk di database:", products);

  // Cek apakah stok cukup untuk setiap produk
  for (const item of data) {
    const product = products.find(p => p.id === item.uuid_product);
    if (!product) {
      return NextResponse.json({ error: `Produk ID ${item.uuid_product} tidak ditemukan` }, { status: 404 });
    }
    if ((product.stock ?? 0) < item.product_quantity) { // Pastikan stok tidak NULL
      return NextResponse.json({ error: `Stok tidak mencukupi untuk produk ID ${item.uuid_product}` }, { status: 400 });
    }
  }

  // Kurangi stok produk
  const updates = data.map((item: { uuid_product: string, product_quantity: number }) => {
    const product = products.find(p => p.id === item.uuid_product);
    const newStock = Math.max(0, (product?.stock ?? 0) - item.product_quantity); // Hindari NULL
    return {
      id: item.uuid_product,
      stock: newStock,
    };
  });

  console.log("Update stok produk:", updates);

  // Perbarui stok di database
  const { error: updateError } = await supabase
    .from("products")
    .upsert(updates, { onConflict: "id" });

  if (updateError) {
    console.error("Gagal memperbarui stok produk:", updateError);
    return NextResponse.json({ error: "Gagal memperbarui stok produk" }, { status: 500 });
  }

  console.log("Stok produk berhasil diperbarui.");

  // Simpan order ke database
  const { data: orderResponse, error: orderError } = await supabase.from(tableName).insert(data).select();

  if (orderError) {
    console.error("Gagal menyimpan pesanan:", orderError);
    return NextResponse.json({ error: "Gagal menyimpan pesanan" }, { status: 500 });
  }

  console.log("Pesanan berhasil disimpan:", orderResponse);
  return NextResponse.json({ success: true, message: "Pesanan berhasil", order: orderResponse });
}
