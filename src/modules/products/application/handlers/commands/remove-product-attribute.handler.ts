import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import {
  DOMAIN_EVENT_PUBLISHER,
  DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../../domain/repositories/product.repository';
import { RemoveProductAttributeCommand } from '../../commands/remove-product-attribute.command';

@CommandHandler(RemoveProductAttributeCommand)
export class RemoveProductAttributeHandler implements ICommandHandler<RemoveProductAttributeCommand> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,

    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: RemoveProductAttributeCommand) {
    const product = await this.productRepository.findById(command.id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const attribute = product.attributes.find(
      (item) => item.key === command.key,
    );

    product.removeAttribute(command.key);

    const saved = await this.productRepository.save(product);

    await this.eventPublisher.publish({
      eventId: randomUUID(),
      eventType: 'PRODUCT_ATTRIBUTE_REMOVED',
      aggregateType: 'Product',
      aggregateId: saved.id,
      occurredAt: new Date().toISOString(),
      payload: {
        productId: saved.id,
        key: command.key,
        value: attribute?.value,
      },
    });

    return saved;
  }
}
