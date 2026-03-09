import Redis, { Cluster } from 'ioredis';

let redisClient: Redis | Cluster | null = null;

/**
 * Get or create Redis client
 * Handles single instance and cluster configurations
 */
export const getRedisClient = (): Redis | Cluster => {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
  const redisPassword = process.env.REDIS_PASSWORD;
  const redisDB = parseInt(process.env.REDIS_DB || '0', 10);

  if (redisUrl) {
    // Connect using URL (useful for Redis Cloud, Heroku, etc.)
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      enableOfflineQueue: true,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true; // reconnect when the error message includes 'READONLY'
        }
        return false;
      },
    });
  } else {
    // Connect using host/port
    redisClient = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      db: redisDB,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      enableOfflineQueue: true,
      lazyConnect: false,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });
  }

  // Handle connection events
  redisClient.on('connect', () => {
    console.log('✅ Redis connected');
  });

  redisClient.on('ready', () => {
    console.log('🟢 Redis ready');
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis error:', err);
  });

  redisClient.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...');
  });

  redisClient.on('close', () => {
    console.log('🔴 Redis connection closed');
  });

  return redisClient;
};

/**
 * Check if Redis is available
 */
export const isRedisAvailable = async (): Promise<boolean> => {
  try {
    const client = getRedisClient();
    await client.ping();
    return true;
  } catch (error) {
    console.error('Redis availability check failed:', error);
    return false;
  }
};

/**
 * Close Redis connection
 */
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};

/**
 * Get Redis stats
 */
export const getRedisStats = async () => {
  try {
    const client = getRedisClient();
    const info = await client.info('stats');
    return info;
  } catch (error) {
    console.error('Failed to get Redis stats:', error);
    return null;
  }
};

export default getRedisClient;
