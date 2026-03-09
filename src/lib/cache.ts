import { getRedisClient, isRedisAvailable } from './redis';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

const DEFAULT_TTL = 3600; // 1 hour
const DEFAULT_PREFIX = 'cache:';

/**
 * Cache utility class for Redis operations
 */
export class CacheManager {
  private prefix: string;
  private ttl: number;
  private redisAvailable: boolean = true;

  constructor(options: CacheOptions = {}) {
    this.prefix = options.prefix || DEFAULT_PREFIX;
    this.ttl = options.ttl || DEFAULT_TTL;
  }

  /**
   * Generate cache key
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      if (!this.redisAvailable) return false;

      const client = getRedisClient();
      const cacheKey = this.getKey(key);
      const expiration = ttl || this.ttl;
      const serialized = JSON.stringify(value);

      if (expiration > 0) {
        await client.setex(cacheKey, expiration, serialized);
      } else {
        await client.set(cacheKey, serialized);
      }

      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      this.redisAvailable = false;
      return false;
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.redisAvailable) return null;

      const client = getRedisClient();
      const cacheKey = this.getKey(key);
      const value = await client.get(cacheKey);

      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      if (!this.redisAvailable) return false;

      const client = getRedisClient();
      const cacheKey = this.getKey(key);
      await client.del(cacheKey);

      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple values
   */
  async deleteMany(keys: string[]): Promise<boolean> {
    try {
      if (!this.redisAvailable) return false;

      const client = getRedisClient();
      const cacheKeys = keys.map((key) => this.getKey(key));

      if (cacheKeys.length === 0) return true;

      await client.del(...cacheKeys);
      return true;
    } catch (error) {
      console.error(`Cache deleteMany error:`, error);
      return false;
    }
  }

  /**
   * Clear all cache with prefix
   */
  async clear(): Promise<boolean> {
    try {
      if (!this.redisAvailable) return false;

      const client = getRedisClient();
      const pattern = `${this.prefix}*`;
      const keys = await client.keys(pattern);

      if (keys.length === 0) return true;

      await client.del(...keys);
      return true;
    } catch (error) {
      console.error(`Cache clear error:`, error);
      return false;
    }
  }

  /**
   * Get or set cached value
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    try {
      // Try to get from cache
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // Cache miss - fetch from source
      const value = await fetchFn();

      // Set in cache
      await this.set(key, value, ttl);

      return value;
    } catch (error) {
      console.error(`Cache getOrSet error for key ${key}:`, error);
      // If cache fails, just fetch from source
      return fetchFn();
    }
  }

  /**
   * Increment counter
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      if (!this.redisAvailable) return amount;

      const client = getRedisClient();
      const cacheKey = this.getKey(key);
      const result = await client.incrby(cacheKey, amount);

      return result;
    } catch (error) {
      console.error(`Cache increment error for key ${key}:`, error);
      return amount;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      if (!this.redisAvailable) return false;

      const client = getRedisClient();
      const cacheKey = this.getKey(key);
      const exists = await client.exists(cacheKey);

      return exists === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get TTL of a key
   */
  async getTTL(key: string): Promise<number> {
    try {
      if (!this.redisAvailable) return -1;

      const client = getRedisClient();
      const cacheKey = this.getKey(key);
      const ttl = await client.ttl(cacheKey);

      return ttl;
    } catch (error) {
      console.error(`Cache getTTL error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Set expiration on existing key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      if (!this.redisAvailable) return false;

      const client = getRedisClient();
      const cacheKey = this.getKey(key);
      const result = await client.expire(cacheKey, ttl);

      return result === 1;
    } catch (error) {
      console.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  }
}

// Create singleton instances for different cache types
export const userCache = new CacheManager({
  prefix: 'user:',
  ttl: 3600, // 1 hour
});

export const sessionCache = new CacheManager({
  prefix: 'session:',
  ttl: 86400, // 24 hours
});

export const chatCache = new CacheManager({
  prefix: 'chat:',
  ttl: 3600, // 1 hour
});

export const profileCache = new CacheManager({
  prefix: 'profile:',
  ttl: 1800, // 30 minutes
});

export const quotationCache = new CacheManager({
  prefix: 'quotation:',
  ttl: 1800, // 30 minutes
});

export const paymentCache = new CacheManager({
  prefix: 'payment:',
  ttl: 600, // 10 minutes
});

export default CacheManager;
