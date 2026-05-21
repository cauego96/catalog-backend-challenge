import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, {
  AmqpConnectionManager,
  ChannelWrapper,
} from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import {
  DomainEvent,
  DomainEventPublisher,
} from '../../../domain/events/domain-event-publisher';

@Injectable()
export class RabbitmqEventPublisher
  implements DomainEventPublisher, OnModuleInit, OnModuleDestroy
{
  private connection: AmqpConnectionManager;
  private channel: ChannelWrapper;
  private queueName: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.queueName = this.configService.get<string>(
      'RABBITMQ_AUDIT_QUEUE',
      'audit.events',
    );

    this.connection = amqp.connect([
      this.configService.get<string>('RABBITMQ_URL')!,
    ]);

    this.channel = this.connection.createChannel({
      setup: async (channel: ConfirmChannel) => {
        await channel.assertQueue(this.queueName, {
          durable: true,
        });
      },
    });
  }

  async publish(event: DomainEvent): Promise<void> {
    await this.channel.sendToQueue(
      this.queueName,
      Buffer.from(JSON.stringify(event)),
      {
        persistent: true,
        contentType: 'application/json',
        messageId: event.eventId,
        timestamp: Date.now(),
      },
    );
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
