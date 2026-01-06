import { z } from "zod";

export const StudentProfileDto = z.object({
  id: z.string(),
  userId: z.string(),
  studentId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  universityId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type StudentProfileDto = z.infer<typeof StudentProfileDto>;

export const CreateStudentProfileDto = z.object({
  userId: z.string(),
  studentId: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  universityId: z.string().min(1),
});

export type CreateStudentProfileDto = z.infer<typeof CreateStudentProfileDto>;

