import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CATEGORY_REPOSITORY } from './domain/repositories/category.repository';
import { CategoryOrmEntity } from './infrastructure/typeorm/entities/category.orm-entity';
import { CategoryTypeormRepository } from './infrastructure/typeorm/repositories/category-typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryOrmEntity])],
  providers: [
    {
      provide: CATEGORY_REPOSITORY,
      useClass: CategoryTypeormRepository,
    },
  ],
  exports: [CATEGORY_REPOSITORY],
})
export class CategoriesModule {}
