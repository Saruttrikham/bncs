import { z } from "zod";

export const IngestionStatus = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);

export type IngestionStatus = z.infer<typeof IngestionStatus>;

export const IngestionLogDto = z.object({
  id: z.string(),
  universityId: z.string(),
  studentId: z.string(),
  rawData: z.any(), // JSON data
  status: IngestionStatus,
  errorMessage: z.string().nullable(),
  processedAt: z.date().nullable(),
  createdAt: z.date(),
});

export type IngestionLogDto = z.infer<typeof IngestionLogDto>;

export const CreateIngestionLogDto = z.object({
  universityId: z.string().min(1),
  studentId: z.string().min(1),
  rawData: z.any(), // JSON data from university API
});

export type CreateIngestionLogDto = z.infer<typeof CreateIngestionLogDto>;

export const ProcessIngestionDto = z.object({
  ingestionLogId: z.string().min(1),
});

export type ProcessIngestionDto = z.infer<typeof ProcessIngestionDto>;
