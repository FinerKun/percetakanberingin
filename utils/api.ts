import { useState, useEffect } from "react";
import supabase from "@/utils/supabase";
import { ProductsProps } from "@/lib/types";

export function useFetchProducts() {
  const [products, setProducts] = useState<ProductsProps[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await supabase.from("products").select("*");
        if (data) {
          setProducts(data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }

    fetchProducts();
  }, []); // Empty dependency array means this effect runs only once

  return products;
}
