import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailToUsers1767630282976 implements MigrationInterface {
  name = "AddEmailToUsers1767630282976";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "standardized_transcripts" ("id" varchar2(255) NOT NULL, "student_id" varchar2(255) NOT NULL, "ingestion_log_id" varchar2(255) NOT NULL, "course_code" varchar2(100) NOT NULL, "course_name" varchar2(500) NOT NULL, "credits" number(3,1) NOT NULL, "grade" varchar2(10) NOT NULL, "semester" varchar2(50) NOT NULL, "academic_year" number NOT NULL, "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT "PK_ca6e7ef4e7bef53d067d71707ac" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bae76ad6c4c433eb0e73717a57" ON "standardized_transcripts" ("course_code")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f8209440ca5437f936ba380dbe" ON "standardized_transcripts" ("student_id")`
    );
    await queryRunner.query(
      `CREATE TABLE "ingestion_logs" ("id" varchar2(255) NOT NULL, "university_id" varchar2(255) NOT NULL, "student_id" varchar2(255) NOT NULL, "raw_data" clob NOT NULL, "status" varchar2(50) DEFAULT 'PENDING' NOT NULL, "error_message" varchar2(1000), "processed_at" timestamp, "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT "PK_9d48de994c5d2baf86b269156aa" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6ba059d4f70a5fdf65da2a497d" ON "ingestion_logs" ("status")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_911bf861ed435ca095ca645747" ON "ingestion_logs" ("university_id", "student_id")`
    );
    await queryRunner.query(
      `CREATE TABLE "universities" ("id" varchar2(255) NOT NULL, "name" varchar2(255) NOT NULL, "code" varchar2(50) NOT NULL, "api_endpoint" varchar2(500), "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT "UQ_25b08a78732a663bb35872eaa70" UNIQUE ("name"), CONSTRAINT "UQ_a3e80913c5f263361d680fd7b43" UNIQUE ("code"), CONSTRAINT "PK_8da52f2cee6b407559fdbabf59e" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "student_profiles" ("id" varchar2(255) NOT NULL, "user_id" varchar2(255) NOT NULL, "student_id" varchar2(255) NOT NULL, "first_name" varchar2(255) NOT NULL, "last_name" varchar2(255) NOT NULL, "university_id" varchar2(255) NOT NULL, "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT "UQ_cef016a0d95e26ae7c0f167ec28" UNIQUE ("user_id"), CONSTRAINT "UQ_4cedc08d3dc1f2c2da8a12f7a88" UNIQUE ("student_id"), CONSTRAINT "PK_5ed0a32eeaddfe812fb326177d0" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" varchar2(255) NOT NULL, "email" varchar2(255) NOT NULL, "password" varchar2(255) NOT NULL, "role" varchar2(50) DEFAULT 'STUDENT' NOT NULL, "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "standardized_transcripts" ADD CONSTRAINT "FK_f8209440ca5437f936ba380dbe6" FOREIGN KEY ("student_id") REFERENCES "student_profiles" ("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "standardized_transcripts" ADD CONSTRAINT "FK_7a559b319e8fbde9437f6724459" FOREIGN KEY ("ingestion_log_id") REFERENCES "ingestion_logs" ("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "ingestion_logs" ADD CONSTRAINT "FK_165155cb3ca099c7ca3261bf6cd" FOREIGN KEY ("university_id") REFERENCES "universities" ("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "ingestion_logs" ADD CONSTRAINT "FK_de2f1fa86a5c57ea1755098c655" FOREIGN KEY ("student_id") REFERENCES "student_profiles" ("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "student_profiles" ADD CONSTRAINT "FK_cef016a0d95e26ae7c0f167ec28" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "student_profiles" ADD CONSTRAINT "FK_45542a7519585b831e1e1c9f2f9" FOREIGN KEY ("university_id") REFERENCES "universities" ("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_a3ffb1c0c8416b9fc6f907b7433" FOREIGN KEY ("id") REFERENCES "student_profiles" ("user_id")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_a3ffb1c0c8416b9fc6f907b7433"`
    );
    await queryRunner.query(
      `ALTER TABLE "student_profiles" DROP CONSTRAINT "FK_45542a7519585b831e1e1c9f2f9"`
    );
    await queryRunner.query(
      `ALTER TABLE "student_profiles" DROP CONSTRAINT "FK_cef016a0d95e26ae7c0f167ec28"`
    );
    await queryRunner.query(
      `ALTER TABLE "ingestion_logs" DROP CONSTRAINT "FK_de2f1fa86a5c57ea1755098c655"`
    );
    await queryRunner.query(
      `ALTER TABLE "ingestion_logs" DROP CONSTRAINT "FK_165155cb3ca099c7ca3261bf6cd"`
    );
    await queryRunner.query(
      `ALTER TABLE "standardized_transcripts" DROP CONSTRAINT "FK_7a559b319e8fbde9437f6724459"`
    );
    await queryRunner.query(
      `ALTER TABLE "standardized_transcripts" DROP CONSTRAINT "FK_f8209440ca5437f936ba380dbe6"`
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "student_profiles"`);
    await queryRunner.query(`DROP TABLE "universities"`);
    await queryRunner.query(`DROP INDEX "IDX_911bf861ed435ca095ca645747"`);
    await queryRunner.query(`DROP INDEX "IDX_6ba059d4f70a5fdf65da2a497d"`);
    await queryRunner.query(`DROP TABLE "ingestion_logs"`);
    await queryRunner.query(`DROP INDEX "IDX_f8209440ca5437f936ba380dbe"`);
    await queryRunner.query(`DROP INDEX "IDX_bae76ad6c4c433eb0e73717a57"`);
    await queryRunner.query(`DROP TABLE "standardized_transcripts"`);
  }
}
