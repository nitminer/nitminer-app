import { getRedisClient } from './redis';

interface JobData {
  [key: string]: any;
}

interface JobOptions {
  attempts?: number;
  delay?: number; // milliseconds
  priority?: number;
}

/**
 * Redis-based job queue for background processing
 * Helps distribute work across multiple workers
 */
export class JobQueue {
  private queueName: string;
  private prefix = 'queue:';

  constructor(queueName: string) {
    this.queueName = queueName;
  }

  /**
   * Get full queue key
   */
  private getQueueKey(): string {
    return `${this.prefix}${this.queueName}`;
  }

  /**
   * Get processing key
   */
  private getProcessingKey(): string {
    return `${this.prefix}${this.queueName}:processing`;
  }

  /**
   * Add job to queue
   */
  async add(jobData: JobData, options: JobOptions = {}): Promise<string> {
    try {
      const client = getRedisClient();
      const jobId = `${this.queueName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const job = {
        id: jobId,
        data: jobData,
        attempts: options.attempts || 3,
        createdAt: Date.now(),
        priority: options.priority || 0,
      };

      const queueKey = this.getQueueKey();

      if (options.delay && options.delay > 0) {
        // Delayed job - use sorted set with future timestamp as score
        const delayedKey = `${this.prefix}${this.queueName}:delayed`;
        const executeAt = Date.now() + options.delay;
        await client.zadd(delayedKey, executeAt, JSON.stringify(job));
      } else {
        // Add to main queue
        await client.rpush(queueKey, JSON.stringify(job));
      }

      return jobId;
    } catch (error) {
      console.error('JobQueue add error:', error);
      throw error;
    }
  }

  /**
   * Get next job from queue (blocking)
   */
  async getNextJob(): Promise<JobData | null> {
    try {
      const client = getRedisClient();
      const queueKey = this.getQueueKey();

      // Move from queue to processing
      const jobStr = await client.rpoplpush(queueKey, this.getProcessingKey());

      if (!jobStr) return null;

      return JSON.parse(jobStr) as JobData;
    } catch (error) {
      console.error('JobQueue getNextJob error:', error);
      return null;
    }
  }

  /**
   * Mark job as completed
   */
  async complete(jobId: string): Promise<boolean> {
    try {
      const client = getRedisClient();
      const processingKey = this.getProcessingKey();

      // Remove from processing
      const items = await client.llen(processingKey);
      for (let i = 0; i < items; i++) {
        const item = await client.lpop(processingKey);
        if (item) {
          const job = JSON.parse(item);
          if (job.id === jobId) {
            // Found it, discard (already popped)
            return true;
          } else {
            // Not this one, put it back
            await client.rpush(processingKey, item);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('JobQueue complete error:', error);
      return false;
    }
  }

  /**
   * Mark job as failed
   */
  async fail(jobId: string, error: string): Promise<boolean> {
    try {
      const client = getRedisClient();
      const processingKey = this.getProcessingKey();
      const failedKey = `${this.prefix}${this.queueName}:failed`;

      // Move from processing to failed queue
      const items = await client.llen(processingKey);
      for (let i = 0; i < items; i++) {
        const item = await client.lpop(processingKey);
        if (item) {
          const job = JSON.parse(item);
          if (job.id === jobId) {
            job.failedAt = Date.now();
            job.error = error;
            await client.zadd(failedKey, Date.now(), JSON.stringify(job));
            return true;
          } else {
            await client.rpush(processingKey, item);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('JobQueue fail error:', error);
      return false;
    }
  }

  /**
   * Get queue stats
   */
  async getStats() {
    try {
      const client = getRedisClient();
      const queueKey = this.getQueueKey();
      const processingKey = this.getProcessingKey();
      const failedKey = `${this.prefix}${this.queueName}:failed`;
      const delayedKey = `${this.prefix}${this.queueName}:delayed`;

      const pending = await client.llen(queueKey);
      const processing = await client.llen(processingKey);
      const failed = await client.zcard(failedKey);
      const delayed = await client.zcard(delayedKey);

      return {
        pending,
        processing,
        failed,
        delayed,
        total: pending + processing + failed + delayed,
      };
    } catch (error) {
      console.error('JobQueue getStats error:', error);
      return { pending: 0, processing: 0, failed: 0, delayed: 0, total: 0 };
    }
  }

  /**
   * Clear queue
   */
  async clear(): Promise<boolean> {
    try {
      const client = getRedisClient();
      const queueKey = this.getQueueKey();
      const processingKey = this.getProcessingKey();
      const failedKey = `${this.prefix}${this.queueName}:failed`;
      const delayedKey = `${this.prefix}${this.queueName}:delayed`;

      await client.del(queueKey, processingKey, failedKey, delayedKey);
      return true;
    } catch (error) {
      console.error('JobQueue clear error:', error);
      return false;
    }
  }
}

// Create queues for different job types
export const emailQueue = new JobQueue('email');
export const notificationQueue = new JobQueue('notification');
export const reportQueue = new JobQueue('report');
export const paymentQueue = new JobQueue('payment');
export const analyticsQueue = new JobQueue('analytics');

export default JobQueue;
