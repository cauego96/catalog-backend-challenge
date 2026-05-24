import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import {
  DOMAIN_EVENT_PUBLISHER,
  DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher';
import {
  CATEGORY_REPOSITORY,
  CategoryRepository,
} from '../../../../categories/domain/repositories/category.repository';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../../domain/repositories/product.repository';
import { AddCategoryToProductCommand } from '../../commands/add-category-to-product.command';

@CommandHandler(AddCategoryToProductCommand)
export class AddCategoryToProductHandler implements ICommandHandler<AddCategoryToProductCommand> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,

    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,

    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: AddCategoryToProductCommand) {
    const product = await this.productRepository.findById(command.id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const category = await this.categoryRepository.findById(command.categoryId);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    product.addCategory(command.categoryId);

    const saved = await this.productRepository.save(product);

    await this.eventPublisher.publish({
      eventId: randomUUID(),
      eventType: 'PRODUCT_CATEGORY_ADDED',
      aggregateType: 'Product',
      aggregateId: saved.id,
      occurredAt: new Date().toISOString(),
      payload: {
        productId: saved.id,
        categoryId: command.categoryId,
      },
    });

    return saved;
  }
}
