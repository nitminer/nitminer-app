import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient, isRedisAvailable } from './redis';
import { RateLimiter, apiRateLimiter } from './rateLimiter';
import { CacheManager } from './cache';

interface RedisMiddlewareOptions {
  rateLimit?: {
    enabled: boolean;
    limiter?: RateLimiter;
    windowMs?: number;
    maxRequests?: number;
  };
  cache?: {
    enabled: boolean;
    ttl?: number;
    manager?: CacheManager;
    key?: (req: NextRequest) => string;
  };
}

/**
 * Higher-order function to wrap API route handlers with Redis support
 * Automatically handles caching, rate limiting, and error handling
 * 
 * Usage:
 * ```typescript
 * export const POST = withRedis(
 *   handler,
 *   {
 *     cache: { enabled: true, ttl: 3600 },
 *     rateLimit: { enabled: true }
 *   }
 * );
 * ```
 */
export function withRedis(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: RedisMiddlewareOptions = {}
) {
  return async (request: NextRequest) => {
    try {
      // Check Redis availability
      const redisAvailable = await isRedisAvailable();
      if (!redisAvailable) {
        console.warn('Redis not available, bypassing optimization');
      }

      // Rate limiting
      if (options.rateLimit?.enabled && redisAvailable) {
        const limiter = options.rateLimit.limiter || apiRateLimiter;
        const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
          request.headers.get('x-real-ip') ||
          'unknown';

        const { allowed, remaining, resetTime } = await limiter.isAllowed(clientIp);

        if (!allowed) {
          return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
              status: 429,
              headers: {
                'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': String(resetTime),
              },
            }
          );
        }
      }

      // Execute handler
      const response = await handler(request);

      return response;
    } catch (error) {
      console.error('Redis middleware error:', error);

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware to add rate limiting to any route
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  limiter: RateLimiter = apiRateLimiter
) {
  return withRedis(handler, {
    rateLimit: { enabled: true, limiter },
  });
}

/**
 * Middleware to add caching to GET requests
 */
export function withCache(
  handler: (request: NextRequest) => Promise<NextResponse>,
  cacheManager: CacheManager,
  ttl: number = 3600,
  keyGenerator?: (req: NextRequest) => string
) {
  return async (request: NextRequest) => {
    // Only cache GET requests
    if (request.method !== 'GET') {
      return handler(request);
    }

    try {
      const redisAvailable = await isRedisAvailable();

      // Generate cache key
      const defaultKey = `${request.nextUrl.pathname}:${request.nextUrl.search}`;
      const cacheKey = keyGenerator ? keyGenerator(request) : defaultKey;

      if (redisAvailable) {
        // Try to get from cache
        const cached = await cacheManager.get(cacheKey);
        if (cached) {
          console.log(`Cache hit: ${cacheKey}`);
          return NextResponse.json(cached, {
            headers: { 'X-Cache': 'HIT' },
          });
        }
      }

      // Execute handler
      const response = await handler(request);

      // Cache successful responses
      if (response.status === 200 && redisAvailable) {
        try {
          const data = await response.clone().json();
          await cacheManager.set(cacheKey, data, ttl);
          console.log(`Cached: ${cacheKey}`);
        } catch (error) {
          console.error('Failed to cache response:', error);
        }
      }

      return response;
    } catch (error) {
      console.error('Cache middleware error:', error);
      return handler(request);
    }
  };
}

/**
 * Middleware for monitoring request performance
 */
export function withMetrics(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const startTime = Date.now();

    try {
      const response = await handler(request);
      const duration = Date.now() - startTime;

      // Log metrics
      if (duration > 1000) {
        console.warn(
          `⚠️  Slow request: ${request.method} ${request.nextUrl.pathname} (${duration}ms)`
        );
      } else {
        console.log(
          `✅ ${request.method} ${request.nextUrl.pathname} (${duration}ms)`
        );
      }

      // Add timing header
      response.headers.set('X-Response-Time', `${duration}ms`);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `❌ ${request.method} ${request.nextUrl.pathname} failed (${duration}ms):`,
        error
      );
      throw error;
    }
  };
}

/**
 * Combine multiple middlewares
 */
export function compose(
  ...middlewares: Array<(handler: (req: NextRequest) => Promise<NextResponse>) => (req: NextRequest) => Promise<NextResponse>>
) {
  return (
    baseHandler: (request: NextRequest) => Promise<NextResponse>
  ) => {
    return middlewares.reduce(
      (handler, middleware) => middleware(handler),
      baseHandler
    );
  };
}

/**
 * Example: Combining multiple middlewares
 * 
 * ```typescript
 * const handler = async (request: NextRequest) => {
 *   return NextResponse.json({ data: 'test' });
 * };
 *
 * export const GET = compose(
 *   withMetrics,
 *   withRateLimit(apiRateLimiter),
 *   withCache(profileCache, 1800)
 * )(handler);
 * ```
 */

export default {
  withRedis,
  withRateLimit,
  withCache,
  withMetrics,
  compose,
};
