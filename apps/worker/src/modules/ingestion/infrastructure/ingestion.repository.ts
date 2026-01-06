import { Injectable } from "@nestjs/common";
import {
  getRepository,
  IngestionLog,
  University,
  IngestionStatus,
} from "@ncbs/database";
import { IIngestionRepository } from "../domain/ports/ingestion.repository.port";

@Injectable()
export class IngestionRepository implements IIngestionRepository {
  async findById(id: string) {
    const ingestionLogRepo = await getRepository(IngestionLog);
    const result = await ingestionLogRepo.findOne({
      where: { id },
      relations: ["university"],
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
      university: result.university
        ? {
            id: result.university.id,
            code: result.university.code,
            name: result.university.name,
          }
        : null,
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
}
