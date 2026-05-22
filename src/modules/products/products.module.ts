import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { ActivateProductUseCase } from './application/use-cases/activate-product.use-case';
import { AddCategoryToProductUseCase } from './application/use-cases/add-category-to-product.use-case';
import { AddProductAttributeUseCase } from './application/use-cases/add-product-attribute.use-case';
import { ArchiveProductUseCase } from './application/use-cases/archive-product.use-case';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case';
import { RemoveCategoryFromProductUseCase } from './application/use-cases/remove-category-from-product.use-case';
import { RemoveProductAttributeUseCase } from './application/use-cases/remove-product-attribute.use-case';
import { UpdateProductAttributeUseCase } from './application/use-cases/update-product-attribute.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { PRODUCT_REPOSITORY } from './domain/repositories/product.repository';
import { ProductAttributeOrmEntity } from './infrastructure/typeorm/entities/product-attribute.orm-entity';
import { ProductCategoryOrmEntity } from './infrastructure/typeorm/entities/product-category.orm-entity';
import { ProductOrmEntity } from './infrastructure/typeorm/entities/product.orm-entity';
import { ProductTypeormRepository } from './infrastructure/typeorm/repositories/product-typeorm.repository';
import { ProductsController } from './presentation/controllers/products.controller';
import { MessagingModule } from '../../shared/infrastructure/messaging/messaging.module';

@Module({
  imports: [
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
    CreateProductUseCase,
    UpdateProductUseCase,
    ListProductsUseCase,
    ActivateProductUseCase,
    ArchiveProductUseCase,
    AddCategoryToProductUseCase,
    RemoveCategoryFromProductUseCase,
    AddProductAttributeUseCase,
    UpdateProductAttributeUseCase,
    RemoveProductAttributeUseCase,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductTypeormRepository,
    },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductsModule {}
