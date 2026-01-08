import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

export enum OutboxStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum JobType {
  FETCH_SYLLABUS = "FETCH_SYLLABUS",
  FETCH_TRANSCRIPT = "FETCH_TRANSCRIPT",
  PROCESS_INGESTION = "PROCESS_INGESTION",
}

@Entity("outbox")
@Index(["batchId", "status"])
export class Outbox {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar2", length: 50, name: "job_type" })
  jobType!: JobType;

  @Column({ type: "varchar2", length: 255, name: "batch_id", nullable: true })
  batchId?: string | null;

  @Column({ type: "clob", name: "payload" })
  payload!: string;

  @Column({
    type: "varchar2",
    length: 50,
    default: OutboxStatus.PENDING,
  })
  status!: OutboxStatus;

  @Column({ type: "number", default: 0 })
  attempts!: number;

  @Column({ type: "number", default: 5, name: "max_attempts" })
  maxAttempts!: number;

  @Column({
    type: "varchar2",
    length: 2000,
    nullable: true,
    name: "error_message",
  })
  errorMessage?: string | null;

  @Column({ type: "timestamp", nullable: true, name: "scheduled_at" })
  scheduledAt?: Date | null;

  @Column({ type: "timestamp", nullable: true, name: "processed_at" })
  processedAt?: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
