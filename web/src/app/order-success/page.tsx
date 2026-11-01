"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, ArrowRight, Truck, FileText, Download } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Navbar from "@/components/Navbar";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "ORD-DEMO";
  const total = Number(searchParams.get("total")) || 0;

  // Direct download link to our Spring Boot Java Microservice on port 8080
  const invoiceDownloadUrl = `http://localhost:8080/api/invoices/${orderNumber}/pdf`;

  return (
    <div className="max-w-xl mx-auto my-auto p-8 sm:p-10 bg-white rounded-3xl border border-gray-200 shadow-xl text-center space-y-6">
      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50/50">
        <CheckCircle className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Order Confirmed
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          Thank you for your order!
        </h1>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          We have received your order and will dispatch it shortly. Stock has been atomically secured.
        </p>
      </div>

      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
        <div className="text-left">
          <span className="text-gray-400 block text-[10px] uppercase font-bold">Order ID</span>
          <span className="font-mono font-bold text-gray-900">{orderNumber}</span>
        </div>
        <div className="text-right">
          <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Paid</span>
          <span className="font-black text-indigo-600 text-sm">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Spring Boot Microservice Integration: Download PDF Invoice */}
      <a
        href={invoiceDownloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all hover:gap-3"
      >
        <FileText className="w-4 h-4 text-indigo-600" />
        Download Official Tax Invoice (PDF)
        <Download className="w-3.5 h-3.5 ml-auto text-indigo-400" />
      </a>

      <div className="flex items-center gap-3 p-3 text-left bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-700">
        <Truck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
        <div>
          <span className="font-bold block">Estimated Delivery</span>
          <span className="text-[10px] text-gray-500">Arriving in 3-5 business days with free tracking</span>
        </div>
      </div>

      <Link
        href="/"
        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:gap-3"
      >
        <Package className="w-4 h-4" />
        Continue Shopping
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar searchQuery="" onSearchChange={() => {}} />
      <main className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={<p className="text-xs text-gray-400">Loading order summary...</p>}>
          <OrderSuccessContent />
        </Suspense>
      </main>
    </div>
  );
}
