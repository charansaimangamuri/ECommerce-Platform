import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    // 1. Test MongoDB connection
    await connectToDatabase();

    // 2. Test Redis cache: write and read a test key
    await redis.set("health_test", "active", "EX", 10);
    const redisVal = await redis.get("health_test");

    return NextResponse.json({
      status: "healthy",
      database: "MongoDB Connected",
      cache: redisVal === "active" ? "Redis Connected" : "Redis Error",
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Connection failed";
    return NextResponse.json(
      {
        status: "unhealthy",
        error: message,
      },
      { status: 500 }
    );
  }
}
