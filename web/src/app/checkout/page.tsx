"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useSession } from "@/lib/auth-client";
import { formatPrice } from "@/lib/utils";
import Navbar from "@/components/Navbar";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const { items, getTotalPrice, clearCart } = useCartStore();

  const user = session?.user as any;

  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH_ON_DELIVERY" | "ONLINE_CARD">("CASH_ON_DELIVERY");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setMounted(true);
    if (user) {
      if (user.name) setFullName(user.name);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  const totalPrice = getTotalPrice();

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar searchQuery="" onSearchChange={() => {}} />
        <div className="max-w-md mx-auto my-auto p-8 text-center bg-white rounded-3xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="text-xs text-gray-500 mt-2 mb-6">
            Please add some products before heading to checkout.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        buyerName: fullName,
        buyerEmail: email,
        items: items.map((i) => ({
          productId: i.productId,
          variantSku: i.variantSku,
          title: i.title,
          color: i.color,
          size: i.size,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        shippingAddress: {
          fullName,
          street,
          city,
          state,
          zipCode,
          phone,
          country: "India",
        },
        paymentMethod,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Order placement failed");
        setLoading(false);
        return;
      }

      clearCart();
      router.push(`/order-success?orderNumber=${data.orderNumber}&total=${data.totalAmount}`);
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar searchQuery="" onSearchChange={() => {}} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Secure Checkout</h1>
            <p className="text-xs text-gray-500 mt-1">Review your items and enter shipping details</p>
          </div>
          <Link
            href="/"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </Link>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-600">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Truck className="w-5 h-5 text-indigo-600" />
                Shipping & Delivery Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="mt-1 w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="mt-1 w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Street Address / House No.
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Flat 402, Outer Ring Rd"
                    className="mt-1 w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bengaluru"
                    className="mt-1 w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Karnataka"
                    className="mt-1 w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    PIN / ZIP Code
                  </label>
                  <input
                    type="text"
                    required
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="560103"
                    className="mt-1 w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="mt-1 w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                  className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all ${
                    paymentMethod === "CASH_ON_DELIVERY"
                      ? "border-indigo-600 bg-indigo-50/50 text-indigo-900"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Banknote className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold block">Cash on Delivery</span>
                    <span className="text-[10px] text-gray-500">Pay cash or UPI at delivery doorstep</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("ONLINE_CARD")}
                  className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all ${
                    paymentMethod === "ONLINE_CARD"
                      ? "border-indigo-600 bg-indigo-50/50 text-indigo-900"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold block">Online Card Payment</span>
                    <span className="text-[10px] text-gray-500">Instant prepaid card authorization</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Order Items ({items.length})
            </h2>

            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.variantSku} className="py-3 flex gap-3 items-center">
                  <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{item.title}</h4>
                    <p className="text-[10px] text-gray-500">
                      Qty: {item.quantity} {item.color && `• ${item.color}`} {item.size && `• ${item.size}`}
                    </p>
                    <p className="text-xs font-black text-gray-900 mt-0.5">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Standard Delivery</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-100">
                <span>Total Due</span>
                <span className="text-indigo-600">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying stock & placing order...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Place Order • {formatPrice(totalPrice)}
                </>
              )}
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-Bit SSL Encrypted & Atomic Stock Guaranteed</span>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
