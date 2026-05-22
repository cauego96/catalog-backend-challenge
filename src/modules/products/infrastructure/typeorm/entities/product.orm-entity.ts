import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductStatus } from '../../../domain/enums/product-status.enum';
import { ProductAttributeOrmEntity } from './product-attribute.orm-entity';
import { ProductCategoryOrmEntity } from './product-category.orm-entity';

@Entity('products')
export class ProductOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @OneToMany(
    () => ProductAttributeOrmEntity,
    (attribute) => attribute.product,
    {
      cascade: true,
    },
  )
  attributes: ProductAttributeOrmEntity[];

  @OneToMany(
    () => ProductCategoryOrmEntity,
    (productCategory) => productCategory.product,
    {
      cascade: true,
    },
  )
  productCategories: ProductCategoryOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
