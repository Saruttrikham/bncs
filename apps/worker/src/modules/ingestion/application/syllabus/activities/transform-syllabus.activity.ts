import { Injectable, Inject } from "@nestjs/common";
import { logger } from "@ncbs/logger";
import { SyllabusDataDto } from "@ncbs/dtos";
import { IUniversityAdapterSelector } from "../../../domain/ports/university-adapter-selector.port";
import { IngestionProviders } from "../../../domain/providers/ingestion.providers";

@Injectable()
export class TransformSyllabusActivity {
  constructor(
    @Inject(IngestionProviders.ADAPTER_SELECTOR)
    private readonly adapterSelector: IUniversityAdapterSelector
  ) {}

  async execute(
    input: TransformSyllabusInput
  ): Promise<TransformSyllabusOutput> {
    logger.info(
      `[Transform] Normalizing ${input.items.length} items from ${input.universityCode}`,
      {
        universityCode: input.universityCode,
        itemsCount: input.items.length,
      }
    );

    const adapter = this.adapterSelector.getAdapter(input.universityCode);

    const normalizedSyllabi = adapter.normalizeSyllabus(input.items, {
      academicYear: input.year,
      semester: input.semester,
    });

    logger.info(
      `[Transform] ✅ Normalized ${normalizedSyllabi.length} syllabus records`,
      {
        universityCode: input.universityCode,
        recordsCount: normalizedSyllabi.length,
      }
    );

    return {
      universityCode: input.universityCode,
      syllabi: normalizedSyllabi,
    };
  }
}

export interface TransformSyllabusInput {
  universityCode: string;
  items: unknown[]; // Raw items from API
  year?: string;
  semester?: string;
}

export interface TransformSyllabusOutput {
  universityCode: string;
  syllabi: SyllabusDataDto[];
}
