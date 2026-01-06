import { Injectable, Inject } from "@nestjs/common";
import { IUniversityAdapterSelector } from "../domain/ports/university-adapter-selector.port";
import { IUniversityAdapter } from "../domain/ports/university-adapter.port";
import { IngestionProviders } from "../domain/providers/ingestion.providers";

@Injectable()
export class UniversityAdapterSelector implements IUniversityAdapterSelector {
  private adapters: Map<string, IUniversityAdapter> = new Map();

  constructor(
    @Inject(IngestionProviders.CHULA_ADAPTER)
    chulaAdapter: IUniversityAdapter,
    @Inject(IngestionProviders.KMITL_ADAPTER)
    kmitlAdapter: IUniversityAdapter
  ) {
    this.adapters.set("CHULA", chulaAdapter);
    this.adapters.set("KMITL", kmitlAdapter);
  }

  getAdapter(universityCode: string): IUniversityAdapter {
    const adapter = this.adapters.get(universityCode.toUpperCase());

    if (!adapter) {
      throw new Error(
        `No adapter found for university code: ${universityCode}. ` +
          `Available adapters: ${Array.from(this.adapters.keys()).join(", ")}`
      );
    }

    return adapter;
  }
}
