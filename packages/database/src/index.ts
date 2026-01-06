export * from "./client";
export * from "./data-source";

// Export entities explicitly
export { User, UserRole } from "./entities/user.entity";
export { StudentProfile } from "./entities/student-profile.entity";
export { University } from "./entities/university.entity";
export { IngestionLog, IngestionStatus } from "./entities/ingestion-log.entity";
export { StandardizedTranscript } from "./entities/standardized-transcript.entity";

// Re-export getRepository for convenience
export { getRepository } from "./client";
