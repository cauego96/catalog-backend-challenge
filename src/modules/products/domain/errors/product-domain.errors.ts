export class ProductCannotBeActivatedError extends Error {
  constructor(message = 'Product cannot be activated') {
    super(message);
    this.name = 'ProductCannotBeActivatedError';
  }
}

export class ArchivedProductCannotChangeCategoriesError extends Error {
  constructor() {
    super('Archived product cannot change categories');
    this.name = 'ArchivedProductCannotChangeCategoriesError';
  }
}

export class ArchivedProductCannotChangeAttributesError extends Error {
  constructor() {
    super('Archived product cannot change attributes');
    this.name = 'ArchivedProductCannotChangeAttributesError';
  }
}

export class DuplicatedProductAttributeKeyError extends Error {
  constructor(key: string) {
    super(`Product already has an attribute with key "${key}"`);
    this.name = 'DuplicatedProductAttributeKeyError';
  }
}

export class ProductAttributeNotFoundError extends Error {
  constructor(key: string) {
    super(`Product attribute "${key}" not found`);
    this.name = 'ProductAttributeNotFoundError';
  }
}
