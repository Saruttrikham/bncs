import { IUniversityAdapter } from "./university-adapter.port";

export interface IUniversityAdapterSelector {
  getAdapter(universityCode: string): IUniversityAdapter;
}
