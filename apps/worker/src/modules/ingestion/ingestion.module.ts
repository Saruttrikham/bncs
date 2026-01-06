import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ProcessIngestionProcessor } from "./application/process-ingestion.processor";
import { ProcessIngestionService } from "./application/process-ingestion.service";
import { FetchSyllabusService } from "./application/fetch-syllabus.service";
import { IngestionRepository } from "./infrastructure/ingestion.repository";
import { TranscriptRepository } from "./infrastructure/transcript.repository";
import { SyllabusRepository } from "./infrastructure/syllabus.repository";
import { FileSyllabusDataSourceAdapter } from "./infrastructure/adapters/file-syllabus-data-source.adapter";
import { AdapterFactory } from "./domain/adapter.factory";
import { IngestionProviders } from "./domain/providers/ingestion.providers";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "ingestion",
    }),
  ],
  providers: [
    ProcessIngestionProcessor,
    ProcessIngestionService,
    FetchSyllabusService,
    {
      provide: IngestionProviders.INGESTION_REPOSITORY,
      useClass: IngestionRepository,
    },
    {
      provide: IngestionProviders.TRANSCRIPT_REPOSITORY,
      useClass: TranscriptRepository,
    },
    {
      provide: IngestionProviders.SYLLABUS_REPOSITORY,
      useClass: SyllabusRepository,
    },
    {
      provide: IngestionProviders.SYLLABUS_DATA_SOURCE,
      useClass: FileSyllabusDataSourceAdapter,
    },
    IngestionRepository,
    TranscriptRepository,
    SyllabusRepository,
    FileSyllabusDataSourceAdapter,
    AdapterFactory,
  ],
})
export class IngestionModule {}
