import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient, isRedisAvailable } from '@/lib/redis';
import { connectionPool } from '@/lib/connectionPool';
import { apiRateLimiter, authRateLimiter, chatRateLimiter } from '@/lib/rateLimiter';

/**
 * GET /api/health/redis
 * Health check and Redis monitoring endpoint
 * Returns status of Redis, connections, and performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    const redisAvailable = await isRedisAvailable();

    if (!redisAvailable) {
      return NextResponse.json(
        {
          status: 'degraded',
          message: 'Redis is not available',
          redis: {
            available: false,
            connected: false,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // Get Redis info
    const client = getRedisClient();
    const info = await client.info('stats');
    const memoryInfo = await client.info('memory');
    const clientsInfo = await client.info('clients');

    // Get connection pool stats
    const poolStats = await connectionPool.getStats();

    // Parse Redis info
    const parseInfo = (infoStr: string) => {
      const result: Record<string, any> = {};
      const lines = infoStr.split('\r\n');
      for (const line of lines) {
        if (line && !line.startsWith('#')) {
          const [key, value] = line.split(':');
          if (key && value) {
            result[key] = isNaN(Number(value)) ? value : Number(value);
          }
        }
      }
      return result;
    };

    const statsData = parseInfo(info || '');
    const memoryData = parseInfo(memoryInfo || '');
    const clientsData = parseInfo(clientsInfo || '');

    // Calculate memory usage percentage
    const usedMemory = memoryData.used_memory_human || 'N/A';
    const maxMemory = memoryData.maxmemory_human || 'N/A';
    const memoryPercent = memoryData.maxmemory
      ? ((memoryData.used_memory / memoryData.maxmemory) * 100).toFixed(2)
      : 'N/A';

    const responseData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      redis: {
        available: true,
        connected: true,
        version: memoryData.redis_version || 'N/A',
        mode: memoryData.redis_mode || 'N/A',
        uptime: {
          seconds: statsData.uptime_in_seconds || 0,
          days: statsData.uptime_in_days || 0,
        },
        stats: {
          totalConnections: statsData.total_connections_received || 0,
          totalCommands: statsData.total_commands_processed || 0,
          rejectedConnections: statsData.rejected_connections || 0,
        },
        memory: {
          used: usedMemory,
          max: maxMemory,
          percentUsed: memoryPercent,
          rssMemory: memoryData.used_memory_rss_human || 'N/A',
          fragmentation: memoryData.mem_fragmentation_ratio || 0,
        },
        clients: {
          connected: clientsData.connected_clients || 0,
          blocked: clientsData.blocked_clients || 0,
          maxClients: memoryData.maxclients || 0,
        },
      },
      connections: poolStats,
      performance: {
        commandsExecuted: statsData.total_commands_processed || 0,
        keyspace: {
          databases: Object.keys(statsData)
            .filter((key) => key.startsWith('db'))
            .map((key) => ({
              name: key,
              ...statsData[key],
            })),
        },
      },
      healthScore: calculateHealthScore({
        redisAvailable: true,
        memoryPercent: typeof memoryPercent === 'string' ? parseFloat(memoryPercent) : 0,
        connectedClients: clientsData.connected_clients || 0,
        poolUtilization: typeof poolStats.utilization === 'string'
          ? parseFloat(poolStats.utilization)
          : 0,
      }),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Redis health check error:', error);

    return NextResponse.json(
      {
        status: 'error',
        error: String(error),
        message: 'Failed to check Redis health',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate overall health score (0-100)
 */
function calculateHealthScore(metrics: {
  redisAvailable: boolean;
  memoryPercent: number;
  connectedClients: number;
  poolUtilization: number;
}): number {
  if (!metrics.redisAvailable) return 0;

  let score = 100;

  // Deduct points for high memory usage
  if (metrics.memoryPercent > 90) score -= 30;
  else if (metrics.memoryPercent > 75) score -= 15;
  else if (metrics.memoryPercent > 50) score -= 5;

  // Deduct points for high connection pool usage
  if (metrics.poolUtilization > 90) score -= 20;
  else if (metrics.poolUtilization > 75) score -= 10;

  // Deduct points for many connected clients
  if (metrics.connectedClients > 1000) score -= 15;
  else if (metrics.connectedClients > 500) score -= 10;

  return Math.max(0, Math.min(100, score));
}
