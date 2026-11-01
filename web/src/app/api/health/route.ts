import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    // 1. Test MongoDB connection
    await connectToDatabase();

    // 2. Test Redis cache: write and read a test key (graceful fallback)
    let redisStatus = "Redis Offline (Optional)";
    try {
      await redis.set("health_test", "active", "EX", 10);
      const redisVal = await redis.get("health_test");
      if (redisVal === "active") redisStatus = "Redis Connected";
    } catch {
      redisStatus = "Redis Offline (Optional)";
    }

    return NextResponse.json({
      status: "healthy",
      database: "MongoDB Connected",
      cache: redisStatus,
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
