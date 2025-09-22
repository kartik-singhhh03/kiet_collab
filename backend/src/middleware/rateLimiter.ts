import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

const defaultOptions: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
};

export const createRateLimiter = (options: Partial<RateLimitOptions> = {}) => {
  const opts = { ...defaultOptions, ...options };

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redisClient = getRedisClient();
      const key = `rateLimit:${req.ip}`;
      const now = Date.now();
      const window = Math.floor(now / opts.windowMs);
      const redisKey = `${key}:${window}`;

      const current = await redisClient.incr(redisKey);
      
      if (current === 1) {
        await redisClient.expire(redisKey, Math.ceil(opts.windowMs / 1000));
      }

      if (current > opts.max) {
        return res.status(429).json({
          error: opts.message,
          retryAfter: Math.ceil(opts.windowMs / 1000)
        });
      }

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': opts.max.toString(),
        'X-RateLimit-Remaining': Math.max(0, opts.max - current).toString(),
        'X-RateLimit-Reset': new Date(now + opts.windowMs).toISOString()
      });

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Fail open - don't block requests if Redis is down
      next();
    }
  };
};

export const rateLimiter = createRateLimiter();

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: 'Too many authentication attempts, please try again later'
});