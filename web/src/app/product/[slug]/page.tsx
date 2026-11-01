"use client";

import React, { use, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductViewClient from "@/components/ProductViewClient";

function ProductContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product-detail", slug],
    queryFn: async () => {
      const res = await fetch(`/api/products/${slug}`);
      if (!res.ok) throw new Error("Failed to load product");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium">Loading product details...</p>
      </div>
    );
  }

  if (isError || !data?.product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
        <h2 className="text-xl font-bold text-gray-900">Product Not Found</h2>
        <p className="text-sm">The product you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  return <ProductViewClient product={data.product} />;
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar searchQuery="" onSearchChange={() => {}} />
      <Suspense
        fallback={
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium">Loading product details...</p>
          </div>
        }
      >
        <ProductContent params={params} />
      </Suspense>
    </div>
  );
}
