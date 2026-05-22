import { randomUUID } from 'crypto';
import { ProductStatus } from '../enums/product-status.enum';
import { ProductAttribute } from './product-attribute.entity';
import {
  ArchivedProductCannotChangeAttributesError,
  ArchivedProductCannotChangeCategoriesError,
  DuplicatedProductAttributeKeyError,
  ProductAttributeNotFoundError,
  ProductCannotBeActivatedError,
} from '../errors/product-domain.errors';

export type ProductProps = {
  id?: string;
  name: string;
  description?: string | null;
  status?: ProductStatus;
  categoryIds?: string[];
  attributes?: ProductAttribute[];
  createdAt?: Date;
  updatedAt?: Date;
};

export class Product {
  public readonly id: string;
  private _name: string;
  private _description: string | null;
  private _status: ProductStatus;
  private _categoryIds: string[];
  private _attributes: ProductAttribute[];
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: ProductProps) {
    this.id = props.id ?? randomUUID();
    this._name = props.name;
    this._description = props.description ?? null;
    this._status = props.status ?? ProductStatus.DRAFT;
    this._categoryIds = props.categoryIds ?? [];
    this._attributes = props.attributes ?? [];
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get status(): ProductStatus {
    return this._status;
  }

  get categoryIds(): string[] {
    return [...this._categoryIds];
  }

  get attributes(): ProductAttribute[] {
    return [...this._attributes];
  }

  updateBasicInfo(input: { name?: string; description?: string | null }): void {
    if (input.name !== undefined) {
      this._name = input.name;
    }

    if (input.description !== undefined) {
      this._description = input.description;
    }

    this.touch();
  }

  activate(): void {
    if (this._status === ProductStatus.ARCHIVED) {
      throw new ProductCannotBeActivatedError(
        'Archived product cannot be activated',
      );
    }

    if (this._categoryIds.length === 0) {
      throw new ProductCannotBeActivatedError(
        'Product must have at least one category to be activated',
      );
    }

    if (this._attributes.length === 0) {
      throw new ProductCannotBeActivatedError(
        'Product must have at least one attribute to be activated',
      );
    }

    this._status = ProductStatus.ACTIVE;
    this.touch();
  }

  archive(): void {
    this._status = ProductStatus.ARCHIVED;
    this.touch();
  }

  addCategory(categoryId: string): void {
    this.ensureCanChangeCategories();

    if (!this._categoryIds.includes(categoryId)) {
      this._categoryIds.push(categoryId);
      this.touch();
    }
  }

  removeCategory(categoryId: string): void {
    this.ensureCanChangeCategories();

    this._categoryIds = this._categoryIds.filter((id) => id !== categoryId);
    this.touch();
  }

  addAttribute(attribute: ProductAttribute): void {
    this.ensureCanChangeAttributes();

    const alreadyExists = this._attributes.some(
      (item) => item.key === attribute.key,
    );

    if (alreadyExists) {
      throw new DuplicatedProductAttributeKeyError(attribute.key);
    }

    this._attributes.push(attribute);
    this.touch();
  }

  updateAttribute(key: string, value: string): void {
    this.ensureCanChangeAttributes();

    const attribute = this._attributes.find((item) => item.key === key);

    if (!attribute) {
      throw new ProductAttributeNotFoundError(key);
    }

    attribute.updateValue(value);
    this.touch();
  }

  removeAttribute(key: string): void {
    this.ensureCanChangeAttributes();

    const exists = this._attributes.some((item) => item.key === key);

    if (!exists) {
      throw new ProductAttributeNotFoundError(key);
    }

    this._attributes = this._attributes.filter((item) => item.key !== key);
    this.touch();
  }

  private ensureCanChangeCategories(): void {
    if (this._status === ProductStatus.ARCHIVED) {
      throw new ArchivedProductCannotChangeCategoriesError();
    }
  }

  private ensureCanChangeAttributes(): void {
    if (this._status === ProductStatus.ARCHIVED) {
      throw new ArchivedProductCannotChangeAttributesError();
    }
  }

  private touch(): void {
    this.updatedAt = new Date();
  }
}
