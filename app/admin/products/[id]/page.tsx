"use client";

import {
  FormSection,
  createProductSchema,
} from "@/components/admin/FormSection";
import { useCallback, useEffect, useReducer } from "react";

interface ParamProps {
  id: string;
}

interface ProductDetailPageProps {
  params: ParamProps;
}

export default function ProjectDetailPage({ params }: ProductDetailPageProps) {
  const [response, setResponse] = useReducer(
    (prev: any, next: any) => {
      return { ...prev, ...next };
    },
    {
      loading: true,
      data: {},
    },
  );

  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`/api/products?id=${params.id}`).then(
        (res) => res.json(),
      );

      // TODO: Fix this validation error
      // Validation using Zod
      const value = createProductSchema.safeParse(response.data);
      if (!value.success) {
        console.error(value.error);
      }

      console.log(value);

      setResponse({ data: response.data, loading: false });
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, [params.id]);

  // Call fetchCustomers when component mounts
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  if (response.loading) {
    return <h1>Loading...</h1>;
  }

  return <FormSection id={params.id} value={response?.data} />;
}
