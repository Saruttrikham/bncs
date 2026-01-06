import { z } from "zod";

export const UniversityDto = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  apiEndpoint: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UniversityDto = z.infer<typeof UniversityDto>;

export const CreateUniversityDto = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  apiEndpoint: z.string().url().optional(),
});

export type CreateUniversityDto = z.infer<typeof CreateUniversityDto>;

import type { SyllabusDataDto } from "./syllabus";

// Adapter interface for university data normalization
export interface IUniversityAdapter {
  normalize(rawData: unknown): {
    courseCode: string;
    courseName: string;
    credits: number;
    grade: string;
    semester: string;
    academicYear: number;
  }[];

  normalizeSyllabus(
    rawData: unknown,
    filters?: { academicYear?: string; semester?: string }
  ): SyllabusDataDto[];
}
