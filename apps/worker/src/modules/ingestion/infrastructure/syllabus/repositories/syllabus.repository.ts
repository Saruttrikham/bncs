import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Syllabus } from "@ncbs/database";
import { logger } from "@ncbs/logger";
import { SyllabusEntity } from "../../../domain/entities/syllabus.entity";
import { ISyllabusRepository } from "../../../domain/ports/syllabus.repository.port";

@Injectable()
export class SyllabusRepository implements ISyllabusRepository {
  constructor(
    @InjectRepository(Syllabus)
    private readonly syllabusRepository: Repository<Syllabus>
  ) {}

  async create(syllabusData: SyllabusEntity): Promise<void> {
    try {
      // Convert DTO to domain entity
      const syllabusEntity = syllabusData.getValue();

      // Use injected TypeORM repository
      const repository = this.syllabusRepository;

      // Map domain entity to database entity
      const dbEntity = repository.create({
        id: syllabusEntity.id,
        universityId: syllabusEntity.universityId,
        courseNo: syllabusEntity.courseNo,
        credits: syllabusEntity.credits,
        courseTitleTh: syllabusEntity.courseTitleTh,
        courseTitleEn: syllabusEntity.courseTitleEn,
        schoolId: syllabusEntity.schoolId,
        schoolNameTh: syllabusEntity.schoolNameTh,
        schoolNameEn: syllabusEntity.schoolNameEn,
        departmentId: syllabusEntity.departmentId,
        departmentNameTh: syllabusEntity.departmentNameTh,
        departmentNameEn: syllabusEntity.departmentNameEn,
        academicYear: syllabusEntity.academicYear,
        semester: syllabusEntity.semester,
        rawData: syllabusEntity.rawData,
      });

      // Save to database (upsert)
      await repository.save(dbEntity);

      logger.info(`✅ Successfully saved syllabus: ${syllabusEntity.id}`);
    } catch (error) {
      logger.error("Failed to save syllabus data", error);
      throw error;
    }
  }
}
