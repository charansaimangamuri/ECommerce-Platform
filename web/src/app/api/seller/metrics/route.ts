import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";

export async function GET() {
  try {
    await connectToDatabase();

    const products = await Product.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
    const orders = await Order.find().sort({ createdAt: -1 }).lean();

    const totalRevenue = orders.reduce((sum, ord: any) => sum + (ord.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const activeProducts = products.length;

    return NextResponse.json({
      products,
      totalRevenue,
      totalOrders,
      activeProducts,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load seller metrics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
