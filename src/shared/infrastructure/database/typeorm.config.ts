import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { CategoryOrmEntity } from '../../../modules/categories/infrastructure/typeorm/entities/category.orm-entity';
import { ProductAttributeOrmEntity } from '../../../modules/products/infrastructure/typeorm/entities/product-attribute.orm-entity';
import { ProductCategoryOrmEntity } from '../../../modules/products/infrastructure/typeorm/entities/product-category.orm-entity';
import { ProductOrmEntity } from '../../../modules/products/infrastructure/typeorm/entities/product.orm-entity';
import { join } from 'path';

export const databaseEntities = [
  CategoryOrmEntity,
  ProductOrmEntity,
  ProductAttributeOrmEntity,
  ProductCategoryOrmEntity,
];

export function buildDatabaseOptions(
  env: NodeJS.ProcessEnv,
): DataSourceOptions & TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: env.DATABASE_HOST,
    port: Number(env.DATABASE_PORT ?? 5432),
    username: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
    entities: databaseEntities,
    migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
    synchronize: false,
    logging: env.NODE_ENV !== 'production',
  };
}
