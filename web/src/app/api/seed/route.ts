import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Category from "@/models/Category";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Clear existing seed data to ensure a clean slate
    await Product.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});

    // 2. Create Demo Users (Seller & Buyer)
    const seller = await User.create({
      name: "Apex Electronics & Apparel",
      email: "seller@apexretail.com",
      role: "seller",
      storeName: "Apex Official Store",
      storeDescription: "Premium gadgets and lifestyle fashion.",
      isSellerVerified: true,
      addresses: [
        {
          fullName: "Apex Warehouse",
          street: "100 Tech Park Way",
          city: "Bengaluru",
          state: "Karnataka",
          zipCode: "560100",
          country: "India",
          phone: "9876543210",
          isDefault: true,
        },
      ],
    });

    const buyer = await User.create({
      name: "Rahul Sharma",
      email: "buyer@example.com",
      role: "buyer",
      addresses: [
        {
          fullName: "Rahul Sharma",
          street: "42 Indiranagar 100ft Rd",
          city: "Bengaluru",
          state: "Karnataka",
          zipCode: "560038",
          country: "India",
          phone: "9123456780",
          isDefault: true,
        },
      ],
    });

    // 3. Create Hierarchical Categories
    const electronics = await Category.create({
      name: "Electronics",
      slug: "electronics",
      description: "Smartphones, laptops, and smart gadgets.",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
    });

    const laptops = await Category.create({
      name: "Laptops",
      slug: "laptops",
      description: "High performance ultrabooks and gaming rigs.",
      parentCategory: electronics._id,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    });

    const audio = await Category.create({
      name: "Audio & Headphones",
      slug: "audio-headphones",
      description: "Noise cancelling headphones and earbuds.",
      parentCategory: electronics._id,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    });

    const fashion = await Category.create({
      name: "Fashion",
      slug: "fashion",
      description: "Trending clothing and apparel.",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
    });

    const footwear = await Category.create({
      name: "Footwear",
      slug: "footwear",
      description: "Athletic sneakers, formal and casual shoes.",
      parentCategory: fashion._id,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    });

    // 4. Create Sample Products with Embedded Variants & Dynamic Specs
    await Product.create([
      {
        title: "Apple MacBook Pro 16-inch M3 Max",
        slug: "apple-macbook-pro-16-m3-max",
        description: "The ultimate pro laptop with the monstrous M3 Max chip, Liquid Retina XDR display, and up to 22 hours of battery life.",
        brand: "Apple",
        category: laptops._id,
        seller: seller._id,
        basePrice: 349900,
        discountPrice: 329900,
        images: [
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
          "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80",
        ],
        variants: [
          {
            sku: "MBP16-BLK-36GB-1TB",
            color: "Space Black",
            size: "16-inch",
            price: 349900,
            stock: 12,
            images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"],
          },
          {
            sku: "MBP16-SLV-48GB-1TB",
            color: "Silver",
            size: "16-inch",
            price: 389900,
            stock: 6,
            images: ["https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80"],
          },
        ],
        specs: {
          Processor: "Apple M3 Max (14-core CPU, 30-core GPU)",
          RAM: "36GB Unified Memory",
          Storage: "1TB Ultra-fast SSD",
          Display: "16.2-inch Liquid Retina XDR (3456 x 2234)",
        },
        ratingSummary: { average: 4.9, totalReviews: 84 },
        isPublished: true,
      },
      {
        title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
        slug: "sony-wh-1000xm5-wireless-headphones",
        description: "Industry-leading noise cancellation with two processors and 8 microphones for unparalleled calls and sound quality.",
        brand: "Sony",
        category: audio._id,
        seller: seller._id,
        basePrice: 29990,
        discountPrice: 26990,
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        ],
        variants: [
          {
            sku: "SONY-XM5-BLK",
            color: "Midnight Black",
            price: 26990,
            stock: 25,
            images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"],
          },
          {
            sku: "SONY-XM5-SLV",
            color: "Platinum Silver",
            price: 26990,
            stock: 18,
            images: ["https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80"],
          },
        ],
        specs: {
          BatteryLife: "30 Hours with ANC On",
          Weight: "250 grams",
          Connectivity: "Bluetooth 5.2, Multipoint Connection",
        },
        ratingSummary: { average: 4.7, totalReviews: 240 },
        isPublished: true,
      },
      {
        title: "Nike Air Max 270 Running Sneakers",
        slug: "nike-air-max-270-running-sneakers",
        description: "Nike's biggest heel Air unit yet delivers a super-soft ride that feels as impossible as it looks.",
        brand: "Nike",
        category: footwear._id,
        seller: seller._id,
        basePrice: 13995,
        discountPrice: 11995,
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
        ],
        variants: [
          {
            sku: "NIKE-270-RED-UK8",
            color: "University Red",
            size: "UK 8",
            price: 11995,
            stock: 14,
            images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"],
          },
          {
            sku: "NIKE-270-RED-UK9",
            color: "University Red",
            size: "UK 9",
            price: 11995,
            stock: 20,
            images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"],
          },
          {
            sku: "NIKE-270-RED-UK10",
            color: "University Red",
            size: "UK 10",
            price: 11995,
            stock: 8,
            images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"],
          },
        ],
        specs: {
          UpperMaterial: "Engineered Breathable Mesh",
          SoleMaterial: "Dual-density foam with large Air Max unit",
          Closure: "Lace-Up",
        },
        ratingSummary: { average: 4.6, totalReviews: 512 },
        isPublished: true,
      },
    ]);

    return NextResponse.json({
      status: "success",
      message: "Database seeded successfully with categories, products, and users!",
      data: {
        categoriesCreated: 5,
        productsCreated: 3,
        usersCreated: 2,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Seeding failed";
    return NextResponse.json({ status: "error", error: message }, { status: 500 });
  }
}
