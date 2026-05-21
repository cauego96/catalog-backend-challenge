import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProductAttribute } from '../../domain/entities/product-attribute.entity';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../domain/repositories/product.repository';

@Injectable()
export class AddProductAttributeUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: string, input: { key: string; value: string }) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.addAttribute(
      new ProductAttribute({
        key: input.key,
        value: input.value,
      }),
    );

    return this.productRepository.save(product);
  }
}
