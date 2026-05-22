import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogOrmEntity } from '../audit/infrastructure/typeorm/entities/audit-log.orm-entity';
import { HealthController } from './health.controller';
import { AppHealthService } from './health.service';

@Module({
  imports: [TerminusModule, TypeOrmModule.forFeature([AuditLogOrmEntity])],
  controllers: [HealthController],
  providers: [AppHealthService],
})
export class HealthModule {}
