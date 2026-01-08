import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1767789321058 implements MigrationInterface {
    name = 'Migrations1767789321058'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "universities" ("id" varchar2(255) NOT NULL, "name" varchar2(255) NOT NULL, "code" varchar2(50) NOT NULL, "api_endpoint" varchar2(500), "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT "UQ_25b08a78732a663bb35872eaa70" UNIQUE ("name"), CONSTRAINT "UQ_a3e80913c5f263361d680fd7b43" UNIQUE ("code"), CONSTRAINT "PK_8da52f2cee6b407559fdbabf59e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ingestion_logs" ("id" varchar2(255) NOT NULL, "university_id" varchar2(255) NOT NULL, "student_id" varchar2(255) NOT NULL, "raw_data" clob NOT NULL, "status" varchar2(50) DEFAULT 'PENDING' NOT NULL, "error_message" varchar2(1000), "processed_at" timestamp, "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT "PK_9d48de994c5d2baf86b269156aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6ba059d4f70a5fdf65da2a497d" ON "ingestion_logs" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_911bf861ed435ca095ca645747" ON "ingestion_logs" ("university_id", "student_id")`);
        await queryRunner.query(`CREATE TABLE "outbox" ("id" varchar2(36), "job_type" varchar2(50) NOT NULL, "batch_id" varchar2(255), "payload" clob NOT NULL, "status" varchar2(50) DEFAULT 'PENDING' NOT NULL, "attempts" number DEFAULT 0 NOT NULL, "max_attempts" number DEFAULT 5 NOT NULL, "error_message" varchar2(2000), "scheduled_at" timestamp, "processed_at" timestamp, "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, CONSTRAINT "PK_340ab539f309f03bdaa14aa7649" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8efa94f499b9c7e0149acefcf1" ON "outbox" ("batch_id", "status")`);
        await queryRunner.query(`CREATE TABLE "syllabus" ("id" varchar2(255) NOT NULL, "universityId" varchar2(255), "courseNo" varchar2(255), "credits" varchar2(255), "courseTitleTh" varchar2(255), "courseTitleEn" varchar2(255), "schoolId" varchar2(255), "schoolNameTh" varchar2(255), "schoolNameEn" varchar2(255), "departmentId" varchar2(255), "departmentNameTh" varchar2(255), "departmentNameEn" varchar2(255), "academicYear" varchar2(255), "semester" varchar2(255), "raw_data" clob, CONSTRAINT "PK_5205bdbdb2d719615ccf5eabfb5" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "syllabus"`);
        await queryRunner.query(`DROP INDEX "IDX_8efa94f499b9c7e0149acefcf1"`);
        await queryRunner.query(`DROP TABLE "outbox"`);
        await queryRunner.query(`DROP INDEX "IDX_911bf861ed435ca095ca645747"`);
        await queryRunner.query(`DROP INDEX "IDX_6ba059d4f70a5fdf65da2a497d"`);
        await queryRunner.query(`DROP TABLE "ingestion_logs"`);
        await queryRunner.query(`DROP TABLE "universities"`);
    }

}
