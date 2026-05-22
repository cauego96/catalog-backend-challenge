import { randomUUID } from 'crypto';

export type ProductAttributeProps = {
  id?: string;
  key: string;
  value: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export class ProductAttribute {
  public readonly id: string;
  public readonly key: string;
  private _value: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: ProductAttributeProps) {
    this.id = props.id ?? randomUUID();
    this.key = props.key;
    this._value = props.value;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  get value(): string {
    return this._value;
  }

  updateValue(value: string): void {
    this._value = value;
    this.updatedAt = new Date();
  }
}
