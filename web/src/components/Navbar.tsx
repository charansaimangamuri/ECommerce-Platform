"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Search, Sparkles, User, LogOut, Store } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useSession, signOut } from "@/lib/auth-client";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Navbar({ searchQuery, onSearchChange }: NavbarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [mounted, setMounted] = useState(false);

  const totalItems = useCartStore((state) => state.getTotalItems());
  const openDrawer = useCartStore((state) => state.openDrawer);

  const { data: session } = useSession();

  // Prevent SSR hydration mismatch with localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
  };

  const user = session?.user as any;
  const isSeller = user?.role === "seller";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">
            Shop<span className="text-indigo-600">Sphere</span>
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative">
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search products, brands, electronics, shoes..."
            className="w-full pl-10 pr-24 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all text-sm text-gray-800 placeholder-gray-400"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-semibold transition-colors"
          >
            Search
          </button>
        </form>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-gray-900">{user.name}</span>
                <span className="text-[10px] font-semibold text-indigo-600 uppercase">
                  {user.role || "buyer"}
                </span>
              </div>

              {isSeller && (
                <Link
                  href="/seller"
                  className="hidden md:flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  <Store className="w-3.5 h-3.5" />
                  Seller Hub
                </Link>
              )}

              <button
                onClick={() => signOut()}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="text-xs font-bold text-gray-700 hover:text-indigo-600 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-1.5"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Cart Drawer Trigger */}
          <button
            onClick={openDrawer}
            className="relative p-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2"
            aria-label="View shopping cart"
          >
            <ShoppingCart className="w-6 h-6" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
