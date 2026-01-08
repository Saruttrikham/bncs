import { Injectable, Inject } from "@nestjs/common";
import { logger } from "@ncbs/logger";
import { IUniversityAdapterSelector } from "../../../domain/ports/university-adapter-selector.port";
import { IngestionProviders } from "../../../domain/providers/ingestion.providers";

@Injectable()
export class ExtractSyllabusActivity {
  constructor(
    @Inject(IngestionProviders.ADAPTER_SELECTOR)
    private readonly adapterSelector: IUniversityAdapterSelector
  ) {}

  async execute(input: ExtractSyllabusInput): Promise<ExtractSyllabusOutput> {
    logger.info(
      `[Extract] Fetching page ${input.page} from ${input.universityCode}`,
      {
        universityCode: input.universityCode,
        page: input.page,
        pageSize: input.pageSize,
      }
    );

    const adapter = this.adapterSelector.getAdapter(input.universityCode);

    const pageResult = await this.fetchWithRetry(
      () =>
        adapter.fetchPage({
          page: input.page,
          pageSize: input.pageSize,
          year: input.year,
          semester: input.semester,
        }),
      3 // Max 3 immediate retries
    );

    logger.info(
      `[Extract] ✅ Fetched ${pageResult.items.length} items from page ${input.page}`,
      {
        universityCode: input.universityCode,
        page: input.page,
        itemsCount: pageResult.items.length,
      }
    );

    return {
      universityCode: input.universityCode,
      page: input.page,
      items: pageResult.items,
      metadata: {
        totalItems: pageResult.metadata.totalItems,
        totalPages: pageResult.metadata.totalPages,
        currentPage: pageResult.metadata.currentPage,
      },
    };
  }

  private async fetchWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number,
    baseDelayMs = 10000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const errorMessage = lastError.message.toLowerCase();

        const isRetryable =
          errorMessage.includes("timeout") ||
          errorMessage.includes("econnreset") ||
          errorMessage.includes("econnrefused") ||
          errorMessage.includes("socket hang up") ||
          errorMessage.includes("network") ||
          errorMessage.includes("etimedout");

        if (!isRetryable || attempt === maxRetries) {
          logger.error(
            `[Extract] Permanent error on attempt ${attempt}/${maxRetries}, not retrying: ${lastError.message}`,
            {
              attempt,
              maxRetries,
              error: lastError.message,
            }
          );
          throw lastError;
        }

        // Calculate delay with linear backoff (10s, 20s, 30s)
        const delayMs = baseDelayMs * attempt;

        // Log retry attempt
        logger.warn(
          `[Extract] Transient error on attempt ${attempt}/${maxRetries}, retrying in ${delayMs}ms: ${lastError.message}`
        );

        // Wait before retry
        await this.sleep(delayMs);
      }
    }

    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Input for extraction activity
 */
export interface ExtractSyllabusInput {
  universityCode: string;
  page: number;
  pageSize: number;
  year?: string;
  semester?: string;
}

/**
 * Output from extraction activity
 */
export interface ExtractSyllabusOutput {
  universityCode: string;
  page: number;
  items: unknown[]; // Raw items from API
  metadata: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
}
