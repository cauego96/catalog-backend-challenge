import { Category } from './category.entity';

describe('Category', () => {
  it('should create a category without parent', () => {
    const category = new Category({ name: 'Electronics' });

    expect(category.name).toBe('Electronics');
    expect(category.parentId).toBeNull();
  });

  it('should not allow category to be parent of itself', () => {
    expect(() => {
      const categoryId = 'category-id';

      new Category({
        id: categoryId,
        name: 'Electronics',
        parentId: categoryId,
      });
    }).toThrow('Category cannot be parent of itself');
  });
});
