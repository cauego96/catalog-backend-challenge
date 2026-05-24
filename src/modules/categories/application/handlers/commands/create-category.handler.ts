import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Category } from '../../../domain/entities/category.entity';
import {
  CATEGORY_REPOSITORY,
  CategoryRepository,
} from '../../../domain/repositories/category.repository';
import { CreateCategoryCommand } from '../../commands/create-category.command';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(command: CreateCategoryCommand): Promise<Category> {
    const duplicated = await this.categoryRepository.findByName(command.name);

    if (duplicated) {
      throw new ConflictException('Category name already exists');
    }

    if (command.parentId) {
      const parent = await this.categoryRepository.findById(command.parentId);

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = new Category({
      name: command.name,
      parentId: command.parentId,
    });

    return this.categoryRepository.save(category);
  }
}
