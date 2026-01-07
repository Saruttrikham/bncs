import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { IngestionLog } from "./ingestion-log.entity";

@Entity("universities")
export class University {
  @PrimaryColumn({ type: "varchar2", length: 255 })
  id!: string;

  @Column({ type: "varchar2", length: 255, unique: true })
  name!: string;

  @Column({ type: "varchar2", length: 50, unique: true })
  code!: string; // e.g., "CHULA", "MAHIDOL"

  @Column({
    type: "varchar2",
    length: 500,
    nullable: true,
    name: "api_endpoint",
  })
  apiEndpoint?: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
