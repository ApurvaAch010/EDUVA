import Redis from "ioredis";
import NodeCache from "node-cache";

// High-performance fallback in-memory cache
const localMemoryCache = new NodeCache({
  stdTTL: 600, // default 10 minutes
  checkperiod: 120,
  useClones: false,
});

let isRedisConnected = false;

// Initialize ioredis with fallback configuration
const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = process.env.REDIS_PORT || 6379;

const redisClient = new Redis({
  host: redisHost,
  port: Number(redisPort),
  password: process.env.REDIS_PASSWORD || undefined,
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 2) {
      // Stop retrying quickly to avoid blocking operations when Redis is not installed
      return null;
    }
    return Math.min(times * 100, 1000);
  },
});

redisClient.on("connect", () => {
  isRedisConnected = true;
  console.log(" Connected to Redis cache server.");
});

redisClient.on("error", (err) => {
  if (isRedisConnected) {
    console.warn("Redis connection lost. Falling back to internal memory cache.");
  }
  isRedisConnected = false;
});

// Attempt initial connection asynchronously
(async () => {
  try {
    await redisClient.connect();
    isRedisConnected = true;
  } catch (err) {
    isRedisConnected = false;
    console.log("Redis server not reachable locally. Utilizing internal memory cache fallback.");
  }
})();

/**
 * Store user session token in cache (Redis or Memory Fallback)
 */
export const setSessionToken = async (userId, token, ttlSeconds = 7 * 24 * 3600) => {
  const key = `session:${userId}`;
  try {
    if (isRedisConnected) {
      await redisClient.set(key, token, "EX", ttlSeconds);
    } else {
      localMemoryCache.set(key, token, ttlSeconds);
    }
  } catch (err) {
    console.error("Cache setSessionToken error:", err.message);
    localMemoryCache.set(key, token, ttlSeconds);
  }
};

/**
 * Retrieve active user session token from cache
 */
export const getSessionToken = async (userId) => {
  const key = `session:${userId}`;
  try {
    if (isRedisConnected) {
      const token = await redisClient.get(key);
      if (token !== null) return token;
    }
  } catch (err) {
    console.error("Cache getSessionToken error:", err.message);
  }
  return localMemoryCache.get(key) || null;
};

/**
 * Remove session token on user logout / invalidation
 */
export const deleteSessionToken = async (userId) => {
  const key = `session:${userId}`;
  try {
    if (isRedisConnected) {
      await redisClient.del(key);
    }
  } catch (err) {
    console.error("Cache deleteSessionToken error:", err.message);
  }
  localMemoryCache.del(key);
};

/**
 * Generic Cache GET helper for API responses
 */
export const cacheGet = async (key) => {
  try {
    if (isRedisConnected) {
      const data = await redisClient.get(key);
      if (data) return JSON.parse(data);
    }
  } catch (err) {
    console.error("Cache GET error:", err.message);
  }
  return localMemoryCache.get(key) || null;
};

/**
 * Generic Cache SET helper for API responses
 */
export const cacheSet = async (key, value, ttlSeconds = 300) => {
  try {
    if (isRedisConnected) {
      await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } else {
      localMemoryCache.set(key, value, ttlSeconds);
    }
  } catch (err) {
    console.error("Cache SET error:", err.message);
    localMemoryCache.set(key, value, ttlSeconds);
  }
};

/**
 * Invalidate cached items matching prefix (e.g., "products", "categories")
 */
export const cacheDelByPrefix = async (prefixPattern) => {
  try {
    if (isRedisConnected) {
      const keys = await redisClient.keys(`${prefixPattern}*`);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    }
  } catch (err) {
    console.error("Cache DEL prefix error:", err.message);
  }

  // Clear memory cache keys matching pattern
  const memKeys = localMemoryCache.keys();
  for (const key of memKeys) {
    if (key.startsWith(prefixPattern)) {
      localMemoryCache.del(key);
    }
  }
};

export default {
  setSessionToken,
  getSessionToken,
  deleteSessionToken,
  cacheGet,
  cacheSet,
  cacheDelByPrefix,
};
