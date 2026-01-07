import { Injectable, Inject } from "@nestjs/common";
import { logger } from "@ncbs/logger";
import { SyllabusDataDto } from "@ncbs/dtos";
import { ISyllabusRepository } from "../../../domain/ports/syllabus.repository.port";
import { IngestionProviders } from "../../../domain/providers/ingestion.providers";

@Injectable()
export class LoadSyllabusActivity {
  constructor(
    @Inject(IngestionProviders.SYLLABUS_REPOSITORY)
    private readonly syllabusRepository: ISyllabusRepository
  ) {}

  async execute(input: LoadSyllabusInput): Promise<LoadSyllabusOutput> {
    logger.info(
      `[Load] Saving ${input.syllabi.length} syllabus records for ${input.universityCode}`,
      {
        universityCode: input.universityCode,
        recordsCount: input.syllabi.length,
      }
    );

    let savedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const syllabusData of input.syllabi) {
      try {
        await this.syllabusRepository.save(input.universityCode, syllabusData);
        savedCount++;
      } catch (error) {
        errorCount++;
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        errors.push(errorMessage);

        logger.warn(`[Load] Failed to save syllabus record: ${errorMessage}`, {
          universityCode: input.universityCode,
          syllabusData,
        });
      }
    }

    if (errorCount === input.syllabi.length && input.syllabi.length > 0) {
      throw new Error(
        `Failed to save all ${input.syllabi.length} records: ${errors.join(
          ", "
        )}`
      );
    }

    if (errorCount > 0) {
      logger.warn(
        `[Load] Partial success: ${savedCount}/${input.syllabi.length} records saved`,
        {
          universityCode: input.universityCode,
          savedCount,
          errorCount,
          errors,
        }
      );
    } else {
      logger.info(
        `[Load] ✅ Successfully saved ${savedCount} syllabus records`,
        {
          universityCode: input.universityCode,
          savedCount,
        }
      );
    }

    return {
      universityCode: input.universityCode,
      savedCount,
      errorCount,
      errors: errorCount > 0 ? errors : undefined,
    };
  }
}

export interface LoadSyllabusInput {
  universityCode: string;
  syllabi: SyllabusDataDto[];
}

export interface LoadSyllabusOutput {
  universityCode: string;
  savedCount: number;
  errorCount: number;
  errors?: string[];
}
