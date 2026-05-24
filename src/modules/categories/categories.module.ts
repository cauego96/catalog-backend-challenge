import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingModule } from '../../shared/infrastructure/messaging/messaging.module';
import {
  CategoryCommandHandlers,
  CategoryQueryHandlers,
} from './application/handlers';
import { CATEGORY_REPOSITORY } from './domain/repositories/category.repository';
import { CategoryOrmEntity } from './infrastructure/typeorm/entities/category.orm-entity';
import { CategoryTypeormRepository } from './infrastructure/typeorm/repositories/category-typeorm.repository';
import { CategoriesController } from './presentation/controllers/categories.controller';

@Module({
  imports: [
    CqrsModule,
    MessagingModule,
    TypeOrmModule.forFeature([CategoryOrmEntity]),
  ],
  controllers: [CategoriesController],
  providers: [
    ...CategoryCommandHandlers,
    ...CategoryQueryHandlers,
    {
      provide: CATEGORY_REPOSITORY,
      useClass: CategoryTypeormRepository,
    },
  ],
  exports: [CATEGORY_REPOSITORY],
})
export class CategoriesModule {}
