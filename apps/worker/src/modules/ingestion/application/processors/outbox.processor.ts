import { Injectable, Inject } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { logger } from "@ncbs/logger";
import { JobType } from "@ncbs/database";
import { IOutboxRepository } from "../../domain/ports/outbox.repository.port";
import { IngestionProviders } from "../../domain/providers/ingestion.providers";
import { FetchSyllabusUseCase } from "../syllabus/use-cases/fetch-syllabus.use-case";

@Injectable()
export class OutboxProcessor {
  private isProcessing = false;
  private readonly BATCH_SIZE = 100;

  constructor(
    @Inject(IngestionProviders.OUTBOX_REPOSITORY)
    private readonly outboxRepository: IOutboxRepository,
    private readonly fetchSyllabusUseCase: FetchSyllabusUseCase
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async processPendingJobs() {
    logger.info("Processing pending outbox jobs");
    if (this.isProcessing) {
      logger.debug("Outbox processor already running, skipping cycle");
      return;
    }

    this.isProcessing = true;

    try {
      const jobs = await this.outboxRepository.findPendingJobs(this.BATCH_SIZE);

      if (jobs.length === 0) {
        return;
      }

      logger.info(`Processing ${jobs.length} outbox jobs`);

      const results = await Promise.allSettled(
        jobs.map((job) => this.processJob(job))
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (succeeded > 0 || failed > 0) {
        logger.info(
          `Outbox cycle complete: ${succeeded} succeeded, ${failed} failed`
        );
      }
    } catch (error) {
      logger.error("Error in outbox processor", error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processJob(job: any) {
    try {
      const claimed = await this.outboxRepository.markAsProcessing(job.id);

      if (!claimed) {
        logger.debug(`Job ${job.id} already claimed by another worker`);
        return;
      }

      // Execute use case directly based on job type
      await this.executeJob(job);

      await this.outboxRepository.markAsCompleted(job.id);

      logger.debug(`Job ${job.id} completed successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      logger.error(`Failed to process outbox job ${job.id}: ${errorMessage}`);

      await this.outboxRepository.markAsFailed(job.id, errorMessage);
    }
  }

  private async executeJob(job: any): Promise<void> {
    switch (job.jobType) {
      case JobType.FETCH_SYLLABUS:
        await this.fetchSyllabusUseCase.execute(job.payload);
        break;
      default:
        throw new Error(`Unknown job type: ${job.jobType}`);
    }
  }

  async triggerProcessing(): Promise<void> {
    await this.processPendingJobs();
  }
}
