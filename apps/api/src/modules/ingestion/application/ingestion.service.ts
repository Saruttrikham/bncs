import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import {
  CreateIngestionLogDto,
  IngestionLogDto,
  FetchSyllabusDto,
} from "@ncbs/dtos";
import { IngestionRepository } from "../infrastructure/ingestion.repository";

@Injectable()
export class IngestionService {
  constructor(
    private readonly ingestionRepository: IngestionRepository,
    @InjectQueue("ingestion") private readonly ingestionQueue: Queue
  ) {}

  async createIngestionLog(
    dto: CreateIngestionLogDto
  ): Promise<IngestionLogDto> {
    // Save raw data to IngestionLog (append-only)
    const ingestionLog = await this.ingestionRepository.create(dto);

    // Push job to queue for processing (Worker will handle it)
    await this.ingestionQueue.add("process-ingestion", {
      ingestionLogId: ingestionLog.id,
    });

    return ingestionLog;
  }

  async fetchSyllabus(dto: FetchSyllabusDto): Promise<{ jobId: string }> {
    // Push syllabus fetch job to ingestion queue for processing (Worker will handle it)
    const job = await this.ingestionQueue.add("fetch-syllabus", dto);

    if (!job.id) {
      throw new Error("Failed to create job: job ID is missing");
    }

    return {
      jobId: job.id,
    };
  }
}
