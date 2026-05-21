import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogOrmEntity } from './infrastructure/typeorm/entities/audit-log.orm-entity';
import { AuditEventsConsumer } from './infrastructure/messaging/consumers/audit-events.consumer';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLogOrmEntity])],
  providers: [AuditEventsConsumer],
})
export class AuditModule {}
