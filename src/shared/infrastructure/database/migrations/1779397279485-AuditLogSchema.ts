import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuditLogSchema1779397279485 implements MigrationInterface {
  name = 'AuditLogSchema1779397279485';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "event_id" character varying NOT NULL, "event_type" character varying NOT NULL, "aggregate_type" character varying NOT NULL, "aggregate_id" character varying NOT NULL, "payload" jsonb NOT NULL, "occurred_at" TIMESTAMP NOT NULL, "processed_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "audit_logs"`);
  }
}
