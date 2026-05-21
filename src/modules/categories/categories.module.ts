import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CATEGORY_REPOSITORY } from './domain/repositories/category.repository';
import { CategoryOrmEntity } from './infrastructure/typeorm/entities/category.orm-entity';
import { CategoryTypeormRepository } from './infrastructure/typeorm/repositories/category-typeorm.repository';
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { UpdateCategoryUseCase } from './application/use-cases/update-category.use-case';
import { ListCategoriesUseCase } from './application/use-cases/list-categories.use-case';
import { CategoriesController } from './presentation/controllers/categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryOrmEntity])],
  controllers: [CategoriesController],
  providers: [
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    ListCategoriesUseCase,
    {
      provide: CATEGORY_REPOSITORY,
      useClass: CategoryTypeormRepository,
    },
  ],
  exports: [CATEGORY_REPOSITORY],
})
export class CategoriesModule {}
