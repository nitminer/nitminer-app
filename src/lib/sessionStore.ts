import { getRedisClient } from './redis';

interface SessionData {
  userId: string;
  email: string;
  role: string;
  tokenVersion?: number;
  createdAt: number;
  expiresAt: number;
  [key: string]: any;
}

/**
 * Redis-based session store for user sessions
 * Replaces in-memory session storage for scalability
 */
export class SessionStore {
  private prefix = 'session:';

  /**
   * Create or update session
   */
  async createSession(sessionId: string, data: SessionData, ttl: number = 86400): Promise<boolean> {
    try {
      const client = getRedisClient();
      const key = `${this.prefix}${sessionId}`;
      const serialized = JSON.stringify({
        ...data,
        createdAt: data.createdAt || Date.now(),
        expiresAt: data.expiresAt || Date.now() + ttl * 1000,
      });

      await client.setex(key, ttl, serialized);
      return true;
    } catch (error) {
      console.error('Session store createSession error:', error);
      return false;
    }
  }

  /**
   * Get session
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const client = getRedisClient();
      const key = `${this.prefix}${sessionId}`;
      const data = await client.get(key);

      if (!data) return null;

      return JSON.parse(data) as SessionData;
    } catch (error) {
      console.error('Session store getSession error:', error);
      return null;
    }
  }

  /**
   * Update session
   */
  async updateSession(sessionId: string, updates: Partial<SessionData>, ttl?: number): Promise<boolean> {
    try {
      const client = getRedisClient();
      const key = `${this.prefix}${sessionId}`;

      const existing = await this.getSession(sessionId);
      if (!existing) return false;

      const updated = { ...existing, ...updates };
      const serialized = JSON.stringify(updated);

      if (ttl) {
        await client.setex(key, ttl, serialized);
      } else {
        // Renew TTL without changing the value
        const currentTtl = await client.ttl(key);
        if (currentTtl > 0) {
          await client.setex(key, currentTtl, serialized);
        } else {
          await client.set(key, serialized);
        }
      }

      return true;
    } catch (error) {
      console.error('Session store updateSession error:', error);
      return false;
    }
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const client = getRedisClient();
      const key = `${this.prefix}${sessionId}`;
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Session store deleteSession error:', error);
      return false;
    }
  }

  /**
   * Delete all sessions for a user
   */
  async deleteUserSessions(userId: string): Promise<number> {
    try {
      const client = getRedisClient();
      const pattern = `${this.prefix}*`;
      const keys = await client.keys(pattern);

      let deletedCount = 0;
      for (const key of keys) {
        const data = await client.get(key);
        if (data) {
          const session = JSON.parse(data) as SessionData;
          if (session.userId === userId) {
            await client.del(key);
            deletedCount++;
          }
        }
      }

      return deletedCount;
    } catch (error) {
      console.error('Session store deleteUserSessions error:', error);
      return 0;
    }
  }

  /**
   * Extend session TTL
   */
  async extendSession(sessionId: string, additionalTtl: number): Promise<boolean> {
    try {
      const client = getRedisClient();
      const key = `${this.prefix}${sessionId}`;

      const exists = await client.exists(key);
      if (exists === 0) return false;

      const currentTtl = await client.ttl(key);
      const newTtl = currentTtl > 0 ? currentTtl + additionalTtl : additionalTtl;

      await client.expire(key, newTtl);
      return true;
    } catch (error) {
      console.error('Session store extendSession error:', error);
      return false;
    }
  }

  /**
   * Check if session exists
   */
  async sessionExists(sessionId: string): Promise<boolean> {
    try {
      const client = getRedisClient();
      const key = `${this.prefix}${sessionId}`;
      const exists = await client.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Session store sessionExists error:', error);
      return false;
    }
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string): Promise<Array<{ id: string; data: SessionData }>> {
    try {
      const client = getRedisClient();
      const pattern = `${this.prefix}*`;
      const keys = await client.keys(pattern);

      const sessions: Array<{ id: string; data: SessionData }> = [];

      for (const key of keys) {
        const data = await client.get(key);
        if (data) {
          const session = JSON.parse(data) as SessionData;
          if (session.userId === userId) {
            const sessionId = key.replace(this.prefix, '');
            sessions.push({ id: sessionId, data: session });
          }
        }
      }

      return sessions;
    } catch (error) {
      console.error('Session store getUserSessions error:', error);
      return [];
    }
  }

  /**
   * Count active sessions
   */
  async countActiveSessions(): Promise<number> {
    try {
      const client = getRedisClient();
      const pattern = `${this.prefix}*`;
      const keys = await client.keys(pattern);
      return keys.length;
    } catch (error) {
      console.error('Session store countActiveSessions error:', error);
      return 0;
    }
  }
}

export const sessionStore = new SessionStore();

export default SessionStore;
