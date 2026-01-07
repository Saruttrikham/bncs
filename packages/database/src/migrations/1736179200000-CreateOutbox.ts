import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateOutbox1736179200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create outbox table
    await queryRunner.createTable(
      new Table({
        name: "outbox",
        columns: [
          {
            name: "id",
            type: "varchar2",
            length: "36",
            isPrimary: true,
          },
          {
            name: "job_type",
            type: "varchar2",
            length: "50",
            isNullable: false,
          },
          {
            name: "batch_id",
            type: "varchar2",
            length: "255",
            isNullable: true,
          },
          {
            name: "payload",
            type: "clob",
            isNullable: false,
          },
          {
            name: "status",
            type: "varchar2",
            length: "50",
            default: "'PENDING'",
            isNullable: false,
          },
          {
            name: "attempts",
            type: "number",
            default: 0,
            isNullable: false,
          },
          {
            name: "max_attempts",
            type: "number",
            default: 5,
            isNullable: false,
          },
          {
            name: "error_message",
            type: "varchar2",
            length: "2000",
            isNullable: true,
          },
          {
            name: "scheduled_at",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "processed_at",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Create index for efficient polling of pending jobs
    await queryRunner.createIndex(
      "outbox",
      new TableIndex({
        name: "idx_outbox_status_created",
        columnNames: ["status", "created_at"],
      })
    );

    // Create index for batch queries
    await queryRunner.createIndex(
      "outbox",
      new TableIndex({
        name: "idx_outbox_batch_status",
        columnNames: ["batch_id", "status"],
      })
    );

    // Create index for scheduled jobs
    await queryRunner.createIndex(
      "outbox",
      new TableIndex({
        name: "idx_outbox_scheduled",
        columnNames: ["status", "scheduled_at"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex("outbox", "idx_outbox_status_created");
    await queryRunner.dropIndex("outbox", "idx_outbox_batch_status");
    await queryRunner.dropIndex("outbox", "idx_outbox_scheduled");

    // Drop table
    await queryRunner.dropTable("outbox");
  }
}
