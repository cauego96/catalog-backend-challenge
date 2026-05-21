import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { PRODUCT_REPOSITORY } from './domain/repositories/product.repository';
import { ProductAttributeOrmEntity } from './infrastructure/typeorm/entities/product-attribute.orm-entity';
import { ProductCategoryOrmEntity } from './infrastructure/typeorm/entities/product-category.orm-entity';
import { ProductOrmEntity } from './infrastructure/typeorm/entities/product.orm-entity';
import { ProductTypeormRepository } from './infrastructure/typeorm/repositories/product-typeorm.repository';

@Module({
  imports: [
    CategoriesModule,
    TypeOrmModule.forFeature([
      ProductOrmEntity,
      ProductAttributeOrmEntity,
      ProductCategoryOrmEntity,
    ]),
  ],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductTypeormRepository,
    },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductsModule {}
