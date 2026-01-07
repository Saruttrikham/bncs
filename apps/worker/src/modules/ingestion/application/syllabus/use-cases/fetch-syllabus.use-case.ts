import { Injectable, Inject } from "@nestjs/common";
import { logger } from "@ncbs/logger";
import { FetchSyllabusDto, IngestionStatus } from "@ncbs/dtos";
import { IIngestionRepository } from "../../../domain/ports/ingestion.repository.port";
import { IngestionProviders } from "../../../domain/providers/ingestion.providers";
import { IngestionLogEntity } from "../../../domain/entities/ingestion-log.entity";
import { randomUUID } from "node:crypto";
import { ExtractSyllabusActivity } from "../activities/extract-syllabus.activity";
import { TransformSyllabusActivity } from "../activities/transform-syllabus.activity";
import { LoadSyllabusActivity } from "../activities/load-syllabus.activity";

export interface PaginatedFetchSyllabusDto extends FetchSyllabusDto {
  page: number;
  pageSize: number;
  year?: string;
  semester?: string;
  isPaginated: true;
}

@Injectable()
export class FetchSyllabusUseCase {
  constructor(
    @Inject(IngestionProviders.INGESTION_REPOSITORY)
    private readonly ingestionRepository: IIngestionRepository,
    private readonly extractActivity: ExtractSyllabusActivity,
    private readonly transformActivity: TransformSyllabusActivity,
    private readonly loadActivity: LoadSyllabusActivity
  ) {}

  async execute(dto: PaginatedFetchSyllabusDto): Promise<void> {
    logger.info(
      `[Workflow] Starting ETL for page ${dto.page} of ${dto.universityCode}`,
      {
        universityCode: dto.universityCode,
        page: dto.page,
        pageSize: dto.pageSize,
      }
    );

    const ingestionLogId = randomUUID();

    try {
      const ingestionLogEntity = new IngestionLogEntity({
        id: ingestionLogId,
        universityId: dto.universityCode,
        studentId: "system",
        rawData: JSON.stringify({
          page: dto.page,
          pageSize: dto.pageSize,
          workflow: "ETL",
        }),
        status: IngestionStatus.enum.PROCESSING,
        errorMessage: null,
        processedAt: null,
        createdAt: new Date(),
      });

      await this.ingestionRepository.create(ingestionLogEntity);

      // ========================================
      // Activity 1: Extract
      // ========================================
      const extractResult = await this.extractActivity.execute({
        universityCode: dto.universityCode,
        page: dto.page,
        pageSize: dto.pageSize,
        year: dto.year,
        semester: dto.semester,
      });

      // ========================================
      // Activity 2: Transform
      // ========================================
      const transformResult = await this.transformActivity.execute({
        universityCode: extractResult.universityCode,
        items: extractResult.items,
        year: dto.year,
        semester: dto.semester,
      });

      // ========================================
      // Activity 3: Load
      // ========================================
      const loadResult = await this.loadActivity.execute({
        universityCode: transformResult.universityCode,
        syllabi: transformResult.syllabi,
      });

      // Mark as completed
      await this.ingestionRepository.updateStatus(
        ingestionLogEntity.id,
        IngestionStatus.enum.COMPLETED,
        new Date(),
        null
      );

      logger.info(`[Workflow] ✅ ETL complete for page ${dto.page}`, {
        universityCode: dto.universityCode,
        page: dto.page,
        extractedItems: extractResult.items.length,
        transformedRecords: transformResult.syllabi.length,
        savedRecords: loadResult.savedCount,
        errors: loadResult.errorCount,
      });
    } catch (error) {
      // Try to update ingestion log if it was created
      try {
        await this.ingestionRepository.updateStatus(
          ingestionLogId,
          IngestionStatus.enum.FAILED,
          new Date(),
          error instanceof Error ? error.message : String(error)
        );
      } catch {
        // Ignore if log doesn't exist
      }

      logger.error(`[Workflow] ❌ ETL failed for page ${dto.page}`, {
        error,
        universityCode: dto.universityCode,
        page: dto.page,
      });

      throw error;
    }
  }
}
