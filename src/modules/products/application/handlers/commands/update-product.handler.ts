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
import { UpdateProductCommand } from '../../commands/update-product.command';

@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler implements ICommandHandler<UpdateProductCommand> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,

    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: UpdateProductCommand) {
    const product = await this.productRepository.findById(command.id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const previousName = product.name;
    const previousDescription = product.description;

    product.updateBasicInfo({
      name: command.name,
      description: command.description,
    });

    const saved = await this.productRepository.save(product);

    await this.eventPublisher.publish({
      eventId: randomUUID(),
      eventType: 'PRODUCT_UPDATED',
      aggregateType: 'Product',
      aggregateId: saved.id,
      occurredAt: new Date().toISOString(),
      payload: {
        productId: saved.id,
        previousName,
        newName: saved.name,
        previousDescription,
        newDescription: saved.description,
      },
    });

    return saved;
  }
}
