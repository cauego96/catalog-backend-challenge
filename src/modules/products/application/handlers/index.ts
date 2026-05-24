import { ActivateProductHandler } from './commands/activate-product.handler';
import { AddCategoryToProductHandler } from './commands/add-category-to-product.handler';
import { AddProductAttributeHandler } from './commands/add-product-attribute.handler';
import { ArchiveProductHandler } from './commands/archive-product.handler';
import { CreateProductHandler } from './commands/create-product.handler';
import { RemoveCategoryFromProductHandler } from './commands/remove-category-from-product.handler';
import { RemoveProductAttributeHandler } from './commands/remove-product-attribute.handler';
import { UpdateProductAttributeHandler } from './commands/update-product-attribute.handler';
import { UpdateProductHandler } from './commands/update-product.handler';
import { ListProductsHandler } from './queries/list-products.handler';

export const ProductCommandHandlers = [
  CreateProductHandler,
  UpdateProductHandler,
  ActivateProductHandler,
  ArchiveProductHandler,
  AddCategoryToProductHandler,
  RemoveCategoryFromProductHandler,
  AddProductAttributeHandler,
  UpdateProductAttributeHandler,
  RemoveProductAttributeHandler,
];

export const ProductQueryHandlers = [ListProductsHandler];
