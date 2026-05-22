import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { CategoryOrmEntity } from '../../../../categories/infrastructure/typeorm/entities/category.orm-entity';
import { ProductOrmEntity } from './product.orm-entity';

@Entity('product_categories')
export class ProductCategoryOrmEntity {
  @PrimaryColumn({ name: 'product_id', type: 'uuid' })
  productId: string;

  @PrimaryColumn({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => ProductOrmEntity, (product) => product.productCategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductOrmEntity;

  @ManyToOne(() => CategoryOrmEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: CategoryOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
