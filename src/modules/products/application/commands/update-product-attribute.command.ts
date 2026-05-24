export class UpdateProductAttributeCommand {
  constructor(
    public readonly id: string,
    public readonly key: string,
    public readonly value: string,
  ) {}
}
