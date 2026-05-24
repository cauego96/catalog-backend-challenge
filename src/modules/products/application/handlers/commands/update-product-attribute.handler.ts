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
import { UpdateProductAttributeCommand } from '../../commands/update-product-attribute.command';

@CommandHandler(UpdateProductAttributeCommand)
export class UpdateProductAttributeHandler implements ICommandHandler<UpdateProductAttributeCommand> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,

    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: UpdateProductAttributeCommand) {
    const product = await this.productRepository.findById(command.id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const previousAttribute = product.attributes.find(
      (item) => item.key === command.key,
    );
    const previousValue = previousAttribute?.value;

    product.updateAttribute(command.key, command.value);

    const saved = await this.productRepository.save(product);

    await this.eventPublisher.publish({
      eventId: randomUUID(),
      eventType: 'PRODUCT_ATTRIBUTE_UPDATED',
      aggregateType: 'Product',
      aggregateId: saved.id,
      occurredAt: new Date().toISOString(),
      payload: {
        productId: saved.id,
        key: command.key,
        previousValue,
        newValue: command.value,
      },
    });

    return saved;
  }
}
