import {
  Inject,
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  CATEGORY_REPOSITORY,
  CategoryRepository,
} from '../../domain/repositories/category.repository';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
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

    category.update(input);

    return this.categoryRepository.save(category);
  }
}
