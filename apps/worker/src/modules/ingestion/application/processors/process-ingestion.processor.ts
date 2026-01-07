import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { logger } from "@ncbs/logger";
import { CoordinateSyllabusSyncUseCase } from "../use-cases/coordinate-syllabus-sync.use-case";
import { QueueNames, JobNames } from "../../domain/constants/queue-names";

type CoordinateSyncPayload = {
  universityCode: string;
  year?: string;
  semester?: string;
};

type IngestionJobPayload = CoordinateSyncPayload | { ingestionLogId: string };

@Processor(QueueNames.INGESTION)
export class ProcessIngestionProcessor extends WorkerHost {
  constructor(private readonly coordinateSync: CoordinateSyllabusSyncUseCase) {
    super();
  }

  async process(job: Job<IngestionJobPayload>) {
    // Route 1: Coordinate sync (trigger batch creation)
    if (job.name === JobNames.COORDINATE_SYNC) {
      const payload = job.data as CoordinateSyncPayload;

      logger.info(
        `🎯 Coordinating sync for ${payload.universityCode}`,
        payload
      );

      const result = await this.coordinateSync.execute(payload);

      logger.info(
        `✅ Coordination complete: ${result.totalJobs} jobs created`,
        {
          batchId: result.batchId,
          totalJobs: result.totalJobs,
        }
      );

      return result;
    }

    // Route 2: Process ingestion (legacy)
    if (job.name === JobNames.PROCESS_INGESTION) {
      const payload = job.data as { ingestionLogId: string };

      logger.info(`📝 Processing ingestion log: ${payload.ingestionLogId}`);

      // TODO: Implement transcript ingestion
      logger.warn("Transcript ingestion not yet implemented");
      return;
    }

    logger.warn(`Unknown job type: ${job.name}`, { jobId: job.id });
  }
}
