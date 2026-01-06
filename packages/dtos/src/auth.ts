import { z } from "zod";

export const LoginDto = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginDto = z.infer<typeof LoginDto>;

export const RegisterDto = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  studentId: z.string().min(1),
  universityId: z.string().min(1),
});

export type RegisterDto = z.infer<typeof RegisterDto>;

// Response DTOs
export const AuthResponseDto = z.object({
  id: z.string(),
  email: z.string(),
  role: z.enum(["STUDENT", "ADMIN", "UNIVERSITY_ADMIN"]),
});

export type AuthResponseDto = z.infer<typeof AuthResponseDto>;
