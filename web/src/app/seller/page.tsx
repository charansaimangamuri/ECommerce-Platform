"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus, Package, DollarSign, ShoppingBag, Store, ExternalLink, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Navbar from "@/components/Navbar";

export default function SellerDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["seller-metrics"],
    queryFn: async () => {
      const res = await fetch("/api/seller/metrics");
      if (!res.ok) throw new Error("Failed to load seller metrics");
      return res.json();
    },
  });

  const products = data?.products || [];
  const totalRevenue = data?.totalRevenue || 0;
  const totalOrders = data?.totalOrders || 0;
  const activeProducts = data?.activeProducts || 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar searchQuery="" onSearchChange={() => {}} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Store className="w-6 h-6 text-indigo-600" />
              <h1 className="text-2xl font-black text-gray-900">Seller Dashboard</h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">Manage your merchant inventory, sales revenue, and incoming orders</p>
          </div>

          <Link
            href="/seller/new-product"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-200 transition-all hover:gap-3"
          >
            <Plus className="w-4 h-4" />
            List New Product
          </Link>
        </div>

        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium">Loading live seller metrics and inventory...</p>
          </div>
        ) : isError ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-red-600 text-sm font-bold text-center">
            Failed to load seller metrics. Please check your database connection.
          </div>
        ) : (
          <>
            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Revenue</span>
                  <p className="text-2xl font-black text-gray-900 mt-1">{formatPrice(totalRevenue)}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Orders Received</span>
                  <p className="text-2xl font-black text-gray-900 mt-1">{totalOrders}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Active Listings</span>
                  <p className="text-2xl font-black text-gray-900 mt-1">{activeProducts}</p>
                </div>
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Your Product Catalog</h2>
                <span className="text-xs text-gray-400">{products.length} items listed</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-3">Product</th>
                      <th className="px-6 py-3">Brand</th>
                      <th className="px-6 py-3">Base Price</th>
                      <th className="px-6 py-3">Variants</th>
                      <th className="px-6 py-3">Stock Count</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((p: any) => {
                      const totalStock = p.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
                      return (
                        <tr key={p._id.toString()} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                              <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-bold text-gray-900 truncate max-w-xs">{p.title}</span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-indigo-600">{p.brand}</td>
                          <td className="px-6 py-4 font-black text-gray-900">{formatPrice(p.basePrice)}</td>
                          <td className="px-6 py-4 text-gray-600">{p.variants?.length || 0} variant(s)</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              totalStock > 5 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                            }`}>
                              {totalStock} in stock
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/product/${p.slug}`}
                              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                            >
                              View Live <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
