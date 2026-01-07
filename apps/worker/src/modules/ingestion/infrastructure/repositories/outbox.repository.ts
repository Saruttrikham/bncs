import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Outbox, OutboxStatus } from "@ncbs/database";
import { logger } from "@ncbs/logger";
import {
  IOutboxRepository,
  OutboxJobIntent,
  OutboxJob,
  BatchStats,
} from "../../domain/ports/outbox.repository.port";

/**
 * Infrastructure Implementation: Outbox Repository
 *
 * Implements the outbox pattern for transactional job scheduling.
 * Provides persistence layer for job intents using TypeORM and Oracle.
 */
@Injectable()
export class OutboxRepository implements IOutboxRepository {
  constructor(
    @InjectRepository(Outbox)
    private readonly repository: Repository<Outbox>
  ) {}

  async createBatch(jobs: OutboxJobIntent[]): Promise<void> {
    const entities = jobs.map((job) => ({
      jobType: job.jobType,
      batchId: job.batchId ?? null,
      payload: JSON.stringify(job.payload),
      status: OutboxStatus.PENDING,
      attempts: 0,
      maxAttempts: job.maxAttempts ?? 5,
      scheduledAt: job.scheduledAt ?? new Date(),
      updatedAt: new Date(),
    }));

    // Bulk insert in a single transaction
    // Oracle supports batch inserts efficiently
    await this.repository
      .createQueryBuilder()
      .insert()
      .into(Outbox)
      .values(entities)
      .execute();

    logger.info(`Created ${jobs.length} outbox jobs`, {
      batchId: jobs[0]?.batchId,
    });
  }

  async findPendingJobs(limit: number): Promise<OutboxJob[]> {
    const now = new Date();

    const jobs = await this.repository.find({
      where: {
        status: OutboxStatus.PENDING,
      },
      order: {
        createdAt: "ASC",
      },
      take: limit * 2, // Fetch more since we'll filter by scheduledAt
    });

    // Filter out jobs that are scheduled for the future
    const readyJobs = jobs.filter((job) => {
      if (!job.scheduledAt) return true;
      return job.scheduledAt <= now;
    });

    // Return only up to the limit
    const limited = readyJobs.slice(0, limit);

    if (jobs.length > 0) {
      logger.debug(
        `Found ${jobs.length} pending jobs, ${readyJobs.length} ready to process, returning ${limited.length}`
      );
    }

    return limited.map((job) => this.mapToOutboxJob(job));
  }

  async markAsProcessing(id: string): Promise<boolean> {
    // Optimistic locking: only update if still PENDING
    // This prevents multiple workers from processing the same job
    const result = await this.repository
      .createQueryBuilder()
      .update(Outbox)
      .set({
        status: OutboxStatus.PROCESSING,
        updatedAt: new Date(),
      })
      .where("id = :id", { id })
      .andWhere("status = :status", { status: OutboxStatus.PENDING })
      .execute();

    const claimed = (result.affected ?? 0) === 1;

    if (claimed) {
      logger.debug(`Job ${id} claimed for processing`);
    }

    return claimed;
  }

  async markAsCompleted(id: string): Promise<void> {
    await this.repository.update(id, {
      status: OutboxStatus.COMPLETED,
      processedAt: new Date(),
      updatedAt: new Date(),
    });

    logger.debug(`Job ${id} marked as completed`);
  }

  async markAsFailed(id: string, error: string): Promise<void> {
    const job = await this.repository.findOne({ where: { id } });

    if (!job) {
      logger.warn(`Job ${id} not found when marking as failed`);
      return;
    }

    const newAttempts = job.attempts + 1;
    const isRetryable = this.isRetryableError(error);
    const shouldRetry = isRetryable && newAttempts < job.maxAttempts;

    const status = shouldRetry ? OutboxStatus.PENDING : OutboxStatus.FAILED;

    // Calculate exponential backoff with jitter
    const scheduledAt = shouldRetry
      ? this.calculateNextRetry(newAttempts)
      : null;

    await this.repository.update(id, {
      status,
      attempts: newAttempts,
      errorMessage: error.substring(0, 2000), // Oracle VARCHAR2 limit
      scheduledAt: scheduledAt as any, // TypeORM will handle Date | null
      updatedAt: new Date(),
    });

    if (shouldRetry) {
      const delaySeconds = scheduledAt
        ? Math.round((scheduledAt.getTime() - Date.now()) / 1000)
        : 0;

      logger.warn(
        `Job ${id} failed (attempt ${newAttempts}/${job.maxAttempts}), ` +
          `retrying in ${delaySeconds}s: ${error.substring(0, 100)}`
      );
    } else {
      logger.error(
        `Job ${id} permanently failed after ${newAttempts} attempts: ${error.substring(
          0,
          100
        )}`
      );
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: string): boolean {
    const errorLower = error.toLowerCase();

    // Permanent errors (don't retry)
    const permanentErrors = [
      "404",
      "not found",
      "invalid university code",
      "validation failed",
      "bad request",
      "unauthorized",
      "forbidden",
    ];

    for (const permanentError of permanentErrors) {
      if (errorLower.includes(permanentError)) {
        return false;
      }
    }

    // Everything else is considered transient and retryable
    return true;
  }

  /**
   * Calculate next retry time with exponential backoff + jitter
   */
  private calculateNextRetry(attempts: number): Date {
    // Base delay: 2^attempts seconds (2s, 4s, 8s, 16s, 32s)
    const baseDelayMs = Math.min(2 ** attempts * 1000, 32000);

    // Add jitter: ±25% randomness to prevent thundering herd
    const jitter = baseDelayMs * 0.25 * (Math.random() * 2 - 1);
    const totalDelayMs = Math.max(baseDelayMs + jitter, 1000); // Min 1 second

    return new Date(Date.now() + totalDelayMs);
  }

  async getBatchStats(batchId: string): Promise<BatchStats> {
    const [total, pending, processing, completed, failed] = await Promise.all([
      this.repository.count({ where: { batchId } }),
      this.repository.count({
        where: { batchId, status: OutboxStatus.PENDING },
      }),
      this.repository.count({
        where: { batchId, status: OutboxStatus.PROCESSING },
      }),
      this.repository.count({
        where: { batchId, status: OutboxStatus.COMPLETED },
      }),
      this.repository.count({
        where: { batchId, status: OutboxStatus.FAILED },
      }),
    ]);

    return { total, pending, processing, completed, failed };
  }

  async retryFailedJobs(batchId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .update(Outbox)
      .set({
        status: OutboxStatus.PENDING,
        attempts: 0,
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where("batch_id = :batchId", { batchId })
      .andWhere("status = :status", { status: OutboxStatus.FAILED })
      .execute();

    const retried = result.affected ?? 0;

    if (retried > 0) {
      logger.info(`Retried ${retried} failed jobs in batch ${batchId}`);
    }

    return retried;
  }

  async findByBatchAndStatus(
    batchId: string,
    status: OutboxStatus
  ): Promise<OutboxJob[]> {
    const jobs = await this.repository.find({
      where: { batchId, status },
      order: { createdAt: "ASC" },
    });

    return jobs.map((job) => this.mapToOutboxJob(job));
  }

  /**
   * Map database entity to domain object
   */
  private mapToOutboxJob(entity: Outbox): OutboxJob {
    return {
      id: entity.id,
      jobType: entity.jobType,
      batchId: entity.batchId,
      payload: JSON.parse(entity.payload),
      attempts: entity.attempts,
      maxAttempts: entity.maxAttempts,
    };
  }
}
