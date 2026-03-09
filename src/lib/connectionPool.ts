import { getRedisClient } from './redis';

/**
 * Connection pooling manager for Redis operations
 * Optimizes connection handling for high concurrency
 */
export class ConnectionPool {
  private poolKey = 'connection:pool';
  private activeConnectionsKey = 'connection:active';
  private maxConnections: number;

  constructor(maxConnections: number = 1000) {
    this.maxConnections = maxConnections;
  }

  /**
   * Register a new connection
   */
  async registerConnection(connectionId: string, metadata: any = {}): Promise<boolean> {
    try {
      const client = getRedisClient();

      // Check if we're at max connections
      const activeCount = await client.hlen(this.activeConnectionsKey);
      if (activeCount >= this.maxConnections) {
        console.warn(
          `Connection pool max capacity reached: ${activeCount}/${this.maxConnections}`
        );
        return false;
      }

      const connectionData = {
        id: connectionId,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        ...metadata,
      };

      await client.hset(
        this.activeConnectionsKey,
        connectionId,
        JSON.stringify(connectionData)
      );

      // Set auto-cleanup after 24 hours of inactivity
      await client.expire(this.activeConnectionsKey, 86400);

      return true;
    } catch (error) {
      console.error('ConnectionPool registerConnection error:', error);
      return false;
    }
  }

  /**
   * Unregister a connection
   */
  async unregisterConnection(connectionId: string): Promise<boolean> {
    try {
      const client = getRedisClient();
      await client.hdel(this.activeConnectionsKey, connectionId);
      return true;
    } catch (error) {
      console.error('ConnectionPool unregisterConnection error:', error);
      return false;
    }
  }

  /**
   * Update connection activity
   */
  async updateActivity(connectionId: string): Promise<boolean> {
    try {
      const client = getRedisClient();

      const data = await client.hget(this.activeConnectionsKey, connectionId);
      if (!data) return false;

      const connection = JSON.parse(data);
      connection.lastActivity = Date.now();

      await client.hset(
        this.activeConnectionsKey,
        connectionId,
        JSON.stringify(connection)
      );

      return true;
    } catch (error) {
      console.error('ConnectionPool updateActivity error:', error);
      return false;
    }
  }

  /**
   * Get active connections count
   */
  async getActiveConnectionCount(): Promise<number> {
    try {
      const client = getRedisClient();
      return await client.hlen(this.activeConnectionsKey);
    } catch (error) {
      console.error('ConnectionPool getActiveConnectionCount error:', error);
      return 0;
    }
  }

  /**
   * Get all active connections
   */
  async getActiveConnections(): Promise<Array<any>> {
    try {
      const client = getRedisClient();
      const data = await client.hgetall(this.activeConnectionsKey);

      const connections: any[] = [];
      for (const [key, value] of Object.entries(data)) {
        connections.push(JSON.parse(value as string));
      }

      return connections;
    } catch (error) {
      console.error('ConnectionPool getActiveConnections error:', error);
      return [];
    }
  }

  /**
   * Check if connection exists
   */
  async connectionExists(connectionId: string): Promise<boolean> {
    try {
      const client = getRedisClient();
      const exists = await client.hexists(this.activeConnectionsKey, connectionId);
      return exists === 1;
    } catch (error) {
      console.error('ConnectionPool connectionExists error:', error);
      return false;
    }
  }

  /**
   * Cleanup inactive connections (older than maxAgeMs)
   */
  async cleanupInactiveConnections(maxAgeMs: number = 3600000): Promise<number> {
    try {
      const client = getRedisClient();
      const now = Date.now();
      const allConnections = await this.getActiveConnections();

      let cleanedCount = 0;

      for (const connection of allConnections) {
        if (now - connection.lastActivity > maxAgeMs) {
          await this.unregisterConnection(connection.id);
          cleanedCount++;
        }
      }

      return cleanedCount;
    } catch (error) {
      console.error('ConnectionPool cleanupInactiveConnections error:', error);
      return 0;
    }
  }

  /**
   * Get pool stats
   */
  async getStats() {
    try {
      const activeCount = await this.getActiveConnectionCount();
      const availableSlots = this.maxConnections - activeCount;

      return {
        active: activeCount,
        max: this.maxConnections,
        available: availableSlots,
        utilization: `${((activeCount / this.maxConnections) * 100).toFixed(2)}%`,
      };
    } catch (error) {
      console.error('ConnectionPool getStats error:', error);
      return {
        active: 0,
        max: this.maxConnections,
        available: this.maxConnections,
        utilization: '0%',
      };
    }
  }
}

export const connectionPool = new ConnectionPool(1000);

export default ConnectionPool;
