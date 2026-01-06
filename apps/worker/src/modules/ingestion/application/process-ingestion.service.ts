import { Injectable, Inject } from "@nestjs/common";
import { logger } from "@ncbs/logger";
import { IIngestionRepository } from "../domain/ports/ingestion.repository.port";
import { ITranscriptRepository } from "../domain/ports/transcript.repository.port";
import { AdapterFactory } from "../domain/adapter.factory";
import { IngestionProviders } from "../domain/providers/ingestion.providers";

@Injectable()
export class ProcessIngestionService {
  constructor(
    @Inject(IngestionProviders.INGESTION_REPOSITORY)
    private readonly ingestionRepository: IIngestionRepository,
    @Inject(IngestionProviders.TRANSCRIPT_REPOSITORY)
    private readonly transcriptRepository: ITranscriptRepository,
    private readonly adapterFactory: AdapterFactory
  ) {}

  async process(ingestionLogId: string) {
    // Fetch ingestion log
    const ingestionLog = await this.ingestionRepository.findById(ingestionLogId);
    if (!ingestionLog) {
      throw new Error(`Ingestion log not found: ${ingestionLogId}`);
    }

    // Update status to PROCESSING
    await this.ingestionRepository.updateStatus(ingestionLogId, "PROCESSING");

    try {
      // Get university code to select adapter
      const university = await this.ingestionRepository.getUniversity(ingestionLog.universityId);
      if (!university) {
        throw new Error(`University not found: ${ingestionLog.universityId}`);
      }

      // Get adapter for this university
      const adapter = this.adapterFactory.getAdapter(university.code);

      // Normalize data using adapter
      const normalizedData = adapter.normalize(ingestionLog.rawData);

      // Save normalized transcripts
      for (const data of normalizedData) {
        await this.transcriptRepository.create({
          studentId: ingestionLog.studentId,
          ingestionLogId: ingestionLog.id,
          ...data,
        });
      }

      // Update status to COMPLETED
      await this.ingestionRepository.updateStatus(ingestionLogId, "COMPLETED", new Date());

      logger.info(`Successfully processed ingestion log: ${ingestionLogId}`);
    } catch (error) {
      // Update status to FAILED
      await this.ingestionRepository.updateStatus(
        ingestionLogId,
        "FAILED",
        null,
        error instanceof Error ? error.message : "Unknown error"
      );
      logger.error(`Failed to process ingestion log: ${ingestionLogId}`, error);
      throw error;
    }
  }
}

