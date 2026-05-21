import {
  Inject,
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  DOMAIN_EVENT_PUBLISHER,
  DomainEventPublisher,
} from '../../../../shared/domain/events/domain-event-publisher';
import {
  CATEGORY_REPOSITORY,
  CategoryRepository,
} from '../../domain/repositories/category.repository';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,

    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(
    id: string,
    input: { name?: string; parentId?: string | null },
  ) {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (input.name && input.name !== category.name) {
      const duplicated = await this.categoryRepository.findByName(input.name);

      if (duplicated) {
        throw new ConflictException('Category name already exists');
      }
    }

    if (input.parentId) {
      const parent = await this.categoryRepository.findById(input.parentId);

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const previousName = category.name;
    const previousParentId = category.parentId;

    category.update(input);

    const saved = await this.categoryRepository.save(category);

    await this.eventPublisher.publish({
      eventId: randomUUID(),
      eventType: 'CATEGORY_UPDATED',
      aggregateType: 'Category',
      aggregateId: saved.id,
      occurredAt: new Date().toISOString(),
      payload: {
        categoryId: saved.id,
        previousName,
        newName: saved.name,
        previousParentId,
        newParentId: saved.parentId,
      },
    });

    return saved;
  }
}
