import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { AppHealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly database: TypeOrmHealthIndicator,
    private readonly appHealthService: AppHealthService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.database.pingCheck('postgres'),
      () => this.appHealthService.rabbitmqCheck('rabbitmq'),
      () => this.appHealthService.auditFlowDependencyCheck('audit_flow'),
      () => this.appHealthService.appMetadataCheck('application'),
    ]);
  }
}
