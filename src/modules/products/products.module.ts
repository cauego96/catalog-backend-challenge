import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import {
  ProductCommandHandlers,
  ProductQueryHandlers,
} from './application/handlers';
import { PRODUCT_REPOSITORY } from './domain/repositories/product.repository';
import { ProductAttributeOrmEntity } from './infrastructure/typeorm/entities/product-attribute.orm-entity';
import { ProductCategoryOrmEntity } from './infrastructure/typeorm/entities/product-category.orm-entity';
import { ProductOrmEntity } from './infrastructure/typeorm/entities/product.orm-entity';
import { ProductTypeormRepository } from './infrastructure/typeorm/repositories/product-typeorm.repository';
import { ProductsController } from './presentation/controllers/products.controller';
import { MessagingModule } from '../../shared/infrastructure/messaging/messaging.module';

@Module({
  imports: [
    CqrsModule,
    CategoriesModule,
    MessagingModule,
    TypeOrmModule.forFeature([
      ProductOrmEntity,
      ProductAttributeOrmEntity,
      ProductCategoryOrmEntity,
    ]),
  ],
  controllers: [ProductsController],
  providers: [
    ...ProductCommandHandlers,
    ...ProductQueryHandlers,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductTypeormRepository,
    },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductsModule {}
