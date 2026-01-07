/**
 * Queue Name Constants
 *
 * Centralized definition of BullMQ queue names.
 * Prevents typos and improves maintainability.
 */
export const QueueNames = {
  INGESTION: "ingestion",
} as const;

/**
 * Job Name Constants
 *
 * Centralized definition of job names within queues.
 */
export const JobNames = {
  COORDINATE_SYNC: "coordinate-sync",
  FETCH_SYLLABUS: "fetch-syllabus",
  FETCH_TRANSCRIPT: "fetch-transcript",
  PROCESS_INGESTION: "process-ingestion",
} as const;

export type QueueName = (typeof QueueNames)[keyof typeof QueueNames];
export type JobName = (typeof JobNames)[keyof typeof JobNames];
