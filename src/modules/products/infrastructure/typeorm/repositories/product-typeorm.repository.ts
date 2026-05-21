import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../../domain/entities/product.entity';
import { ProductRepository } from '../../../domain/repositories/product.repository';
import { ProductOrmEntity } from '../entities/product.orm-entity';
import { ProductMapper } from '../mappers/product.mapper';

@Injectable()
export class ProductTypeormRepository implements ProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repository: Repository<ProductOrmEntity>,
  ) {}

  async save(product: Product): Promise<Product> {
    const ormEntity = ProductMapper.toOrm(product);
    const saved = await this.repository.save(ormEntity);
    const reloaded = await this.findById(saved.id);

    if (!reloaded) {
      throw new Error('Product not found after save');
    }

    return reloaded;
  }

  async findById(id: string): Promise<Product | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: {
        attributes: true,
        productCategories: true,
      },
    });

    return entity ? ProductMapper.toDomain(entity) : null;
  }

  async findByName(name: string): Promise<Product | null> {
    const entity = await this.repository.findOne({
      where: { name },
      relations: {
        attributes: true,
        productCategories: true,
      },
    });

    return entity ? ProductMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Product[]> {
    const entities = await this.repository.find({
      relations: {
        attributes: true,
        productCategories: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return entities.map(ProductMapper.toDomain);
  }
}
