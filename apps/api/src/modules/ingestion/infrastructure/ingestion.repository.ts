import { Injectable } from "@nestjs/common";
import { getRepository, IngestionLog, IngestionStatus } from "@ncbs/database";
import { CreateIngestionLogDto, IngestionLogDto } from "@ncbs/dtos";
import { randomUUID } from "node:crypto";

@Injectable()
export class IngestionRepository {
  async create(dto: CreateIngestionLogDto): Promise<IngestionLogDto> {
    const ingestionLogRepo = await getRepository(IngestionLog);
    const ingestionLog = ingestionLogRepo.create({
      id: randomUUID(),
      universityId: dto.universityId,
      studentId: dto.studentId,
      rawData: JSON.stringify(dto.rawData), // Store as JSON string in CLOB
      status: IngestionStatus.PENDING,
    });
    const saved = await ingestionLogRepo.save(ingestionLog);

    // Parse rawData back to object for DTO
    let rawData: unknown;
    try {
      rawData =
        typeof saved.rawData === "string"
          ? JSON.parse(saved.rawData)
          : saved.rawData;
    } catch {
      rawData = saved.rawData;
    }

    return {
      id: saved.id,
      universityId: saved.universityId,
      studentId: saved.studentId,
      rawData,
      status: saved.status,
      errorMessage: saved.errorMessage ?? null,
      processedAt: saved.processedAt ?? null,
      createdAt: saved.createdAt,
    };
  }

  async findById(id: string): Promise<IngestionLogDto | null> {
    const ingestionLogRepo = await getRepository(IngestionLog);
    const result = await ingestionLogRepo.findOne({
      where: { id },
    });

    if (!result) {
      return null;
    }

    // Parse rawData back to object for DTO
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
}
