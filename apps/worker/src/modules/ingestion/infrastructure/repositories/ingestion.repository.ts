import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IngestionLog, IngestionStatus } from "@ncbs/database";
import { IIngestionRepository } from "../../domain/ports/ingestion.repository.port";
import { IngestionLogDto } from "@ncbs/dtos";
import { IngestionLogEntity } from "../../domain/entities/ingestion-log.entity";

@Injectable()
export class IngestionRepository implements IIngestionRepository {
  constructor(
    @InjectRepository(IngestionLog)
    private readonly ingestionLogRepo: Repository<IngestionLog>
  ) {}

  async findById(id: string): Promise<IngestionLogDto | null> {
    const ingestionLogRepo = this.ingestionLogRepo;
    const result = await ingestionLogRepo.findOne({
      where: { id },
    });

    if (!result) {
      return null;
    }

    // Parse rawData from CLOB (JSON string)
    let rawData: unknown;
    try {
      rawData =
        typeof result.rawData === "string"
          ? JSON.parse(result.rawData)
          : result.rawData;
    } catch {
      rawData = result.rawData;
    }

    return {
      id: result.id,
      universityId: result.universityId,
      studentId: result.studentId,
      rawData,
      status: result.status,
      errorMessage: result.errorMessage ?? null,
      processedAt: result.processedAt ?? null,
      createdAt: result.createdAt,
    };
  }

  async updateStatus(
    id: string,
    status: IngestionStatus,
    processedAt?: Date | null,
    errorMessage?: string | null
  ): Promise<void> {
    const ingestionLogRepo = this.ingestionLogRepo;
    await ingestionLogRepo.update(id, {
      status,
      processedAt,
      errorMessage,
    });
  }

  async create(dto: IngestionLogEntity): Promise<IngestionLogDto> {
    const ingestionLogRepo = this.ingestionLogRepo;

    // Convert rawData to string for CLOB storage
    const dataToSave = {
      id: dto.id,
      universityId: dto.universityId,
      studentId: dto.studentId,
      rawData: JSON.stringify(dto.rawData),
      status: dto.status as IngestionStatus,
      errorMessage: dto.errorMessage ?? null,
      processedAt: dto.processedAt ?? null,
      createdAt: dto.createdAt,
    };

    await ingestionLogRepo.save(dataToSave);

    return dto.getValue();
  }
}
