import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { StudentProfile } from "./student-profile.entity";

export enum UserRole {
  STUDENT = "STUDENT",
  ADMIN = "ADMIN",
  UNIVERSITY_ADMIN = "UNIVERSITY_ADMIN",
}

@Entity("users")
export class User {
  @PrimaryColumn({ type: "varchar2", length: 255 })
  id!: string;

  @Column({ type: "varchar2", length: 255, unique: true })
  email!: string;

  @Column({ type: "varchar2", length: 255 })
  password!: string;

  @Column({
    type: "varchar2",
    length: 50,
    default: UserRole.STUDENT,
  })
  role!: UserRole;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @OneToOne(() => StudentProfile, (profile) => profile.user, {
    cascade: true,
  })
  @JoinColumn({ name: "id", referencedColumnName: "userId" })
  studentProfile?: StudentProfile;
}
