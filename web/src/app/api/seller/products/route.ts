import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import User from "@/models/User";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    // 1. Authenticate Seller using Better Auth Server API
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    let sellerId = session?.user?.id;

    // Fallback for demo testing if not logged in
    if (!sellerId) {
      const demoSeller = await User.findOne({ role: "seller" });
      if (demoSeller) sellerId = demoSeller._id.toString();
    }

    if (!sellerId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in as a Seller." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, description, brand, categorySlug, basePrice, discountPrice, images, variants, specs } = body;

    if (!title || !description || !brand || !basePrice || !categorySlug) {
      return NextResponse.json(
        { error: "Please fill in all required fields (title, brand, category, price, description)." },
        { status: 400 }
      );
    }

    // 2. Find Category by Slug
    const categoryDoc = await Category.findOne({ slug: categorySlug });
    if (!categoryDoc) {
      return NextResponse.json({ error: "Invalid category selected" }, { status: 400 });
    }

    // 3. Generate Clean SEO Slug (e.g. "iPhone 15 Pro Max" -> "iphone-15-pro-max-8239")
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const uniqueSlug = `${baseSlug}-${Math.floor(Math.random() * 9000 + 1000)}`;

    // 4. Create Product Document in MongoDB
    const newProduct = await Product.create({
      title,
      slug: uniqueSlug,
      description,
      brand,
      category: categoryDoc._id,
      seller: sellerId,
      basePrice: Number(basePrice),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      images: images && images.length > 0 ? images : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"],
      variants: variants && variants.length > 0 ? variants : [
        {
          sku: `${uniqueSlug.toUpperCase()}-STD`,
          price: Number(basePrice),
          stock: 20,
          images: images || [],
        },
      ],
      specs: specs || {},
      ratingSummary: { average: 5.0, totalReviews: 1 },
      isPublished: true,
    });

    // 5. CACHE INVALIDATION: Clear all cached catalog search pages in Redis
    try {
      const cachedKeys = await redis.keys("catalog:*");
      if (cachedKeys.length > 0) {
        await redis.del(...cachedKeys);
      }
    } catch (cacheErr) {
      console.error("Redis cache purge error:", cacheErr);
    }

    return NextResponse.json({
      status: "success",
      message: "Product published successfully to marketplace!",
      product: newProduct,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
