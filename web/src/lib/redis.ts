import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

declare global {
  // eslint-disable-next-line no-var
  var redisCache: Redis | undefined;
}

export const redis =
  global.redisCache ||
  new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
  });

if (process.env.NODE_ENV !== "production") {
  global.redisCache = redis;
}
