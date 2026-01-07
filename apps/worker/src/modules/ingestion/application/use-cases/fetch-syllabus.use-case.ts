import { Injectable, Inject } from "@nestjs/common";
import { logger } from "@ncbs/logger";
import { FetchSyllabusDto, IngestionStatus } from "@ncbs/dtos";
import { ISyllabusRepository } from "../../domain/ports/syllabus.repository.port";
import { IIngestionRepository } from "../../domain/ports/ingestion.repository.port";
import { IUniversityAdapterSelector } from "../../domain/ports/university-adapter-selector.port";
import { IngestionProviders } from "../../domain/providers/ingestion.providers";
import { IngestionLogEntity } from "../../domain/entities/ingestion-log.entity";
import { randomUUID } from "node:crypto";

export interface PaginatedFetchSyllabusDto extends FetchSyllabusDto {
  page: number;
  pageSize: number;
  year?: string;
  semester?: string;
  isPaginated: true;
}

/**
 * Use Case: Fetch Syllabus Page from University
 *
 * Handles paginated syllabus fetching from outbox pattern flow
 */
@Injectable()
export class FetchSyllabusUseCase {
  constructor(
    @Inject(IngestionProviders.SYLLABUS_REPOSITORY)
    private readonly syllabusRepository: ISyllabusRepository,
    @Inject(IngestionProviders.INGESTION_REPOSITORY)
    private readonly ingestionRepository: IIngestionRepository,
    @Inject(IngestionProviders.ADAPTER_SELECTOR)
    private readonly adapterSelector: IUniversityAdapterSelector
  ) {}

  async execute(dto: PaginatedFetchSyllabusDto): Promise<void> {
    logger.info(
      `Fetching syllabus page ${dto.page} for ${dto.universityCode}`,
      { page: dto.page, pageSize: dto.pageSize }
    );

    try {
      const adapter = this.adapterSelector.getAdapter(dto.universityCode);

      // Fetch specific page from university API
      const pageResult = await adapter.fetchPage({
        page: dto.page,
        pageSize: dto.pageSize,
        year: dto.year,
        semester: dto.semester,
      });

      logger.info(
        `Fetched page ${dto.page}: ${pageResult.items.length} items`,
        { universityCode: dto.universityCode, page: dto.page }
      );

      // Create ingestion log
      const ingestionLogEntity = new IngestionLogEntity({
        id: randomUUID(),
        universityId: dto.universityCode,
        studentId: "system",
        rawData: JSON.stringify({
          page: dto.page,
          pageSize: dto.pageSize,
          itemsCount: pageResult.items.length,
        }),
        status: IngestionStatus.enum.PROCESSING,
        errorMessage: null,
        processedAt: null,
        createdAt: new Date(),
      });

      await this.ingestionRepository.create(ingestionLogEntity);

      // Normalize and save
      const normalizedSyllabi = adapter.normalizeSyllabus(pageResult.items, {
        academicYear: dto.year,
        semester: dto.semester,
      });

      for (const syllabusData of normalizedSyllabi) {
        await this.syllabusRepository.save(dto.universityCode, syllabusData);
      }

      // Mark as completed
      await this.ingestionRepository.updateStatus(
        ingestionLogEntity.id,
        IngestionStatus.enum.COMPLETED,
        new Date(),
        null
      );

      logger.info(
        `✅ Page ${dto.page} complete: ${normalizedSyllabi.length} records saved`,
        { universityCode: dto.universityCode, page: dto.page }
      );
    } catch (error) {
      logger.error(`Failed to fetch page ${dto.page}`, {
        error,
        universityCode: dto.universityCode,
        page: dto.page,
      });
      throw error;
    }
  }
}
