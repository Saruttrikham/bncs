import { Injectable } from "@nestjs/common";
import {
  getRepository,
  IngestionLog,
  University,
  IngestionStatus,
} from "@ncbs/database";
import { IIngestionRepository } from "../../domain/ports/ingestion.repository.port";
import { IngestionLogDto } from "@ncbs/dtos";
import { IngestionLogEntity } from "../../domain/entities/ingestion-log.entity";

@Injectable()
export class IngestionRepository implements IIngestionRepository {
  async findById(id: string): Promise<IngestionLogDto | null> {
    const ingestionLogRepo = await getRepository(IngestionLog);
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
    const ingestionLogRepo = await getRepository(IngestionLog);
    await ingestionLogRepo.update(id, {
      status,
      processedAt,
      errorMessage,
    });
  }

  async getUniversity(universityId: string) {
    const universityRepo = await getRepository(University);
    const result = await universityRepo.findOne({
      where: { id: universityId },
    });

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      code: result.code,
      name: result.name,
    };
  }

  async create(dto: IngestionLogEntity): Promise<IngestionLogDto> {
    const ingestionLogRepo = await getRepository(IngestionLog);

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
