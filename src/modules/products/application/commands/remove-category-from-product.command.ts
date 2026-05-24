export class RemoveCategoryFromProductCommand {
  constructor(
    public readonly id: string,
    public readonly categoryId: string,
  ) {}
}
