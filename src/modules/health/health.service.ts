import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { connect } from 'amqplib';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { HealthCheckError, HealthIndicatorResult } from '@nestjs/terminus';
import { Repository } from 'typeorm';
import { AuditLogOrmEntity } from '../audit/infrastructure/typeorm/entities/audit-log.orm-entity';

type PackageMetadata = {
  name?: string;
  version?: string;
};

@Injectable()
export class AppHealthService {
  private readonly packageMetadata: PackageMetadata;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(AuditLogOrmEntity)
    private readonly auditLogRepository: Repository<AuditLogOrmEntity>,
  ) {
    this.packageMetadata = this.readPackageMetadata();
  }

  async rabbitmqCheck(key: string): Promise<HealthIndicatorResult> {
    const url = this.configService.get<string>('RABBITMQ_URL');
    const queueName = this.configService.get<string>(
      'RABBITMQ_AUDIT_QUEUE',
      'audit.events',
    );

    if (!url) {
      throw new HealthCheckError('RabbitMQ health check failed', {
        [key]: {
          status: 'down',
          message: 'RABBITMQ_URL is not configured',
        },
      });
    }

    let connection: Awaited<ReturnType<typeof connect>> | undefined;
    let channel:
      | Awaited<ReturnType<typeof connection.createChannel>>
      | undefined;

    try {
      connection = await connect(url);
      channel = await connection.createChannel();
      await channel.assertQueue(queueName, { durable: true });

      return {
        [key]: {
          status: 'up',
          queue: queueName,
        },
      };
    } catch (error) {
      throw new HealthCheckError('RabbitMQ health check failed', {
        [key]: {
          status: 'down',
          queue: queueName,
          message: error instanceof Error ? error.message : String(error),
        },
      });
    } finally {
      await channel?.close();
      await connection?.close();
    }
  }

  appMetadataCheck(key: string): HealthIndicatorResult {
    return {
      [key]: {
        status: 'up',
        service: this.packageMetadata.name ?? 'catalog-backend-challenge',
        version: this.packageMetadata.version ?? 'unknown',
        environment: this.configService.get<string>('NODE_ENV', 'development'),
        timestamp: new Date().toISOString(),
      },
    };
  }

  async auditFlowDependencyCheck(key: string): Promise<HealthIndicatorResult> {
    const queueName = this.configService.get<string>(
      'RABBITMQ_AUDIT_QUEUE',
      'audit.events',
    );

    try {
      await this.auditLogRepository.query('SELECT 1 FROM "audit_logs" LIMIT 1');

      return {
        [key]: {
          status: 'up',
          queue: queueName,
          storage: 'audit_logs',
        },
      };
    } catch (error) {
      throw new HealthCheckError('Audit flow dependency check failed', {
        [key]: {
          status: 'down',
          queue: queueName,
          storage: 'audit_logs',
          message: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  private readPackageMetadata(): PackageMetadata {
    try {
      const packageJsonPath = resolve(process.cwd(), 'package.json');
      const packageJsonContent = readFileSync(packageJsonPath, 'utf8');
      return JSON.parse(packageJsonContent) as PackageMetadata;
    } catch {
      return {};
    }
  }
}
