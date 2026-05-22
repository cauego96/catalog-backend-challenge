import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  DOMAIN_EVENT_PUBLISHER,
  DomainEventPublisher,
} from '../../../../shared/domain/events/domain-event-publisher';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../domain/repositories/product.repository';

@Injectable()
export class RemoveProductAttributeUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,

    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(id: string, key: string) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const attribute = product.attributes.find((item) => item.key === key);

    product.removeAttribute(key);

    const saved = await this.productRepository.save(product);

    await this.eventPublisher.publish({
      eventId: randomUUID(),
      eventType: 'PRODUCT_ATTRIBUTE_REMOVED',
      aggregateType: 'Product',
      aggregateId: saved.id,
      occurredAt: new Date().toISOString(),
      payload: {
        productId: saved.id,
        key,
        value: attribute?.value,
      },
    });

    return saved;
  }
}
