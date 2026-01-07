import { z } from "zod";

export const FetchSyllabusDto = z.object({
  universityCode: z.string(),
});

export type FetchSyllabusDto = z.infer<typeof FetchSyllabusDto>;

export const SyllabusDataDto = z.object({
  courseId: z.string(),
  courseNo: z.string(),
  courseTitleTh: z.string(),
  courseTitleEn: z.string(),
  credits: z.string(),
  school: z.object({
    schoolId: z.number(),
    schoolNameTh: z.string(),
    schoolNameEn: z.string(),
  }),
  department: z.object({
    departmentId: z.number(),
    departmentNameTh: z.string(),
    departmentNameEn: z.string(),
  }),
  academicYear: z.string(),
  semester: z.string(),
  rawData: z.any(), // Full syllabus JSON data
});

export type SyllabusDataDto = z.infer<typeof SyllabusDataDto>;
