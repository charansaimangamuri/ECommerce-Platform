import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const { items, shippingAddress, buyerName, buyerEmail, paymentMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!shippingAddress || !buyerEmail || !buyerName) {
      return NextResponse.json({ error: "Shipping details are incomplete" }, { status: 400 });
    }

    // Array to track items we successfully decremented (in case we need to roll back)
    const decrementedItems: Array<{ productId: string; sku: string; quantity: number }> = [];

    let totalAmount = 0;

    // 1. Atomic Stock Decrement Loop
    for (const item of items) {
      const { productId, variantSku, quantity, price } = item;
      totalAmount += price * quantity;

      // ATOMIC UPDATE: Deducts stock only if stock >= quantity
      const updateResult = await Product.updateOne(
        {
          _id: productId,
          "variants.sku": variantSku,
          "variants.stock": { $gte: quantity }, // Guard condition prevents overselling
        },
        {
          $inc: { "variants.$.stock": -quantity }, // Atomic decrement
        }
      );

      // If matchedCount is 0, someone bought the last item right before this request!
      if (updateResult.matchedCount === 0) {
        // Rollback any items that were already decremented in this order
        for (const dec of decrementedItems) {
          await Product.updateOne(
            { _id: dec.productId, "variants.sku": dec.sku },
            { $inc: { "variants.$.stock": dec.quantity } }
          );
        }

        return NextResponse.json(
          {
            error: `Sorry! "${item.title}" (${item.color || item.size || variantSku}) is out of stock or does not have enough quantity available.`,
          },
          { status: 409 } // 409 Conflict
        );
      }

      decrementedItems.push({ productId, sku: variantSku, quantity });
    }

    // 2. Generate Unique Human-Readable Order ID (e.g. ORD-849201)
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;

    // 3. Create Order Record in MongoDB
    const newOrder = await Order.create({
      orderNumber,
      buyerEmail,
      buyerName,
      items: items.map((i: any) => ({
        productId: i.productId,
        title: i.title,
        variantSku: i.variantSku,
        color: i.color,
        size: i.size,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      })),
      shippingAddress,
      totalAmount,
      paymentMethod: paymentMethod || "CASH_ON_DELIVERY",
      paymentStatus: paymentMethod === "ONLINE_CARD" ? "PAID" : "PENDING",
      orderStatus: "PLACED",
    });

    return NextResponse.json({
      status: "success",
      message: "Order placed successfully!",
      orderNumber: newOrder.orderNumber,
      orderId: newOrder._id,
      totalAmount: newOrder.totalAmount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
