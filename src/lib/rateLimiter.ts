import { getRedisClient } from './redis';
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyPrefix?: string;
}

/**
 * Rate limiting using Redis
 * Supports distributed rate limiting across multiple servers
 */
export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private keyPrefix: string;

  constructor(config: RateLimitConfig) {
    this.windowMs = config.windowMs;
    this.maxRequests = config.maxRequests;
    this.keyPrefix = config.keyPrefix || 'ratelimit:';
  }

  /**
   * Get rate limit key
   */
  private getKey(identifier: string): string {
    return `${this.keyPrefix}${identifier}`;
  }

  /**
   * Check if request should be allowed
   */
  async isAllowed(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const client = getRedisClient();
      const key = this.getKey(identifier);
      const now = Date.now();
      const windowStart = now - this.windowMs;

      // Remove old entries outside the window
      await client.zremrangebyscore(key, 0, windowStart);

      // Get current count
      const count = await client.zcard(key);

      if (count >= this.maxRequests) {
        // Get the oldest entry to calculate reset time
        const oldest = await client.zrange(key, 0, 0, 'WITHSCORES');
        const resetTime = oldest.length > 1 ? parseInt(oldest[1]) + this.windowMs : now + this.windowMs;

        return {
          allowed: false,
          remaining: 0,
          resetTime,
        };
      }

      // Add current timestamp to sorted set
      await client.zadd(key, now, `${now}-${Math.random()}`);

      // Set expiration
      await client.expire(key, Math.ceil(this.windowMs / 1000) + 1);

      return {
        allowed: true,
        remaining: this.maxRequests - count - 1,
        resetTime: now + this.windowMs,
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      // On error, allow request (fail open)
      return { allowed: true, remaining: this.maxRequests, resetTime: Date.now() + this.windowMs };
    }
  }

  /**
   * Get current count for identifier
   */
  async getCount(identifier: string): Promise<number> {
    try {
      const client = getRedisClient();
      const key = this.getKey(identifier);
      const windowStart = Date.now() - this.windowMs;

      // Remove old entries and count
      await client.zremrangebyscore(key, 0, windowStart);
      return await client.zcard(key);
    } catch (error) {
      console.error('Rate limiter getCount error:', error);
      return 0;
    }
  }

  /**
   * Reset rate limit for identifier
   */
  async reset(identifier: string): Promise<boolean> {
    try {
      const client = getRedisClient();
      const key = this.getKey(identifier);
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Rate limiter reset error:', error);
      return false;
    }
  }
}

// Predefined rate limiters
export const apiRateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  keyPrefix: 'ratelimit:api:',
});

export const authRateLimiter = new RateLimiter({
  windowMs: 900000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  keyPrefix: 'ratelimit:auth:',
});

export const chatRateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 30, // 30 messages per minute
  keyPrefix: 'ratelimit:chat:',
});

export const paymentRateLimiter = new RateLimiter({
  windowMs: 3600000, // 1 hour
  maxRequests: 20, // 20 requests per hour
  keyPrefix: 'ratelimit:payment:',
});

/**
 * Middleware for rate limiting
 */
export const createRateLimitMiddleware = (limiter: RateLimiter) => {
  return async (req: NextRequest) => {
    // Get identifier (IP, user ID, etc.)
    const identifier = req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown';

    const { allowed, remaining, resetTime } = await limiter.isAllowed(identifier);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(limiter['maxRequests']),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(resetTime),
          },
        }
      );
    }

    // Continue with request
    return null;
  };
};

export default RateLimiter;
