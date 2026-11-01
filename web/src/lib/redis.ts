import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

declare global {
  // eslint-disable-next-line no-var
  var redisCache: Redis | undefined;
}

function createRedisClient(): Redis {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      if (times > 2) return null; // Stop retrying if Redis is not available
      return Math.min(times * 100, 1000);
    },
    enableOfflineQueue: false,
    lazyConnect: true,
  });

  // Handle errors gracefully so unhandled error event doesn't crash serverless functions
  client.on("error", (err: any) => {
    if (err?.code !== "ECONNREFUSED") {
      console.warn("Redis notice:", err?.message || err);
    }
  });

  return client;
}

export const redis = global.redisCache || createRedisClient();

if (process.env.NODE_ENV !== "production") {
  global.redisCache = redis;
}

