import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("syllabus")
export class Syllabus {
  @PrimaryColumn({ type: "varchar2", length: 255 })
  id!: string;

  @Column({ type: "varchar2", length: 255, nullable: true })
  universityId?: string;

  @Column({ type: "varchar2", length: 255, nullable: true })
  courseNo?: string;

  @Column({ type: "varchar2", length: 255, nullable: true })
  credits?: string;

  @Column({ type: "varchar2", length: 255, nullable: true })
  courseTitleTh?: string;

  @Column({ type: "varchar2", length: 255, nullable: true })
  courseTitleEn?: string;

  @Column({ type: "varchar2", length: 255, nullable: true })
  schoolId?: string;

  @Column({ type: "varchar2", length: 255, nullable: true })
  schoolNameTh?: string;

  @Column({ type: "varchar2", length: 255, nullable: true })
  schoolNameEn?: string;

  @Column({ type: "varchar2", length: 255, nullable: true })
  departmentId?: string;

  @Column({ type: "varchar2", length: 255, nullable: true })
  departmentNameTh?: string;

  @Column({ type: "varchar2", length: 255, nullable: true })
  departmentNameEn?: string;

  @Column({ type: "varchar2", length: 255, nullable: true })
  academicYear?: string;

  @Column({ type: "varchar2", length: 255, nullable: true })
  semester?: string;

  @Column({ type: "clob", name: "raw_data", nullable: true })
  rawData?: string;
}
