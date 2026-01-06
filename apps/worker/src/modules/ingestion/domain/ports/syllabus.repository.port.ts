import { SyllabusDataDto } from "@ncbs/dtos";

/**
 * Port: Interface for Syllabus Repository
 * Application layer depends on this interface, not concrete implementation
 */
export interface ISyllabusRepository {
  save(universityId: string, syllabusData: SyllabusDataDto): Promise<void>;
}
