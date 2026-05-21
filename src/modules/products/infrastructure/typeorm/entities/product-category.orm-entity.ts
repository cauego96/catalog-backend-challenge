import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { ProductOrmEntity } from './product.orm-entity';
import { CategoryOrmEntity } from '../../../../categories/infrastructure/typeorm/entities/category.orm-entity';

@Entity('product_categories')
export class ProductCategoryOrmEntity {
  @PrimaryColumn({ name: 'product_id' })
  productId: string;

  @PrimaryColumn({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => ProductOrmEntity, (product) => product.productCategories, {
    onDelete: 'CASCADE',
  })
  product: ProductOrmEntity;

  @ManyToOne(() => CategoryOrmEntity, {
    onDelete: 'CASCADE',
  })
  category: CategoryOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
