import { Injectable, Inject } from "@nestjs/common";
import { logger } from "@ncbs/logger";
import { JobType } from "@ncbs/database";
import { IOutboxRepository } from "../../domain/ports/outbox.repository.port";
import { IUniversityAdapterSelector } from "../../domain/ports/university-adapter-selector.port";
import { IngestionProviders } from "../../domain/providers/ingestion.providers";
import { DistributedLockService } from "../services/distributed-lock.service";
import { createHash } from "node:crypto";
import { randomUUID } from "node:crypto";

export interface CoordinateSyllabusSyncDto {
  universityCode: string;
  year?: string;
  semester?: string;
}

export interface CoordinateSyncResult {
  batchId: string;
  alreadyExists: boolean;
  totalJobs: number;
  totalItems?: number;
  estimatedMinutes?: number;
  stats?: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  message?: string;
}

@Injectable()
export class CoordinateSyllabusSyncUseCase {
  constructor(
    @Inject(IngestionProviders.OUTBOX_REPOSITORY)
    private readonly outboxRepository: IOutboxRepository,
    @Inject(IngestionProviders.ADAPTER_SELECTOR)
    private readonly adapterSelector: IUniversityAdapterSelector,
    private readonly lockService: DistributedLockService
  ) {}

  async execute(dto: CoordinateSyllabusSyncDto): Promise<CoordinateSyncResult> {
    const batchId = this.generateBatchId(dto);

    logger.info(`Starting coordination for batch ${batchId}`, {
      universityCode: dto.universityCode,
      year: dto.year,
      semester: dto.semester,
    });

    const existingStats = await this.outboxRepository.getBatchStats(batchId);

    if (existingStats.total > 0) {
      logger.info(
        `Batch ${batchId} already exists (${existingStats.total} jobs), returning existing batch`,
        { stats: existingStats }
      );

      return {
        batchId,
        alreadyExists: true,
        totalJobs: existingStats.total,
        stats: existingStats,
        message: "Sync already in progress or completed",
      };
    }

    const lockKey = this.generateLockKey(dto);

    try {
      return await this.lockService.withLock(lockKey, 300, async () => {
        logger.info(`🔒 Lock acquired for ${lockKey}, starting coordination`);

        const recheck = await this.outboxRepository.getBatchStats(batchId);

        if (recheck.total > 0) {
          logger.info(`Batch ${batchId} was created while waiting for lock`, {
            stats: recheck,
          });

          return {
            batchId,
            alreadyExists: true,
            totalJobs: recheck.total,
            stats: recheck,
            message: "Sync was started by another process",
          };
        }

        const adapter = this.adapterSelector.getAdapter(dto.universityCode);

        logger.info(
          `Fetching first page to discover pagination metadata for ${dto.universityCode}`
        );

        const firstPageResult = await adapter.fetchPage({
          page: 1,
          pageSize: 100,
          year: dto.year,
          semester: dto.semester,
        });

        const { totalItems, totalPages, pageSize } = firstPageResult.metadata;

        logger.info(
          `Discovered ${totalItems} items across ${totalPages} pages for ${dto.universityCode}`,
          {
            totalItems,
            totalPages,
            pageSize,
          }
        );

        const jobs = [];
        for (let page = 1; page <= totalPages; page++) {
          jobs.push({
            jobType: JobType.FETCH_SYLLABUS,
            batchId,
            payload: {
              universityCode: dto.universityCode,
              page,
              pageSize,
              year: dto.year,
              semester: dto.semester,
              isPaginated: true,
            },
          });
        }

        await this.outboxRepository.createBatch(jobs);

        logger.info(
          `✅ Successfully created ${jobs.length} page jobs for batch ${batchId}`,
          {
            batchId,
            totalJobs: jobs.length,
            totalItems,
          }
        );

        return {
          batchId,
          alreadyExists: false,
          totalJobs: jobs.length,
          totalItems,
          estimatedMinutes: Math.ceil(jobs.length / 12), // ~1200 jobs/min ÷ 100
          message: "Sync coordination completed successfully",
        };
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Failed to acquire lock")
      ) {
        logger.warn(
          `Could not acquire lock for ${lockKey}, another pod is coordinating`
        );

        await this.sleep(2000);

        const stats = await this.outboxRepository.getBatchStats(batchId);

        if (stats.total > 0) {
          return {
            batchId,
            alreadyExists: true,
            totalJobs: stats.total,
            stats,
            message: "Coordination in progress by another pod",
          };
        }

        throw new Error(
          "Sync coordination in progress, please try again in a few seconds"
        );
      }

      logger.error(`Coordination failed for batch ${batchId}`, error);
      throw error;
    }
  }

  private generateBatchId(dto: CoordinateSyllabusSyncDto): string {
    const today = new Date().toISOString().split("T")[0];

    const key = [
      dto.universityCode,
      dto.year || "all",
      dto.semester || "all",
      today,
    ].join(":");

    const hash = createHash("sha256").update(key).digest("hex");

    return [
      hash.substring(0, 8),
      hash.substring(8, 12),
      hash.substring(12, 16),
      hash.substring(16, 20),
      hash.substring(20, 32),
    ].join("-");
  }

  private generateLockKey(dto: CoordinateSyllabusSyncDto): string {
    return `sync:${dto.universityCode}:${dto.year || "all"}:${
      dto.semester || "all"
    }`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getBatchStatus(batchId: string) {
    const stats = await this.outboxRepository.getBatchStats(batchId);

    const progress =
      stats.total > 0
        ? Math.round(((stats.completed + stats.failed) / stats.total) * 100)
        : 0;

    return {
      batchId,
      ...stats,
      progress,
      isComplete: stats.completed + stats.failed === stats.total,
    };
  }

  async retryFailedJobs(batchId: string): Promise<number> {
    logger.info(`Retrying failed jobs in batch ${batchId}`);

    const retried = await this.outboxRepository.retryFailedJobs(batchId);

    logger.info(`Retried ${retried} jobs in batch ${batchId}`, {
      batchId,
      retriedCount: retried,
    });

    return retried;
  }
}
