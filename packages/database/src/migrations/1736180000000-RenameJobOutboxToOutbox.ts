import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameJobOutboxToOutbox1736180000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename table from job_outbox to outbox
    await queryRunner.query(`ALTER TABLE job_outbox RENAME TO outbox`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rename table back from outbox to job_outbox
    await queryRunner.query(`ALTER TABLE outbox RENAME TO job_outbox`);
  }
}

