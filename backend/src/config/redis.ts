import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType;

export const connectRedis = async (): Promise<void> => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 60000,
      },
      commandsQueueMaxLength: 1000,
    });

    redisClient.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redisClient.on('disconnect', () => {
      console.warn('⚠️ Redis disconnected');
    });

    await redisClient.connect();

    process.on('SIGINT', async () => {
      await redisClient.quit();
      console.log('📴 Redis connection closed due to app termination');
    });

  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    process.exit(1);
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

export { redisClient };