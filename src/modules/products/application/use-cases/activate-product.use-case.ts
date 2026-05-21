import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../domain/repositories/product.repository';

@Injectable()
export class ActivateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: string) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const productWithSameName = await this.productRepository.findByName(
      product.name,
    );

    if (productWithSameName && productWithSameName.id !== product.id) {
      throw new ConflictException(
        'Another product with the same name already exists',
      );
    }

    product.activate();

    const saved = await this.productRepository.save(product);

    return saved;
  }
}
