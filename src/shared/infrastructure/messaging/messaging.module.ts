import { Module } from '@nestjs/common';
import { DOMAIN_EVENT_PUBLISHER } from '../../domain/events/domain-event-publisher';
import { RabbitmqEventPublisher } from './rabbitmq/rabbitmq-event.publisher';

@Module({
  providers: [
    RabbitmqEventPublisher,
    {
      provide: DOMAIN_EVENT_PUBLISHER,
      useExisting: RabbitmqEventPublisher,
    },
  ],
  exports: [DOMAIN_EVENT_PUBLISHER],
})
export class MessagingModule {}
