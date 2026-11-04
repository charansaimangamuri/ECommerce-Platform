"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Star,
  ShoppingBag,
  ShieldCheck,
  RotateCcw,
  Truck,
  Check,
  ChevronRight,
  Store,
  Layers,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import CartDrawer from "@/components/CartDrawer";

interface ProductViewProps {
  product: {
    _id: string;
    title: string;
    slug: string;
    description: string;
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
      images: string[];
    }>;
    specs: Record<string, string>;
    ratingSummary: {
      average: number;
      totalReviews: number;
    };
    category?: {
      name: string;
      slug: string;
    };
    seller?: {
      name: string;
      storeName?: string;
      isSellerVerified?: boolean;
    };
  };
}

interface RecommendedProduct {
  id: string;
  title: string;
  slug: string;
  brand: string;
  basePrice: number;
  discountPrice?: number;
  images: string[];
  rating: number;
  totalReviews: number;
  matchScore: number;
  matchReason: string;
}

export default function ProductViewClient({ product }: ProductViewProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  // Fetch recommendations from FastAPI microservice (port 8000)
  const { data: recommendations = [], isLoading: loadingRecs } = useQuery<RecommendedProduct[]>({
    queryKey: ["recommendations", product._id],
    queryFn: async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/recommendations/${product._id}`);
        if (!res.ok) return [];
        return res.json();
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
  });

  const activeVariant = product.variants[selectedVariantIndex] || {
    sku: `${product._id}-DEFAULT`,
    price: product.discountPrice || product.basePrice,
    stock: 10,
    color: "",
    size: "",
    images: product.images,
  };

  const allImages =
    activeVariant.images && activeVariant.images.length > 0
      ? activeVariant.images
      : product.images;

  const currentImage = allImages[activeImageIndex] || allImages[0];
  const currentPrice = activeVariant.price || product.discountPrice || product.basePrice;
  const originalPrice = product.basePrice;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
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
    }

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="flex-1 flex flex-col">
      <CartDrawer />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          {product.category && (
            <>
              <Link href={`/?category=${product.category.slug}`} className="hover:text-indigo-600 transition-colors">
                {product.category.name}
              </Link>
              <ChevronRight className="w-3 h-3 text-gray-400" />
            </>
          )}
          <span className="text-gray-900 truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 sm:p-10 rounded-3xl border border-gray-200 shadow-sm">
          {/* Left: Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center relative">
              {currentImage ? (
                <img src={currentImage} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-sm">No Image</span>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImageIndex === idx ? "border-indigo-600 scale-105" : "border-gray-200 opacity-70"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & Actions */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">{product.brand}</span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 leading-tight">{product.title}</h1>

              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {product.ratingSummary.average}
                </div>
                <span className="text-xs text-gray-500">({product.ratingSummary.totalReviews} verified reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-2 border-t border-gray-100">
              <span className="text-3xl font-black text-gray-900">{formatPrice(currentPrice)}</span>
              {originalPrice > currentPrice && (
                <span className="text-sm font-semibold text-gray-400 line-through">{formatPrice(originalPrice)}</span>
              )}
            </div>

            {/* Variants */}
            {product.variants.length > 1 && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">Choose Variant / Model</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v, i) => (
                    <button
                      key={v.sku}
                      onClick={() => {
                        setSelectedVariantIndex(i);
                        setActiveImageIndex(0);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedVariantIndex === i
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {v.color} {v.size ? `(${v.size})` : ""} - {formatPrice(v.price)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center border border-gray-200 rounded-2xl bg-gray-50 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isAdded
                    ? "bg-emerald-600 text-white shadow-emerald-200"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Shopping Cart
                  </>
                )}
              </button>
            </div>

            {/* Badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 text-[11px] text-gray-600 font-medium">
              <div className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-indigo-600" /> Free Delivery</div>
              <div className="flex items-center gap-1.5"><RotateCcw className="w-4 h-4 text-indigo-600" /> 7-Day Returns</div>
              <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-indigo-600" /> Authentic</div>
            </div>
          </div>
        </div>

        {/* Specifications & Seller Card */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" /> Technical Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 text-xs">
                  <span className="font-semibold text-gray-500">{key}</span>
                  <span className="font-bold text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NEW: AI Recommendations Carousel powered by FastAPI Microservice */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Recommended For You</h3>
                <p className="text-xs text-gray-500">Curated by our FastAPI content-based matching engine</p>
              </div>
            </div>
          </div>

          {loadingRecs ? (
            <div className="h-40 flex items-center justify-center bg-white rounded-3xl border border-gray-100">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((rec) => (
                <Link
                  key={rec.id}
                  href={`/product/${rec.slug}`}
                  className="group bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-purple-200 transition-all flex flex-col p-4 space-y-3"
                >
                  <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative">
                    {rec.images && rec.images[0] ? (
                      <img src={rec.images[0]} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                    )}
                    <span className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                      {rec.matchScore}% Match
                    </span>
                  </div>

                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">{rec.brand}</span>
                    <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-purple-600 transition-colors">
                      {rec.title}
                    </h4>
                    <span className="inline-block text-[10px] text-gray-400 font-medium">{rec.matchReason}</span>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-black text-gray-900">{formatPrice(rec.discountPrice || rec.basePrice)}</span>
                    <span className="text-xs font-bold text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      View <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-white rounded-3xl border border-gray-100 text-center text-xs text-gray-400">
              Browse more products to unlock personalized recommendations.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
