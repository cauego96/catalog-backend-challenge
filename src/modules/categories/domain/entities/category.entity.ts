import { randomUUID } from 'crypto';
import { CategoryCannotBeParentOfItselfError } from '../errors/category-domain.errors';

export type CategoryProps = {
  id?: string;
  name: string;
  parentId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export class Category {
  public readonly id: string;
  private _name: string;
  private _parentId: string | null;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: CategoryProps) {
    this.id = props.id ?? randomUUID();
    this._name = props.name;
    this._parentId = props.parentId ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    this.ensureIsNotParentOfItself();
  }

  get name(): string {
    return this._name;
  }

  get parentId(): string | null {
    return this._parentId;
  }

  update(input: { name?: string; parentId?: string | null }): void {
    if (input.name !== undefined) {
      this._name = input.name;
    }

    if (input.parentId !== undefined) {
      this._parentId = input.parentId;
    }

    this.ensureIsNotParentOfItself();
    this.updatedAt = new Date();
  }

  private ensureIsNotParentOfItself(): void {
    if (this._parentId && this._parentId === this.id) {
      throw new CategoryCannotBeParentOfItselfError();
    }
  }
}
