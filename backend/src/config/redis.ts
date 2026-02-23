import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType;

export const connectRedis = async (): Promise<void> => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      socket: {
        connectTimeout: 5000, // fail fast in dev
        reconnectStrategy: (retries) => {
          if (retries > 2) return false; // stop retrying
          return 1000;
        },
      },
      commandsQueueMaxLength: 1000,
    }) as RedisClientType;

    redisClient.on("error", (error) => {
      // Suppress repeated ECONNREFUSED noise after initial warning
    });

    redisClient.on("connect", () => {
      console.log("✅ Redis connected successfully");
    });

    redisClient.on("disconnect", () => {
      console.warn("⚠️ Redis disconnected");
    });

    await redisClient.connect();

    process.on("SIGINT", async () => {
      try {
        await redisClient.quit();
      } catch {}
      console.log("📴 Redis connection closed due to app termination");
    });
  } catch (error) {
    console.warn(
      "⚠️  Redis unavailable — rate-limiting disabled, running without cache.\n" +
        "   Start Redis (redis-server) or set REDIS_URL in .env to enable it.",
    );
    // Don't process.exit — app still works without Redis (rate limiter fails open)
  }
};

export const getRedisClient = (): RedisClientType | null => {
  return redisClient ?? null;
};

export { redisClient };
