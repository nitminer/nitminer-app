/**
 * Redis API Helper
 * Centralized utilities for common Redis operations in API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  userCache,
  sessionCache,
  chatCache,
  profileCache,
  quotationCache,
  paymentCache,
  CacheManager,
} from './cache';
import {
  apiRateLimiter,
  authRateLimiter,
  chatRateLimiter,
  paymentRateLimiter,
  RateLimiter,
} from './rateLimiter';
import { sessionStore, SessionStore } from './sessionStore';
import { connectionPool, ConnectionPool } from './connectionPool';
import { getRedisClient, isRedisAvailable } from './redis';

/**
 * Get client IP from request
 */
export const getClientIp = (request: NextRequest): string => {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
};

/**
 * Check rate limit and return response if limited
 */
export const checkRateLimit = async (
  request: NextRequest,
  limiter: RateLimiter
): Promise<NextResponse | null> => {
  const clientIp = getClientIp(request);
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

  return null;
};

/**
 * Get or fetch user with cache
 */
export const getCachedUser = async (userId: string, fetchFunction: () => Promise<any>) => {
  const cacheKey = `user:${userId}`;

  return userCache.getOrSet(cacheKey, async () => {
    return fetchFunction();
  }, 3600); // 1 hour TTL
};

/**
 * Get or fetch user profile with cache
 */
export const getCachedUserProfile = async (
  userId: string,
  email: string,
  fetchFunction: () => Promise<any>
) => {
  const cacheKey = `${userId}:${email}`;

  return profileCache.getOrSet(cacheKey, async () => {
    return fetchFunction();
  }, 1800); // 30 minutes TTL
};

/**
 * Invalidate user cache
 */
export const invalidateUserCache = async (userId: string, email: string = '') => {
  const keys = [
    `user:${userId}`,
    `profile:${userId}`,
    email ? `profile:${email}` : null,
  ].filter(Boolean) as string[];

  return profileCache.deleteMany(keys);
};

/**
 * Get or fetch chat session with cache
 */
export const getCachedChatSession = async (
  sessionId: string,
  fetchFunction: () => Promise<any>
) => {
  const cacheKey = `${sessionId}`;

  return chatCache.getOrSet(cacheKey, async () => {
    return fetchFunction();
  }, 3600); // 1 hour TTL
};

/**
 * Invalidate chat session cache
 */
export const invalidateChatSessionCache = async (sessionId: string) => {
  return chatCache.delete(sessionId);
};

/**
 * Get or fetch quotation with cache
 */
export const getCachedQuotation = async (
  quotationId: string,
  fetchFunction: () => Promise<any>
) => {
  const cacheKey = `${quotationId}`;

  return quotationCache.getOrSet(cacheKey, async () => {
    return fetchFunction();
  }, 1800); // 30 minutes TTL
};

/**
 * Invalidate quotation cache
 */
export const invalidateQuotationCache = async (quotationId: string) => {
  return quotationCache.delete(quotationId);
};

/**
 * Get or fetch payment with cache
 */
export const getCachedPayment = async (
  paymentId: string,
  fetchFunction: () => Promise<any>
) => {
  const cacheKey = `${paymentId}`;

  return paymentCache.getOrSet(cacheKey, async () => {
    return fetchFunction();
  }, 600); // 10 minutes TTL
};

/**
 * Invalidate payment cache
 */
export const invalidatePaymentCache = async (paymentId: string) => {
  return paymentCache.delete(paymentId);
};

/**
 * Register connection
 */
export const registerConnection = async (
  connectionId: string,
  metadata?: Record<string, any>
) => {
  return connectionPool.registerConnection(connectionId, metadata);
};

/**
 * Unregister connection
 */
export const unregisterConnection = async (connectionId: string) => {
  return connectionPool.unregisterConnection(connectionId);
};

/**
 * Get connection stats
 */
export const getConnectionStats = async () => {
  return connectionPool.getStats();
};

/**
 * Create or update session
 */
export const createSession = async (
  sessionId: string,
  userId: string,
  email: string,
  role: string,
  additionalData?: Record<string, any>,
  ttl?: number
) => {
  return sessionStore.createSession(sessionId, {
    userId,
    email,
    role,
    createdAt: Date.now(),
    expiresAt: Date.now() + (ttl || 86400) * 1000,
    ...additionalData,
  }, ttl);
};

/**
 * Get session
 */
export const getSession = async (sessionId: string) => {
  return sessionStore.getSession(sessionId);
};

/**
 * Extend session
 */
export const extendSession = async (sessionId: string, additionalTtl: number = 3600) => {
  return sessionStore.extendSession(sessionId, additionalTtl);
};

/**
 * Delete session
 */
export const deleteSession = async (sessionId: string) => {
  return sessionStore.deleteSession(sessionId);
};

/**
 * Get all user sessions
 */
export const getUserSessions = async (userId: string) => {
  return sessionStore.getUserSessions(userId);
};

/**
 * Get Redis client instance
 */
export const getRedis = () => {
  return getRedisClient();
};

/**
 * Check Redis availability
 */
export const checkRedisAvailability = async () => {
  return isRedisAvailable();
};

/**
 * Create error response with proper headers
 */
export const createErrorResponse = (
  error: string,
  status: number = 500,
  additionalData?: Record<string, any>
) => {
  return NextResponse.json(
    {
      error,
      ...additionalData,
    },
    { status }
  );
};

/**
 * Create success response with rate limit headers
 */
export const createSuccessResponse = (
  data: any,
  remaining?: number,
  resetTime?: number
) => {
  const response = NextResponse.json(data, { status: 200 });

  if (remaining !== undefined) {
    response.headers.set('X-RateLimit-Remaining', String(remaining));
  }

  if (resetTime !== undefined) {
    response.headers.set('X-RateLimit-Reset', String(resetTime));
  }

  return response;
};

/**
 * Middleware wrapper for API routes with rate limiting
 */
export const withRateLimit = (limiter: RateLimiter) => {
  return async (handler: (req: NextRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      const rateLimitResponse = await checkRateLimit(req, limiter);
      if (rateLimitResponse) {
        return rateLimitResponse;
      }

      return handler(req);
    };
  };
};

/**
 * Get cache stats
 */
export const getCacheStats = async () => {
  try {
    const redis = getRedisClient();
    const info = await redis.info('stats');
    return {
      stats: info,
      ready: true,
    };
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return {
      stats: null,
      ready: false,
      error: String(error),
    };
  }
};

export default {
  // Utilities
  getClientIp,
  checkRateLimit,
  createErrorResponse,
  createSuccessResponse,
  withRateLimit,

  // Cache functions
  getCachedUser,
  getCachedUserProfile,
  invalidateUserCache,
  getCachedChatSession,
  invalidateChatSessionCache,
  getCachedQuotation,
  invalidateQuotationCache,
  getCachedPayment,
  invalidatePaymentCache,

  // Connection functions
  registerConnection,
  unregisterConnection,
  getConnectionStats,

  // Session functions
  createSession,
  getSession,
  extendSession,
  deleteSession,
  getUserSessions,

  // Redis functions
  getRedis,
  checkRedisAvailability,
  getCacheStats,

  // Rate limiters
  apiRateLimiter,
  authRateLimiter,
  chatRateLimiter,
  paymentRateLimiter,

  // Cache managers
  userCache,
  sessionCache,
  chatCache,
  profileCache,
  quotationCache,
  paymentCache,

  // Stores
  sessionStore,
  connectionPool,
};
