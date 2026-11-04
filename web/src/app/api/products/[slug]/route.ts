import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import User from "@/models/User";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectToDatabase();

    // Prevent bundler tree-shaking and ensure Mongoose models are registered
    void User.schema;
    void Category.schema;

    const product = await Product.findOne({ slug, isPublished: true })
      .populate("category", "name slug")
      .populate("seller", "name storeName isSellerVerified")
      .lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: unknown) {
    console.error("Error fetching product by slug:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
