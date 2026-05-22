export class CategoryCannotBeParentOfItselfError extends Error {
  constructor() {
    super('Category cannot be parent of itself');
    this.name = 'CategoryCannotBeParentOfItselfError';
  }
}
