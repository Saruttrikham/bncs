import { Injectable } from "@nestjs/common";
import { SyllabusDataDto } from "@ncbs/dtos";
import { logger } from "@ncbs/logger";
import { ISyllabusRepository } from "../../../domain/ports/syllabus.repository.port";

@Injectable()
export class SyllabusRepository implements ISyllabusRepository {
  async save(
    universityId: string,
    syllabusData: SyllabusDataDto
  ): Promise<void> {
    try {
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
