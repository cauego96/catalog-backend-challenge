import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLogOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id' })
  eventId: string;

  @Column({ name: 'event_type' })
  eventType: string;

  @Column({ name: 'aggregate_type' })
  aggregateType: string;

  @Column({ name: 'aggregate_id' })
  aggregateId: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ name: 'occurred_at', type: 'timestamp' })
  occurredAt: Date;

  @Column({ name: 'processed_at', type: 'timestamp' })
  processedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
