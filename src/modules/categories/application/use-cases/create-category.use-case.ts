import {
  Inject,
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Category } from '../../domain/entities/category.entity';
import {
  CATEGORY_REPOSITORY,
  CategoryRepository,
} from '../../domain/repositories/category.repository';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(input: {
    name: string;
    parentId?: string | null;
  }): Promise<Category> {
    const duplicated = await this.categoryRepository.findByName(input.name);

    if (duplicated) {
      throw new ConflictException('Category name already exists');
    }

    if (input.parentId) {
      const parent = await this.categoryRepository.findById(input.parentId);

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = new Category({
      name: input.name,
      parentId: input.parentId,
    });

    return this.categoryRepository.save(category);
  }
}
