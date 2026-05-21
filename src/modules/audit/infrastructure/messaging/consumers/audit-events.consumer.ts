import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import amqp, {
  AmqpConnectionManager,
  ChannelWrapper,
} from 'amqp-connection-manager';
import { Channel, ConsumeMessage } from 'amqplib';
import { Repository } from 'typeorm';
import { AuditLogOrmEntity } from '../../typeorm/entities/audit-log.orm-entity';

@Injectable()
export class AuditEventsConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AuditEventsConsumer.name);
  private connection: AmqpConnectionManager;
  private channel: ChannelWrapper;
  private queueName: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(AuditLogOrmEntity)
    private readonly auditRepository: Repository<AuditLogOrmEntity>,
  ) {}

  async onModuleInit() {
    this.queueName = this.configService.get<string>(
      'RABBITMQ_AUDIT_QUEUE',
      'audit.events',
    );

    this.connection = amqp.connect([
      this.configService.get<string>('RABBITMQ_URL')!,
    ]);

    this.channel = this.connection.createChannel({
      setup: async (channel: Channel) => {
        await channel.assertQueue(this.queueName, {
          durable: true,
        });

        await channel.consume(this.queueName, async (message) => {
          if (!message) return;

          await this.handleMessage(channel, message);
        });
      },
    });
  }

  private async handleMessage(
    channel: Channel,
    message: ConsumeMessage,
  ): Promise<void> {
    try {
      const event = JSON.parse(message.content.toString());

      this.logger.log({
        action: 'audit.event.consume',
        step: 'started',
        eventId: event.eventId,
        eventType: event.eventType,
        aggregateId: event.aggregateId,
      });

      await this.auditRepository.save({
        eventId: event.eventId,
        eventType: event.eventType,
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        payload: event.payload,
        occurredAt: new Date(event.occurredAt),
        processedAt: new Date(),
      });

      channel.ack(message);

      this.logger.log({
        action: 'audit.event.consume',
        step: 'completed',
        eventId: event.eventId,
        eventType: event.eventType,
      });
    } catch (error) {
      this.logger.error({
        action: 'audit.event.consume',
        step: 'failed',
        error: error instanceof Error ? error.message : String(error),
      });

      channel.nack(message, false, false);
    }
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
