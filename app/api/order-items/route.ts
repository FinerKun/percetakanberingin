import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const tableName = "order-items";

export async function POST(request: Request) {
  const supabase = createClient();
  const data = await request.json();
  console.log("Data pesanan diterima:", JSON.stringify(data, null, 2));

  if (!data || data.length === 0) {
    console.error("Error: Pesanan kosong");
    return NextResponse.json({ error: "Pesanan kosong, tidak ada produk yang dipesan" }, { status: 400 });
  }

  const productIds = data.map((item: { uuid_product: string }) => item.uuid_product.trim());
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
    if ((product.stock || 0) < item.quantity) { // Pastikan stok tidak NULL
      console.error(`Error: Stok tidak mencukupi untuk produk ID ${item.uuid_product}`);
      return NextResponse.json({ error: `Stok tidak mencukupi untuk produk ID ${item.uuid_product}` }, { status: 400 });
    }
  }

  const updates = data.map((item: { uuid_product: string; quantity: number }) => {
    const product = products.find((p: { id: string; stock: number }) => p.id === item.uuid_product);
    const newStock = Math.max(0, (product?.stock || 0) - item.quantity); // Hindari NULL
    return {
      id: item.uuid_product,
      stock: newStock,
    };
  });


  console.log("Data yang dikirim untuk update stok:", JSON.stringify(updates, null, 2));

  const { error: updateError } = await supabase
    .from("products")
    .upsert(updates, { onConflict: "id" });

  if (updateError) {
    console.error("Error saat memperbarui stok produk:", updateError);
    return NextResponse.json({ error: "Gagal memperbarui stok produk" }, { status: 500 });
  }

  console.log("Stok produk berhasil diperbarui di database.");

  const { data: orderResponse, error: orderError } = await supabase.from(tableName).insert(data).select();

  if (orderError) {
    console.error("Error saat menyimpan pesanan:", orderError);
    return NextResponse.json({ error: "Gagal menyimpan pesanan" }, { status: 500 });
  }

  console.log("Pesanan berhasil disimpan:", orderResponse);
  return NextResponse.json({ success: true, message: "Pesanan berhasil", order: orderResponse });
}
