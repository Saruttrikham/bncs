import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { IngestionController } from "./api/ingestion.controller";
import { IngestionService } from "./application/ingestion.service";
import { IngestionRepository } from "./infrastructure/ingestion.repository";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "ingestion",
    }),
  ],
  controllers: [IngestionController],
  providers: [IngestionService, IngestionRepository],
})
export class IngestionModule {}
