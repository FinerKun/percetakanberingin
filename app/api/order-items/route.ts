import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const tableName = "order-items";

interface OrderItem {
  uuid_product: string; // Pastikan ini tetap string, lalu ubah ke UUID dalam query
  quantity: number;
}

export async function POST(request: Request) {
  const supabase = createClient();
  try {
    const data: OrderItem[] = await request.json();
    console.log("Data pesanan diterima:", JSON.stringify(data, null, 2));

    if (!data || data.length === 0) {
      console.error("Error: Pesanan kosong");
      return NextResponse.json({ error: "Pesanan kosong, tidak ada produk yang dipesan" }, { status: 400 });
    }

    const productIds = data.map((item) => item.uuid_product);
    console.log("Product UUIDs yang dikirim ke database:", productIds);

    if (productIds.length === 0) {
      console.error("Error: Tidak ada Product ID yang dikirim!");
      return NextResponse.json({ error: "Tidak ada Product ID yang dikirim" }, { status: 400 });
    }

    // Konversi productIds dari string ke UUID untuk Supabase
    const formattedProductIds = productIds.map(id => id.trim());

    const { data: products, error } = await supabase
      .from("products")
      .select("id, stock")
      .in("id", formattedProductIds);

    if (error) {
      console.error("Error mengambil data produk dari Supabase:", error);
      return NextResponse.json({ error: "Gagal mengambil data produk" }, { status: 500 });
    }

    if (!products || products.length === 0) {
      console.error("Error: Produk tidak ditemukan dalam database. Product IDs yang dikirim:", formattedProductIds);
      return NextResponse.json({ error: "Produk tidak ditemukan dalam database" }, { status: 404 });
    }

    console.log("Data produk yang ditemukan di database:", products);

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

    const updates = data.map((item) => {
      const product = products.find(p => p.id === item.uuid_product);
      return {
        id: item.uuid_product,
        stock: product ? product.stock - item.quantity : 0,
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
    return NextResponse.json(orderResponse);
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan di server" }, { status: 500 });
  }
}
