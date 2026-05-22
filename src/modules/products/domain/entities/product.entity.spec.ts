import { Product } from './product.entity';
import { ProductAttribute } from './product-attribute.entity';
import { ProductStatus } from '../enums/product-status.enum';

describe('Product', () => {
  it('should start as draft', () => {
    // Arrange
    const product = new Product({ name: 'Product 1' });

    // Assert
    expect(product.status).toBe(ProductStatus.DRAFT);
  });

  it('should not activate without categories', () => {
    // Arrange
    const product = new Product({ name: 'Product 1' });
    product.addAttribute(
      new ProductAttribute({ key: 'color', value: 'black' }),
    );

    // Assert
    expect(() => product.activate()).toThrow(
      'Product must have at least one category',
    );
  });

  it('should not activate without attributes', () => {
    // Arrange
    const product = new Product({ name: 'Product 1' });
    product.addCategory('category-id');

    // Assert
    expect(() => product.activate()).toThrow(
      'Product must have at least one attribute',
    );
  });

  it('should activate with category and attribute', () => {
    // Arrange
    const product = new Product({ name: 'Product 1' });
    product.addCategory('category-id');
    product.addAttribute(
      new ProductAttribute({ key: 'color', value: 'black' }),
    );

    // Act
    product.activate();

    // Assert
    expect(product.status).toBe(ProductStatus.ACTIVE);
  });

  it('should not activate archived product', () => {
    // Arrange
    const product = new Product({ name: 'Product 1' });
    product.addCategory('category-id');
    product.addAttribute(
      new ProductAttribute({ key: 'color', value: 'black' }),
    );
    product.archive();

    // Assert
    expect(() => product.activate()).toThrow(
      'Archived product cannot be activated',
    );
  });

  it('should not change categories when archived', () => {
    // Arrange
    const product = new Product({ name: 'Product 1' });
    product.archive();

    // Assert
    expect(() => product.addCategory('category-id')).toThrow(
      'Archived product cannot change categories',
    );
  });

  it('should not change attributes when archived', () => {
    // Arrange
    const product = new Product({ name: 'Product 1' });
    product.archive();

    // Assert
    expect(() =>
      product.addAttribute(
        new ProductAttribute({ key: 'color', value: 'black' }),
      ),
    ).toThrow('Archived product cannot change attributes');
  });

  it('should allow description update when archived', () => {
    // Arrange
    const product = new Product({ name: 'Product 1' });
    product.archive();

    // Act
    product.updateBasicInfo({ description: 'New description' });

    // Assert
    expect(product.description).toBe('New description');
  });

  it('should not allow duplicated attribute key', () => {
    // Arrange
    const product = new Product({ name: 'Product 1' });

    product.addAttribute(
      new ProductAttribute({ key: 'color', value: 'black' }),
    );

    // Assert
    expect(() =>
      product.addAttribute(
        new ProductAttribute({ key: 'color', value: 'white' }),
      ),
    ).toThrow('Product already has an attribute with key "color"');
  });
});
