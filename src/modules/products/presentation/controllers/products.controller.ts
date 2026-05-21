import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from '../../application/dtos/create-product.dto';
import { UpdateProductDto } from '../../application/dtos/update-product.dto';
import { AddProductAttributeDto } from '../../application/dtos/add-product-attribute.dto';
import { UpdateProductAttributeDto } from '../../application/dtos/update-product-attribute.dto';
import { AddProductCategoryDto } from '../../application/dtos/add-product-category.dto';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { ListProductsUseCase } from '../../application/use-cases/list-products.use-case';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case';
import { ActivateProductUseCase } from '../../application/use-cases/activate-product.use-case';
import { ArchiveProductUseCase } from '../../application/use-cases/archive-product.use-case';
import { AddCategoryToProductUseCase } from '../../application/use-cases/add-category-to-product.use-case';
import { RemoveCategoryFromProductUseCase } from '../../application/use-cases/remove-category-from-product.use-case';
import { AddProductAttributeUseCase } from '../../application/use-cases/add-product-attribute.use-case';
import { UpdateProductAttributeUseCase } from '../../application/use-cases/update-product-attribute.use-case';
import { RemoveProductAttributeUseCase } from '../../application/use-cases/remove-product-attribute.use-case';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly activateProductUseCase: ActivateProductUseCase,
    private readonly archiveProductUseCase: ArchiveProductUseCase,
    private readonly addCategoryToProductUseCase: AddCategoryToProductUseCase,
    private readonly removeCategoryFromProductUseCase: RemoveCategoryFromProductUseCase,
    private readonly addProductAttributeUseCase: AddProductAttributeUseCase,
    private readonly updateProductAttributeUseCase: UpdateProductAttributeUseCase,
    private readonly removeProductAttributeUseCase: RemoveProductAttributeUseCase,
  ) {}

  @Post()
  create(@Body() body: CreateProductDto) {
    return this.createProductUseCase.execute(body);
  }

  @Get()
  findAll() {
    return this.listProductsUseCase.execute();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.updateProductUseCase.execute(id, body);
  }

  @Post(':id/activate')
  activate(@Param('id') id: string) {
    return this.activateProductUseCase.execute(id);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string) {
    return this.archiveProductUseCase.execute(id);
  }

  @Post(':id/categories')
  addCategory(@Param('id') id: string, @Body() body: AddProductCategoryDto) {
    return this.addCategoryToProductUseCase.execute(id, {
      categoryId: body.categoryId,
    });
  }

  @Delete(':id/categories/:categoryId')
  removeCategory(
    @Param('id') id: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.removeCategoryFromProductUseCase.execute(id, categoryId);
  }

  @Post(':id/attributes')
  addAttribute(@Param('id') id: string, @Body() body: AddProductAttributeDto) {
    return this.addProductAttributeUseCase.execute(id, body);
  }

  @Patch(':id/attributes/:key')
  updateAttribute(
    @Param('id') id: string,
    @Param('key') key: string,
    @Body() body: UpdateProductAttributeDto,
  ) {
    return this.updateProductAttributeUseCase.execute(id, key, {
      value: body.value,
    });
  }

  @Delete(':id/attributes/:key')
  removeAttribute(@Param('id') id: string, @Param('key') key: string) {
    return this.removeProductAttributeUseCase.execute(id, key);
  }
}
