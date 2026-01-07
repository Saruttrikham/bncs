import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { IngestionController } from "./api/ingestion.controller";
import { IngestionService } from "./application/ingestion.service";
import { IngestionRepository } from "./infrastructure/repositories/ingestion.repository";
import { IngestionProviders } from "./domain/providers/ingestion.providers";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "ingestion",
    }),
  ],
  controllers: [IngestionController],
  providers: [
    IngestionService,

    {
      provide: IngestionProviders.INGESTION_REPOSITORY,
      useClass: IngestionRepository,
    },
  ],
})
export class IngestionModule {}
