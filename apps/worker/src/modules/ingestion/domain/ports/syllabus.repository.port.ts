import { SyllabusDataDto } from "@ncbs/dtos";
import { SyllabusEntity } from "../entities/syllabus.entity";

/**
 * Port: Interface for Syllabus Repository
 * Application layer depends on this interface, not concrete implementation
 */
export interface ISyllabusRepository {
  create(syllabusData: SyllabusEntity): Promise<void>;
}
