import { Injectable, Inject } from "@nestjs/common";
import { Redis } from "ioredis";
import { logger } from "@ncbs/logger";

@Injectable()
export class DistributedLockService {
  constructor(
    @Inject("REDIS_CLIENT")
    private readonly redis: Redis
  ) {}

  async acquireLock(key: string, ttl = 300): Promise<string | null> {
    const lockKey = `lock:${key}`;
    const token = `${Date.now()}-${Math.random()}`;

    try {
      const result = await this.redis.set(lockKey, token, "EX", ttl, "NX");

      if (result === "OK") {
        logger.info(`🔒 Lock acquired: ${lockKey}`, { ttl });
        return token;
      }

      logger.debug(`Lock already held: ${lockKey}`);
      return null;
    } catch (error) {
      logger.error(`Failed to acquire lock: ${lockKey}`, error);
      throw error;
    }
  }

  async releaseLock(key: string, token: string): Promise<boolean> {
    const lockKey = `lock:${key}`;

    try {
      // Lua script ensures atomic check-and-delete
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;

      const result = await this.redis.eval(script, 1, lockKey, token);

      if (result === 1) {
        logger.info(`🔓 Lock released: ${lockKey}`);
        return true;
      }

      logger.warn(
        `Lock not released (already expired or not owned): ${lockKey}`
      );
      return false;
    } catch (error) {
      logger.error(`Failed to release lock: ${lockKey}`, error);
      throw error;
    }
  }

  async withLock<T>(
    key: string,
    ttl: number,
    fn: () => Promise<T>
  ): Promise<T> {
    const token = await this.acquireLock(key, ttl);

    if (!token) {
      throw new Error(`Failed to acquire lock: ${key}`);
    }

    try {
      const result = await fn();
      return result;
    } finally {
      await this.releaseLock(key, token);
    }
  }

  async acquireLockWithRetry(
    key: string,
    ttl = 300,
    maxRetries = 3,
    retryDelay = 1000
  ): Promise<string | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const token = await this.acquireLock(key, ttl);

      if (token) {
        return token;
      }

      if (attempt < maxRetries) {
        logger.debug(
          `Lock acquisition attempt ${attempt}/${maxRetries} failed, retrying in ${retryDelay}ms`,
          { key }
        );
        await this.sleep(retryDelay);
      }
    }

    logger.warn(`Failed to acquire lock after ${maxRetries} attempts`, { key });
    return null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
