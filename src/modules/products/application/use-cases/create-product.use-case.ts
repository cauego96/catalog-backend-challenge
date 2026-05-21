import { Inject, Injectable, Logger } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../domain/repositories/product.repository';

@Injectable()
export class CreateProductUseCase {
  private readonly logger = new Logger(CreateProductUseCase.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: { name: string; description?: string | null }) {
    this.logger.log({
      action: 'product.create',
      step: 'started',
      productName: input.name,
    });

    const product = new Product({
      name: input.name,
      description: input.description,
    });

    const saved = await this.productRepository.save(product);

    this.logger.log({
      action: 'product.create',
      step: 'completed',
      productId: saved.id,
    });

    return saved;
  }
}
