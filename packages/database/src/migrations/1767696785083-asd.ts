import { MigrationInterface, QueryRunner } from "typeorm";

export class Asd1767696785083 implements MigrationInterface {
    name = 'Asd1767696785083'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ingestion_logs" DROP CONSTRAINT "FK_165155cb3ca099c7ca3261bf6cd"`);
        await queryRunner.query(`ALTER TABLE "ingestion_logs" DROP CONSTRAINT "FK_de2f1fa86a5c57ea1755098c655"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ingestion_logs" ADD CONSTRAINT "FK_de2f1fa86a5c57ea1755098c655" FOREIGN KEY ("student_id") REFERENCES "student_profiles" ("id")`);
        await queryRunner.query(`ALTER TABLE "ingestion_logs" ADD CONSTRAINT "FK_165155cb3ca099c7ca3261bf6cd" FOREIGN KEY ("university_id") REFERENCES "universities" ("id")`);
    }

}
