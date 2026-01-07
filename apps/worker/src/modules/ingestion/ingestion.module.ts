import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Outbox } from "@ncbs/database";
import { QueueNames } from "./domain/constants/queue-names";
import Redis from "ioredis";

// Application Layer - Use Cases & Processors & Services
import {
  ProcessIngestionProcessor,
  OutboxProcessor,
} from "./application/processors";
import {
  FetchSyllabusUseCase,
  CoordinateSyllabusSyncUseCase,
} from "./application/use-cases";
import { DistributedLockService } from "./application/services";

// Domain Layer - Providers
import { IngestionProviders } from "./domain/providers/ingestion.providers";

// Infrastructure Layer - Repositories & Adapters
import {
  IngestionRepository,
  SyllabusRepository,
  OutboxRepository,
} from "./infrastructure/repositories";
import {
  ChulaSyllabusAdapter,
  KmitlSyllabusAdapter,
} from "./infrastructure/adapters";
import { UniversityAdapterSelector } from "./infrastructure/selectors";

@Module({
  imports: [
    ScheduleModule.forRoot(), // Enable cron jobs for OutboxProcessor
    TypeOrmModule.forFeature([Outbox]), // Register Outbox entity
    BullModule.registerQueue({
      name: QueueNames.INGESTION,
    }),
  ],
  providers: [
    // ========================================
    // APPLICATION LAYER
    // ========================================

    // Processors (Queue Handlers & Outbox)
    ProcessIngestionProcessor,
    OutboxProcessor,

    // Use Cases (Business Workflows)
    FetchSyllabusUseCase,
    CoordinateSyllabusSyncUseCase,

    // Services (Shared Application Services)
    DistributedLockService,

    // Redis Client for Distributed Locking
    {
      provide: "REDIS_CLIENT",
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || "localhost",
          port: parseInt(process.env.REDIS_PORT || "6379", 10),
          maxRetriesPerRequest: 3,
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
        });
      },
    },

    // ========================================
    // INFRASTRUCTURE LAYER → DOMAIN PORTS
    // ========================================

    // Repository Implementations
    {
      provide: IngestionProviders.INGESTION_REPOSITORY,
      useClass: IngestionRepository,
    },
    {
      provide: IngestionProviders.SYLLABUS_REPOSITORY,
      useClass: SyllabusRepository,
    },
    {
      provide: IngestionProviders.OUTBOX_REPOSITORY,
      useClass: OutboxRepository,
    },

    // University-Specific Adapters
    {
      provide: IngestionProviders.CHULA_ADAPTER,
      useClass: ChulaSyllabusAdapter,
    },
    {
      provide: IngestionProviders.KMITL_ADAPTER,
      useClass: KmitlSyllabusAdapter,
    },

    // Adapter Selector
    {
      provide: IngestionProviders.ADAPTER_SELECTOR,
      useClass: UniversityAdapterSelector,
    },

    IngestionRepository,
    SyllabusRepository,
    OutboxRepository,
  ],
  exports: [
    CoordinateSyllabusSyncUseCase, // Export for use in API layer
  ],
})
export class IngestionModule {}
