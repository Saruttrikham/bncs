import { CreateIngestionLogDto, IngestionLogDto } from "@ncbs/dtos";
import { IngestionLogEntity } from "../entities/ingestion-log.entity";

/**
 * Port: Interface for Ingestion Repository
 * Application layer depends on this interface, not concrete implementation
 */
export interface IIngestionRepository {
  findById(id: string): Promise<IngestionLogDto | null>;

  updateStatus(
    id: string,
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED",
    processedAt?: Date | null,
    errorMessage?: string | null
  ): Promise<void>;

  create(dto: IngestionLogEntity): Promise<IngestionLogDto>;
}
