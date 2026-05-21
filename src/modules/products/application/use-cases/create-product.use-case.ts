import { Inject, Injectable, Logger } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../domain/repositories/product.repository';
import {
  DOMAIN_EVENT_PUBLISHER,
  DomainEventPublisher,
} from 'src/shared/domain/events/domain-event-publisher';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateProductUseCase {
  private readonly logger = new Logger(CreateProductUseCase.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,

    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(input: { name: string; description?: string | null }) {
    this.logger.log({
      action: 'product.create',
      step: 'started',
      productName: input.name,
    });

    const product = new Product({
      name: input.name,
      description: input.description,
    });

    const saved = await this.productRepository.save(product);

    await this.eventPublisher.publish({
      eventId: randomUUID(),
      eventType: 'PRODUCT_CREATED',
      aggregateType: 'Product',
      aggregateId: saved.id,
      occurredAt: new Date().toISOString(),
      payload: {
        productId: saved.id,
        name: saved.name,
      },
    });

    this.logger.log({
      action: 'product.create',
      step: 'completed',
      productId: saved.id,
    });

    return saved;
  }
}
