import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ProcessIngestionProcessor } from "./application/process-ingestion.processor";
import { ProcessIngestionService } from "./application/process-ingestion.service";
import { FetchSyllabusService } from "./application/fetch-syllabus.service";
import { IngestionRepository } from "./infrastructure/ingestion.repository";
import { TranscriptRepository } from "./infrastructure/transcript.repository";
import { SyllabusRepository } from "./infrastructure/syllabus.repository";
import { FileSyllabusDataSourceAdapter } from "./infrastructure/adapters/file-syllabus-data-source.adapter";
import { ChulaSyllabusAdapter } from "./infrastructure/adapters/chula-syllabus.adapter";
import { KmitlSyllabusAdapter } from "./infrastructure/adapters/kmitl-syllabus.adapter";
import { UniversityAdapterSelector } from "./infrastructure/university-adapter-selector";
import { IngestionProviders } from "./domain/providers/ingestion.providers";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "ingestion",
    }),
  ],
  providers: [
    // Application Services
    ProcessIngestionProcessor,
    ProcessIngestionService,
    FetchSyllabusService,

    // Repository Implementations (Infrastructure → Domain Ports)
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

    // Data Source Implementations (Infrastructure → Domain Ports)
    {
      provide: IngestionProviders.SYLLABUS_DATA_SOURCE,
      useClass: FileSyllabusDataSourceAdapter,
    },

    // University Adapter Implementations (Infrastructure → Domain Ports)
    {
      provide: IngestionProviders.CHULA_ADAPTER,
      useClass: ChulaSyllabusAdapter,
    },
    {
      provide: IngestionProviders.KMITL_ADAPTER,
      useClass: KmitlSyllabusAdapter,
    },

    // Adapter Selector (Infrastructure → Domain Port)
    {
      provide: IngestionProviders.ADAPTER_SELECTOR,
      useClass: UniversityAdapterSelector,
    },

    // Concrete classes for direct injection if needed
    IngestionRepository,
    TranscriptRepository,
    SyllabusRepository,
    FileSyllabusDataSourceAdapter,
  ],
})
export class IngestionModule {}
