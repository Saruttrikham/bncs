import { Injectable, Inject } from "@nestjs/common";
import { logger } from "@ncbs/logger";
import { FetchSyllabusDto } from "@ncbs/dtos";
import { ISyllabusRepository } from "../domain/ports/syllabus.repository.port";
import { IIngestionRepository } from "../domain/ports/ingestion.repository.port";
import { ISyllabusDataSource } from "../domain/ports/syllabus-data-source.port";
import { IUniversityAdapterSelector } from "../domain/ports/university-adapter-selector.port";
import { IngestionProviders } from "../domain/providers/ingestion.providers";

@Injectable()
export class FetchSyllabusService {
  constructor(
    @Inject(IngestionProviders.SYLLABUS_REPOSITORY)
    private readonly syllabusRepository: ISyllabusRepository,
    @Inject(IngestionProviders.INGESTION_REPOSITORY)
    private readonly ingestionRepository: IIngestionRepository,
    @Inject(IngestionProviders.SYLLABUS_DATA_SOURCE)
    private readonly syllabusDataSource: ISyllabusDataSource,
    @Inject(IngestionProviders.ADAPTER_SELECTOR)
    private readonly adapterSelector: IUniversityAdapterSelector
  ) {}

  async fetchChulaSyllabus(dto: FetchSyllabusDto): Promise<void> {
    logger.info(`Fetching CU syllabus for university: ${dto.universityId}`);

    try {
      const university = await this.ingestionRepository.getUniversity(
        dto.universityId
      );

      if (!university) {
        throw new Error(`University not found: ${dto.universityId}`);
      }

      const adapter = this.adapterSelector.getAdapter(university.code);

      const rawData = await this.syllabusDataSource.fetchRawData();

      const normalizedSyllabi = adapter.normalizeSyllabus(rawData, {
        academicYear: dto.academicYear,
        semester: dto.semester,
      });

      for (const syllabusData of normalizedSyllabi) {
        await this.syllabusRepository.save(dto.universityId, syllabusData);
      }

      logger.info(
        `Successfully fetched and saved ${normalizedSyllabi.length} syllabus records`
      );
    } catch (error) {
      logger.error("Failed to fetch CU syllabus", error);
      throw error;
    }
  }
}
