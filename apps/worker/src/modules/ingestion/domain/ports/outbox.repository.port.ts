import { JobType, OutboxStatus } from "@ncbs/database";

/**
 * Port: Outbox Repository
 *
 * Defines the contract for outbox pattern implementation.
 * Ensures transactional job scheduling with resumability.
 */
export interface IOutboxRepository {
  /**
   * Bulk insert job intents in a single transaction
   * @param jobs - Array of job intents to schedule
   * @returns Promise that resolves when all jobs are persisted
   */
  createBatch(jobs: OutboxJobIntent[]): Promise<void>;

  /**
   * Find pending jobs ready to process
   * @param limit - Maximum number of jobs to retrieve
   * @returns Array of pending jobs
   */
  findPendingJobs(limit: number): Promise<OutboxJob[]>;

  /**
   * Mark job as processing with optimistic locking
   * @param id - Job ID
   * @returns true if successfully claimed, false if already claimed
   */
  markAsProcessing(id: string): Promise<boolean>;

  /**
   * Mark job as completed
   * @param id - Job ID
   */
  markAsCompleted(id: string): Promise<void>;

  /**
   * Mark job as failed and increment attempt counter
   * @param id - Job ID
   * @param error - Error message
   */
  markAsFailed(id: string, error: string): Promise<void>;

  /**
   * Get batch statistics
   * @param batchId - Batch ID
   * @returns Statistics object with counts by status
   */
  getBatchStats(batchId: string): Promise<BatchStats>;

  /**
   * Retry all failed jobs in a batch
   * @param batchId - Batch ID
   * @returns Number of jobs retried
   */
  retryFailedJobs(batchId: string): Promise<number>;

  /**
   * Find jobs by batch ID and status
   * @param batchId - Batch ID
   * @param status - Job status
   * @returns Array of matching jobs
   */
  findByBatchAndStatus(
    batchId: string,
    status: OutboxStatus
  ): Promise<OutboxJob[]>;
}

/**
 * Job intent to be scheduled
 */
export interface OutboxJobIntent {
  jobType: JobType;
  batchId?: string;
  payload: Record<string, any>;
  scheduledAt?: Date;
  maxAttempts?: number;
}

/**
 * Job retrieved from outbox
 */
export interface OutboxJob {
  id: string;
  jobType: JobType;
  batchId?: string | null;
  payload: Record<string, any>;
  attempts: number;
  maxAttempts: number;
}

/**
 * Batch statistics
 */
export interface BatchStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}
