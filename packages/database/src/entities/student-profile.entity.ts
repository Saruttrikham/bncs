import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { University } from "./university.entity";
import { IngestionLog } from "./ingestion-log.entity";
import { StandardizedTranscript } from "./standardized-transcript.entity";

@Entity("student_profiles")
export class StudentProfile {
  @PrimaryColumn({ type: "varchar2", length: 255 })
  id!: string;

  @Column({ type: "varchar2", length: 255, unique: true, name: "user_id" })
  userId!: string;

  @Column({ type: "varchar2", length: 255, unique: true, name: "student_id" })
  studentId!: string; // University student ID

  @Column({ type: "varchar2", length: 255, name: "first_name" })
  firstName!: string;

  @Column({ type: "varchar2", length: 255, name: "last_name" })
  lastName!: string;

  @Column({ type: "varchar2", length: 255, name: "university_id" })
  universityId!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.studentProfile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id", referencedColumnName: "id" })
  user!: User;

  @ManyToOne(() => University, (university) => university.studentProfiles)
  @JoinColumn({ name: "university_id", referencedColumnName: "id" })
  university!: University;

  @OneToMany(() => IngestionLog, (log) => log.studentProfile)
  ingestionLogs!: IngestionLog[];

  @OneToMany(
    () => StandardizedTranscript,
    (transcript) => transcript.studentProfile
  )
  transcripts!: StandardizedTranscript[];
}
