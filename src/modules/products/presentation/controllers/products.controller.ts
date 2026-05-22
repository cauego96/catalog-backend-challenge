import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
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

  @ApiOperation({
    summary: 'Create Product',
    description: 'Creates a new product in draft status.',
  })
  @ApiCreatedResponse({
    description: 'Product created successfully.',
  })
  @Post()
  create(@Body() body: CreateProductDto) {
    return this.createProductUseCase.execute(body);
  }

  @ApiOperation({
    summary: 'List Products',
    description: 'Returns the list of products ordered by creation date.',
  })
  @ApiOkResponse({
    description: 'Products retrieved successfully.',
  })
  @Get()
  findAll() {
    return this.listProductsUseCase.execute();
  }

  @ApiOperation({
    summary: 'Update Product',
    description: 'Updates the basic information of a product.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product identifier.',
  })
  @ApiOkResponse({
    description: 'Product updated successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Product not found.',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.updateProductUseCase.execute(id, body);
  }

  @ApiOperation({
    summary: 'Activate Product',
    description:
      'Activates a product when it satisfies the business rules for activation.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product identifier.',
  })
  @ApiCreatedResponse({
    description: 'Product activated successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Product not found.',
  })
  @ApiConflictResponse({
    description: 'Another product with the same name already exists.',
  })
  @Post(':id/activate')
  activate(@Param('id') id: string) {
    return this.activateProductUseCase.execute(id);
  }

  @ApiOperation({
    summary: 'Archive Product',
    description: 'Archives a product.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product identifier.',
  })
  @ApiCreatedResponse({
    description: 'Product archived successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Product not found.',
  })
  @Post(':id/archive')
  archive(@Param('id') id: string) {
    return this.archiveProductUseCase.execute(id);
  }

  @ApiOperation({
    summary: 'Add Category to Product',
    description: 'Associates a category with a product.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product identifier.',
  })
  @ApiCreatedResponse({
    description: 'Category added to product successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Product or category not found.',
  })
  @Post(':id/categories')
  addCategory(@Param('id') id: string, @Body() body: AddProductCategoryDto) {
    return this.addCategoryToProductUseCase.execute(id, {
      categoryId: body.categoryId,
    });
  }

  @ApiOperation({
    summary: 'Remove Category from Product',
    description: 'Removes a category association from a product.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product identifier.',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Category identifier.',
  })
  @ApiOkResponse({
    description: 'Category removed from product successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Product or category not found.',
  })
  @Delete(':id/categories/:categoryId')
  removeCategory(
    @Param('id') id: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.removeCategoryFromProductUseCase.execute(id, categoryId);
  }

  @ApiOperation({
    summary: 'Add Attribute to Product',
    description: 'Adds a new attribute to a product.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product identifier.',
  })
  @ApiCreatedResponse({
    description: 'Attribute added successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Product not found.',
  })
  @Post(':id/attributes')
  addAttribute(@Param('id') id: string, @Body() body: AddProductAttributeDto) {
    return this.addProductAttributeUseCase.execute(id, body);
  }

  @ApiOperation({
    summary: 'Update Product Attribute',
    description: 'Updates the value of an existing product attribute.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product identifier.',
  })
  @ApiParam({
    name: 'key',
    description: 'Attribute key.',
  })
  @ApiOkResponse({
    description: 'Attribute updated successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Product not found.',
  })
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

  @ApiOperation({
    summary: 'Remove Product Attribute',
    description: 'Removes an attribute from a product.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product identifier.',
  })
  @ApiParam({
    name: 'key',
    description: 'Attribute key.',
  })
  @ApiOkResponse({
    description: 'Attribute removed successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Product not found.',
  })
  @Delete(':id/attributes/:key')
  removeAttribute(@Param('id') id: string, @Param('key') key: string) {
    return this.removeProductAttributeUseCase.execute(id, key);
  }
}
