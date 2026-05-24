export class AddCategoryToProductCommand {
  constructor(
    public readonly id: string,
    public readonly categoryId: string,
  ) {}
}
