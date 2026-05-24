export class RemoveProductAttributeCommand {
  constructor(
    public readonly id: string,
    public readonly key: string,
  ) {}
}
