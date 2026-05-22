import { Category } from '../../../domain/entities/category.entity';
import { CategoryOrmEntity } from '../entities/category.orm-entity';

export class CategoryMapper {
  static toDomain(entity: CategoryOrmEntity): Category {
    return new Category({
      id: entity.id,
      name: entity.name,
      parentId: entity.parentId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toOrm(domain: Category): CategoryOrmEntity {
    const entity = new CategoryOrmEntity();

    entity.id = domain.id;
    entity.name = domain.name;
    entity.parentId = domain.parentId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;

    return entity;
  }
}
