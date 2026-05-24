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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ActivateProductCommand } from '../../application/commands/activate-product.command';
import { AddCategoryToProductCommand } from '../../application/commands/add-category-to-product.command';
import { AddProductAttributeCommand } from '../../application/commands/add-product-attribute.command';
import { ArchiveProductCommand } from '../../application/commands/archive-product.command';
import { CreateProductCommand } from '../../application/commands/create-product.command';
import { RemoveCategoryFromProductCommand } from '../../application/commands/remove-category-from-product.command';
import { RemoveProductAttributeCommand } from '../../application/commands/remove-product-attribute.command';
import { UpdateProductAttributeCommand } from '../../application/commands/update-product-attribute.command';
import { UpdateProductCommand } from '../../application/commands/update-product.command';
import { CreateProductDto } from '../../application/dtos/create-product.dto';
import { UpdateProductDto } from '../../application/dtos/update-product.dto';
import { AddProductAttributeDto } from '../../application/dtos/add-product-attribute.dto';
import { UpdateProductAttributeDto } from '../../application/dtos/update-product-attribute.dto';
import { AddProductCategoryDto } from '../../application/dtos/add-product-category.dto';
import { ListProductsQuery } from '../../application/queries/list-products.query';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
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
    return this.commandBus.execute(
      new CreateProductCommand(body.name, body.description),
    );
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
    return this.queryBus.execute(new ListProductsQuery());
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
    return this.commandBus.execute(
      new UpdateProductCommand(id, body.name, body.description),
    );
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
    return this.commandBus.execute(new ActivateProductCommand(id));
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
    return this.commandBus.execute(new ArchiveProductCommand(id));
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
    return this.commandBus.execute(
      new AddCategoryToProductCommand(id, body.categoryId),
    );
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
    return this.commandBus.execute(
      new RemoveCategoryFromProductCommand(id, categoryId),
    );
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
    return this.commandBus.execute(
      new AddProductAttributeCommand(id, body.key, body.value),
    );
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
    return this.commandBus.execute(
      new UpdateProductAttributeCommand(id, key, body.value),
    );
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
    return this.commandBus.execute(new RemoveProductAttributeCommand(id, key));
  }
}
