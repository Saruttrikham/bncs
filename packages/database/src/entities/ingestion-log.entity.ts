import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from "typeorm";
import { University } from "./university.entity";
import { StudentProfile } from "./student-profile.entity";
import { StandardizedTranscript } from "./standardized-transcript.entity";

export enum IngestionStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

@Entity("ingestion_logs")
@Index(["universityId", "studentId"])
@Index(["status"])
export class IngestionLog {
  @PrimaryColumn({ type: "varchar2", length: 255 })
  id!: string;

  @Column({ type: "varchar2", length: 255, name: "university_id" })
  universityId!: string;

  @Column({ type: "varchar2", length: 255, name: "student_id" })
  studentId!: string;

  @Column({ type: "clob", name: "raw_data" })
  rawData!: string; // JSON stored as CLOB in Oracle

  @Column({
    type: "varchar2",
    length: 50,
    default: IngestionStatus.PENDING,
  })
  status!: IngestionStatus;

  @Column({
    type: "varchar2",
    length: 1000,
    nullable: true,
    name: "error_message",
  })
  errorMessage?: string | null;

  @Column({ type: "timestamp", nullable: true, name: "processed_at" })
  processedAt?: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @ManyToOne(() => University, (university) => university.ingestionLogs)
  @JoinColumn({ name: "university_id", referencedColumnName: "id" })
  university!: University;

  @ManyToOne(() => StudentProfile, (profile) => profile.ingestionLogs)
  @JoinColumn({ name: "student_id", referencedColumnName: "id" })
  studentProfile!: StudentProfile;

  @OneToMany(
    () => StandardizedTranscript,
    (transcript) => transcript.ingestionLog
  )
  transcripts!: StandardizedTranscript[];
}
