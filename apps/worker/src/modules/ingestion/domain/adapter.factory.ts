import { Injectable } from "@nestjs/common";
import { IUniversityAdapter } from "@ncbs/dtos";
import { ChulaAdapter } from "./adapters/chula.adapter";

@Injectable()
export class AdapterFactory {
  private adapters: Map<string, IUniversityAdapter> = new Map();

  constructor() {
    // Register adapters
    this.adapters.set("CHULA", new ChulaAdapter());
  }

  getAdapter(universityCode: string): IUniversityAdapter {
    const adapter = this.adapters.get(universityCode.toUpperCase());
    if (!adapter) {
      throw new Error(
        `No adapter found for university code: ${universityCode}`
      );
    }
    return adapter;
  }
}
