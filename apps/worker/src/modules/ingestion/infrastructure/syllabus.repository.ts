import { Injectable } from "@nestjs/common";
import { SyllabusDataDto } from "@ncbs/dtos";
import { logger } from "@ncbs/logger";
import { ISyllabusRepository } from "../domain/ports/syllabus.repository.port";

@Injectable()
export class SyllabusRepository implements ISyllabusRepository {
  /**
   * Save syllabus data to database
   * For now, we'll store it as JSON in a simple table structure
   * TODO: Create proper TypeORM entity for syllabus data if needed
   */
  async save(
    universityId: string,
    syllabusData: SyllabusDataDto
  ): Promise<void> {
    try {
      // For now, we'll log the data
      // TODO: Create a Syllabus entity in TypeORM and save here
      logger.info(`Saving syllabus for course: ${syllabusData.courseNo}`, {
        universityId,
        courseId: syllabusData.courseId,
        courseNo: syllabusData.courseNo,
        courseTitleEn: syllabusData.courseTitleEn,
      });
    } catch (error) {
      logger.error("Failed to save syllabus data", error);
      throw error;
    }
  }
}
