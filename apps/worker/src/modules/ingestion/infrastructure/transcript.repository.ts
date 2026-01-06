import { Injectable } from "@nestjs/common";
import { getRepository, StandardizedTranscript } from "@ncbs/database";
import { CreateTranscriptDto } from "@ncbs/dtos";
import { ITranscriptRepository } from "../domain/ports/transcript.repository.port";
import { randomUUID } from "node:crypto";

@Injectable()
export class TranscriptRepository implements ITranscriptRepository {
  async create(dto: CreateTranscriptDto): Promise<void> {
    const transcriptRepo = await getRepository(StandardizedTranscript);
    const transcript = transcriptRepo.create({
      id: randomUUID(),
      studentId: dto.studentId,
      ingestionLogId: dto.ingestionLogId,
      courseCode: dto.courseCode,
      courseName: dto.courseName,
      credits: dto.credits,
      grade: dto.grade,
      semester: dto.semester,
      academicYear: dto.academicYear,
    });
    await transcriptRepo.save(transcript);
  }
}
