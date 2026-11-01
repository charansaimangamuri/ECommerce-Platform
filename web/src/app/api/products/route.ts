import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { redis } from "@/lib/redis";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { PipelineStage } from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    // 1. Extract Query Parameters
    const q = searchParams.get("q")?.trim() || "";
    const categorySlug = searchParams.get("category")?.trim() || "";
    const brand = searchParams.get("brand")?.trim() || "";
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
    const rating = searchParams.get("rating") ? Number(searchParams.get("rating")) : null;
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit")) || 12));
    const skip = (page - 1) * limit;

    // 2. Redis Cache Key Generation
    const cacheKey = `catalog:${JSON.stringify({ q, categorySlug, brand, minPrice, maxPrice, rating, sort, page, limit })}`;
    
    // Check Redis for cached result (with graceful fallback if Redis is unavailable)
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return NextResponse.json({
          ...JSON.parse(cachedData),
          source: "cache (Redis)",
        });
      }
    } catch {
      // Continue to query MongoDB directly if Redis is offline
    }

    // 3. Build MongoDB Match Filters
    const matchConditions: Record<string, any> = { isPublished: true };

    // Full-Text Search
    if (q) {
      matchConditions.$text = { $search: q };
    }

    // Category Filter (Look up category ObjectId by slug)
    if (categorySlug) {
      const categoryDoc = await Category.findOne({ slug: categorySlug });
      if (categoryDoc) {
        // Match this category or any child subcategories
        const childCategories = await Category.find({ parentCategory: categoryDoc._id });
        const categoryIds = [categoryDoc._id, ...childCategories.map((c) => c._id)];
        matchConditions.category = { $in: categoryIds };
      }
    }

    // Brand Filter (supports comma-separated brands: "Apple,Sony")
    if (brand) {
      const brandsList = brand.split(",").map((b) => new RegExp(`^${b.trim()}$`, "i"));
      matchConditions.brand = { $in: brandsList };
    }

    // Price Range Filter
    if (minPrice !== null || maxPrice !== null) {
      matchConditions.basePrice = {};
      if (minPrice !== null) matchConditions.basePrice.$gte = minPrice;
      if (maxPrice !== null) matchConditions.basePrice.$lte = maxPrice;
    }

    // Minimum Rating Filter
    if (rating !== null) {
      matchConditions["ratingSummary.average"] = { $gte: rating };
    }

    // 4. Determine Sort Order
    let sortStage: Record<string, 1 | -1> = { createdAt: -1 }; // newest default
    if (sort === "price_asc") sortStage = { basePrice: 1 };
    if (sort === "price_desc") sortStage = { basePrice: -1 };
    if (sort === "rating_desc") sortStage = { "ratingSummary.average": -1 };

    // 5. Execute MongoDB $facet Aggregation Pipeline
    const pipeline: PipelineStage[] = [
      { $match: matchConditions },
      {
        $facet: {
          // Facet 1: Paginated Products
          products: [
            { $sort: sortStage },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "categoryDetails",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "seller",
                foreignField: "_id",
                as: "sellerDetails",
              },
            },
            {
              $project: {
                title: 1,
                slug: 1,
                brand: 1,
                basePrice: 1,
                discountPrice: 1,
                images: 1,
                variants: 1,
                specs: 1,
                ratingSummary: 1,
                createdAt: 1,
                category: { $arrayElemAt: ["$categoryDetails", 0] },
                seller: {
                  storeName: { $arrayElemAt: ["$sellerDetails.storeName", 0] },
                  name: { $arrayElemAt: ["$sellerDetails.name", 0] },
                },
              },
            },
          ],
          // Facet 2: Total Matching Count
          totalCount: [{ $count: "count" }],
          // Facet 3: Amazon-style Brand Counts for Sidebar
          brandsFacet: [
            { $group: { _id: "$brand", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          // Facet 4: Dynamic Min & Max Price Bounds of current filter
          priceRangeFacet: [
            {
              $group: {
                _id: null,
                min: { $min: "$basePrice" },
                max: { $max: "$basePrice" },
              },
            },
          ],
        },
      },
    ];

    const [aggregationResult] = await Product.aggregate(pipeline);

    const total = aggregationResult.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    const responsePayload = {
      products: aggregationResult.products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      facets: {
        brands: aggregationResult.brandsFacet,
        priceBounds: aggregationResult.priceRangeFacet[0] || { min: 0, max: 0 },
      },
    };

    // 6. Cache response in Redis for 120 seconds (TTL) if available
    try {
      await redis.set(cacheKey, JSON.stringify(responsePayload), "EX", 120);
    } catch {
      // Ignore cache write error if Redis is offline
    }

    return NextResponse.json({
      ...responsePayload,
      source: "database (MongoDB)",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
