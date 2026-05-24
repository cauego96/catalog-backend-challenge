import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import {
  DOMAIN_EVENT_PUBLISHER,
  DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher';
import {
  CATEGORY_REPOSITORY,
  CategoryRepository,
} from '../../../domain/repositories/category.repository';
import { UpdateCategoryCommand } from '../../commands/update-category.command';

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler implements ICommandHandler<UpdateCategoryCommand> {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,

    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: UpdateCategoryCommand) {
    const category = await this.categoryRepository.findById(command.id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (command.name && command.name !== category.name) {
      const duplicated = await this.categoryRepository.findByName(command.name);

      if (duplicated) {
        throw new ConflictException('Category name already exists');
      }
    }

    if (command.parentId) {
      const parent = await this.categoryRepository.findById(command.parentId);

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const previousName = category.name;
    const previousParentId = category.parentId;

    category.update({
      name: command.name,
      parentId: command.parentId,
    });

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
