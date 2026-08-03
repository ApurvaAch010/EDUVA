import { cacheGet, cacheSet, cacheDelByPrefix } from "../config/redis.config.js";

/**
 * Middleware to cache GET request JSON responses
 * @param {string} prefix - Group identifier (e.g. 'products', 'categories', 'banners')
 * @param {number} ttlSeconds - Duration in seconds to store the cached response
 */
export const cacheMiddleware = (prefix = "api", ttlSeconds = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = `${prefix}:${req.originalUrl || req.url}`;

    try {
      const cachedData = await cacheGet(cacheKey);
      if (cachedData) {
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json(cachedData);
      }
    } catch (err) {
      console.error("Cache middleware read error:", err);
    }

    res.setHeader("X-Cache", "MISS");

    // Intercept res.json to capture payload and store in cache
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Only cache successful 200 responses
      if (res.statusCode === 200 && body && body.success !== false) {
        cacheSet(cacheKey, body, ttlSeconds).catch((err) =>
          console.error("Cache middleware write error:", err)
        );
      }
      return originalJson(body);
    };

    next();
  };
};

/**
 * Helper middleware to automatically invalidate cache groups after mutation (POST, PUT, DELETE)
 * @param {string|string[]} prefixes - Cache prefix or array of prefixes to clear
 */
export const invalidateCache = (prefixes) => {
  const prefixArray = Array.isArray(prefixes) ? prefixes : [prefixes];
  
  return (req, res, next) => {
    // Perform invalidation after response is sent
    res.on("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        prefixArray.forEach((prefix) => {
          cacheDelByPrefix(prefix).catch((err) =>
            console.error(`Error clearing cache prefix '${prefix}':`, err)
          );
        });
      }
    });

    next();
  };
};

export default { cacheMiddleware, invalidateCache };
