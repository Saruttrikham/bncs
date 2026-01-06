import { z } from "zod";

export const StandardizedTranscriptDto = z.object({
  id: z.string(),
  studentId: z.string(),
  ingestionLogId: z.string(),
  courseCode: z.string(),
  courseName: z.string(),
  credits: z.number(),
  grade: z.string(),
  semester: z.string(),
  academicYear: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type StandardizedTranscriptDto = z.infer<typeof StandardizedTranscriptDto>;

export const CreateTranscriptDto = z.object({
  studentId: z.string(),
  ingestionLogId: z.string(),
  courseCode: z.string().min(1),
  courseName: z.string().min(1),
  credits: z.number().positive(),
  grade: z.string().min(1),
  semester: z.string().min(1),
  academicYear: z.number().int().positive(),
});

export type CreateTranscriptDto = z.infer<typeof CreateTranscriptDto>;

