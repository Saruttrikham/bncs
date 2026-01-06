import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from "typeorm";
import { StudentProfile } from "./student-profile.entity";
import { IngestionLog } from "./ingestion-log.entity";

@Entity("standardized_transcripts")
@Index(["studentId"])
@Index(["courseCode"])
export class StandardizedTranscript {
  @PrimaryColumn({ type: "varchar2", length: 255 })
  id!: string;

  @Column({ type: "varchar2", length: 255, name: "student_id" })
  studentId!: string;

  @Column({ type: "varchar2", length: 255, name: "ingestion_log_id" })
  ingestionLogId!: string;

  @Column({ type: "varchar2", length: 100, name: "course_code" })
  courseCode!: string;

  @Column({ type: "varchar2", length: 500, name: "course_name" })
  courseName!: string;

  @Column({ type: "number", precision: 3, scale: 1 })
  credits!: number;

  @Column({ type: "varchar2", length: 10 })
  grade!: string; // Normalized grade (A, B, C, D, F, etc.)

  @Column({ type: "varchar2", length: 50 })
  semester!: string; // e.g., "2023/1"

  @Column({ type: "number", name: "academic_year" })
  academicYear!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(() => StudentProfile, (profile) => profile.transcripts)
  @JoinColumn({ name: "student_id", referencedColumnName: "id" })
  studentProfile!: StudentProfile;

  @ManyToOne(() => IngestionLog, (log) => log.transcripts)
  @JoinColumn({ name: "ingestion_log_id", referencedColumnName: "id" })
  ingestionLog!: IngestionLog;
}
