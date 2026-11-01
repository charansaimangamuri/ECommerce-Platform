"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, ShoppingBag, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

export interface ProductData {
  _id: string;
  title: string;
  slug: string;
  brand: string;
  basePrice: number;
  discountPrice?: number;
  images: string[];
  variants: Array<{
    sku: string;
    color?: string;
    size?: string;
    price: number;
    stock: number;
    images?: string[];
  }>;
  ratingSummary: {
    average: number;
    totalReviews: number;
  };
  category?: {
    name: string;
    slug: string;
  };
}

export default function ProductCard({ product }: { product: ProductData }) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const activeVariant = product.variants[selectedVariantIndex] || {
    sku: `${product._id}-DEFAULT`,
    price: product.discountPrice || product.basePrice,
    stock: 10,
    color: "",
    size: "",
  };

  const currentPrice = activeVariant.price || product.discountPrice || product.basePrice;
  const originalPrice = product.basePrice;
  const hasDiscount = product.discountPrice && product.discountPrice < product.basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - (product.discountPrice || 0)) / originalPrice) * 100)
    : 0;

  const currentImage =
    (activeVariant.images && activeVariant.images[0]) ||
    product.images[0] ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product._id,
      variantSku: activeVariant.sku,
      title: product.title,
      brand: product.brand,
      color: activeVariant.color,
      size: activeVariant.size,
      price: currentPrice,
      image: currentImage,
      stock: activeVariant.stock,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Clickable Image -> Product Page */}
        <Link href={`/product/${product.slug}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
          <img
            src={currentImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {hasDiscount && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-extrabold px-2 py-1 rounded-md shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
          {product.category && (
            <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
              {product.category.name}
            </span>
          )}
        </Link>

        {/* Content */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-600 uppercase tracking-wider">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.ratingSummary.average.toFixed(1)}</span>
              <span className="text-gray-400">({product.ratingSummary.totalReviews})</span>
            </div>
          </div>

          {/* Clickable Title */}
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
              {product.title}
            </h3>
          </Link>

          {/* Variant Selector */}
          {product.variants.length > 1 && (
            <div className="pt-1 flex items-center gap-1.5 flex-wrap">
              {product.variants.map((v, idx) => (
                <button
                  key={v.sku}
                  onClick={() => setSelectedVariantIndex(idx)}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-md border transition-all ${
                    idx === selectedVariantIndex
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-bold"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {v.color || v.size || `Option ${idx + 1}`}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pricing & Add to Cart */}
      <div className="p-4 pt-0">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-black text-gray-900">{formatPrice(currentPrice)}</span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            isAdded
              ? "bg-emerald-600 text-white"
              : "bg-gray-900 hover:bg-indigo-600 text-white shadow-sm hover:shadow-indigo-200"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4" />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
