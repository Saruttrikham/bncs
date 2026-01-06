import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { logger } from "@ncbs/logger";
import { ProcessIngestionService } from "./process-ingestion.service";
import { FetchSyllabusService } from "./fetch-syllabus.service";
import { FetchSyllabusDto } from "@ncbs/dtos";

@Processor("ingestion")
export class ProcessIngestionProcessor extends WorkerHost {
  constructor(
    private readonly processIngestionService: ProcessIngestionService,
    private readonly fetchSyllabusService: FetchSyllabusService
  ) {
    super();
  }

  async process(job: Job<{ ingestionLogId: string } | FetchSyllabusDto>) {
    // Check job name to determine which service to use
    if (job.name === "fetch-syllabus") {
      logger.info(`Processing syllabus fetch job: ${job.id}`, job.data);
      const syllabusDto = job.data as FetchSyllabusDto;
      return this.fetchSyllabusService.fetchChulaSyllabus(syllabusDto);
    }

    // Default to transcript ingestion
    logger.info(
      `Processing ingestion log: ${
        (job.data as { ingestionLogId: string }).ingestionLogId
      }`
    );
    return this.processIngestionService.process(
      (job.data as { ingestionLogId: string }).ingestionLogId
    );
  }
}
