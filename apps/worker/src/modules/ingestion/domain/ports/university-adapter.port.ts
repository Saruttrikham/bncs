import { SyllabusDataDto } from "@ncbs/dtos";

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
