import { Product } from '../../../domain/entities/product.entity';
import { ProductAttribute } from '../../../domain/entities/product-attribute.entity';
import { ProductOrmEntity } from '../entities/product.orm-entity';
import { ProductAttributeOrmEntity } from '../entities/product-attribute.orm-entity';
import { ProductCategoryOrmEntity } from '../entities/product-category.orm-entity';

export class ProductMapper {
  static toDomain(entity: ProductOrmEntity): Product {
    return new Product({
      id: entity.id,
      name: entity.name,
      description: entity.description,
      status: entity.status,
      categoryIds:
        entity.productCategories?.map((item) => item.categoryId) ?? [],
      attributes:
        entity.attributes?.map(
          (attribute) =>
            new ProductAttribute({
              id: attribute.id,
              key: attribute.key,
              value: attribute.value,
              createdAt: attribute.createdAt,
              updatedAt: attribute.updatedAt,
            }),
        ) ?? [],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toOrm(domain: Product): ProductOrmEntity {
    const entity = new ProductOrmEntity();

    entity.id = domain.id;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.status = domain.status;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;

    entity.attributes = domain.attributes.map((attribute) => {
      const attr = new ProductAttributeOrmEntity();
      attr.id = attribute.id;
      attr.productId = domain.id;
      attr.key = attribute.key;
      attr.value = attribute.value;
      attr.createdAt = attribute.createdAt;
      attr.updatedAt = attribute.updatedAt;
      return attr;
    });

    entity.productCategories = domain.categoryIds.map((categoryId) => {
      const productCategory = new ProductCategoryOrmEntity();
      productCategory.productId = domain.id;
      productCategory.categoryId = categoryId;
      return productCategory;
    });

    return entity;
  }
}
