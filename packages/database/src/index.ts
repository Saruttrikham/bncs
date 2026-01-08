export * from "./client";
export * from "./data-source";

// Export entities explicitly
export { University } from "./entities/university.entity";
export { IngestionLog, IngestionStatus } from "./entities/ingestion-log.entity";
export { Outbox, OutboxStatus, JobType } from "./entities/outbox.entity";
export { Syllabus } from "./entities/syllabus.entity";

// Re-export getRepository for convenience
export { getRepository } from "./client";
