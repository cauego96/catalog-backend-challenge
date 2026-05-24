import { CreateCategoryHandler } from './commands/create-category.handler';
import { UpdateCategoryHandler } from './commands/update-category.handler';
import { ListCategoriesHandler } from './queries/list-categories.handler';

export const CategoryCommandHandlers = [
  CreateCategoryHandler,
  UpdateCategoryHandler,
];

export const CategoryQueryHandlers = [ListCategoriesHandler];
