import { Injectable, Inject } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import {
  CreateIngestionLogDto,
  IngestionLogDto,
  FetchSyllabusDto,
} from "@ncbs/dtos";
import { IIngestionRepository } from "../domain/ports/ingestion.repository.port";
import { IngestionProviders } from "../domain/providers/ingestion.providers";

@Injectable()
export class IngestionService {
  constructor(
    @Inject(IngestionProviders.INGESTION_REPOSITORY)
    private readonly ingestionRepository: IIngestionRepository,
    @InjectQueue("ingestion") private readonly ingestionQueue: Queue
  ) {}

  async createIngestionLog(
    dto: CreateIngestionLogDto
  ): Promise<IngestionLogDto> {
    const ingestionLog = await this.ingestionRepository.create(dto);

    await this.ingestionQueue.add("process-ingestion", {
      ingestionLogId: ingestionLog.id,
    });

    return ingestionLog;
  }

  async syncUniversity(params: {
    universityCode: string;
    year?: string;
    semester?: string;
  }): Promise<{ jobId: string; message: string }> {
    const job = await this.ingestionQueue.add("coordinate-sync", {
      universityCode: params.universityCode,
      year: params.year,
      semester: params.semester,
    });

    if (!job.id) {
      throw new Error("Failed to create coordination job");
    }

    return {
      jobId: job.id,
      message: `Sync coordination queued for ${params.universityCode}`,
    };
  }
}
