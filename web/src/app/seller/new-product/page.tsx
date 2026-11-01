"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PackagePlus,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  Sliders,
  Loader2,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function NewProductPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [categorySlug, setCategorySlug] = useState("laptops");
  const [basePrice, setBasePrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80");

  // Dynamic Variants state
  const [variants, setVariants] = useState<Array<{ sku: string; color: string; size: string; price: number; stock: number }>>([
    { sku: "DEMO-VAR-01", color: "Space Black", size: "Standard", price: 99990, stock: 15 },
  ]);

  // Dynamic Technical Specs state
  const [specsList, setSpecsList] = useState<Array<{ key: string; value: string }>>([
    { key: "Warranty", value: "1 Year Official Brand Warranty" },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { sku: `SKU-${Date.now().toString().slice(-4)}`, color: "", size: "", price: Number(basePrice) || 0, stock: 10 },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const addSpec = () => {
    setSpecsList((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeSpec = (index: number) => {
    setSpecsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Convert specs array to object
      const specsObj: Record<string, string> = {};
      specsList.forEach((s) => {
        if (s.key.trim() && s.value.trim()) {
          specsObj[s.key.trim()] = s.value.trim();
        }
      });

      const payload = {
        title,
        brand,
        categorySlug,
        basePrice: Number(basePrice),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        description,
        images: [imageUrl],
        variants: variants.map((v) => ({
          ...v,
          price: Number(v.price) || Number(basePrice),
          stock: Number(v.stock) || 0,
        })),
        specs: specsObj,
      };

      const res = await fetch("/api/seller/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to publish product");
        setLoading(false);
        return;
      }

      router.push("/seller");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar searchQuery="" onSearchChange={() => {}} />

      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <PackagePlus className="w-6 h-6 text-indigo-600" />
              List New Product
            </h1>
            <p className="text-xs text-gray-500 mt-1">Publish a new item with variants to the ShopSphere marketplace</p>
          </div>
          <Link
            href="/seller"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Seller Hub
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-600">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Basic Information */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 uppercase tracking-wider">
              1. Basic Product Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Product Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dell XPS 15 InfinityEdge Touchscreen Laptop"
                  className="mt-1 w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Brand Name
                </label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Dell, Samsung, Puma"
                  className="mt-1 w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  className="mt-1 w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 bg-white"
                >
                  <option value="laptops">Laptops</option>
                  <option value="audio-headphones">Audio & Headphones</option>
                  <option value="footwear">Footwear</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Base Price (₹)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="129990"
                  className="mt-1 w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Discount Price (₹) <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="119990"
                  className="mt-1 w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Image CDN URL
                </label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="mt-1 w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter detailed description, key highlights, and warranty details..."
                  className="mt-1 w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Variants Builder (Colors, Sizes, Stock) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                2. Product Variants (Editions, Colors & Stock)
              </h2>
              <button
                type="button"
                onClick={addVariant}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Variant
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex flex-wrap gap-3 items-center">
                  <input
                    type="text"
                    required
                    placeholder="SKU"
                    value={v.sku}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].sku = e.target.value;
                      setVariants(updated);
                    }}
                    className="w-28 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Color (e.g. Silver)"
                    value={v.color}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].color = e.target.value;
                      setVariants(updated);
                    }}
                    className="w-32 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Size / Edition"
                    value={v.size}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].size = e.target.value;
                      setVariants(updated);
                    }}
                    className="w-28 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
                  />
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={v.price}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].price = Number(e.target.value);
                      setVariants(updated);
                    }}
                    className="w-24 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={v.stock}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].stock = Number(e.target.value);
                      setVariants(updated);
                    }}
                    className="w-20 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
                  />
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Dynamic Technical Specifications */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                3. Technical Specifications (Key-Value)
              </h2>
              <button
                type="button"
                onClick={addSpec}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Spec
              </button>
            </div>

            <div className="space-y-3">
              {specsList.map((s, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Feature (e.g. RAM, Battery, Material)"
                    value={s.key}
                    onChange={(e) => {
                      const updated = [...specsList];
                      updated[idx].key = e.target.value;
                      setSpecsList(updated);
                    }}
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 16GB LPDDR5X, 5000 mAh)"
                    value={s.value}
                    onChange={(e) => {
                      const updated = [...specsList];
                      updated[idx].value = e.target.value;
                      setSpecsList(updated);
                    }}
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(idx)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-200 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Publishing product & clearing cache...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" /> Publish Product to Storefront
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
