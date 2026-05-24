import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
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
import { CreateCategoryCommand } from '../../application/commands/create-category.command';
import { CreateCategoryDto } from '../../application/dtos/create-category.dto';
import { UpdateCategoryDto } from '../../application/dtos/update-category.dto';
import { ListCategoriesQuery } from '../../application/queries/list-categories.query';
import { UpdateCategoryCommand } from '../../application/commands/update-category.command';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Create Category',
    description: 'Creates a new category in the catalog.',
  })
  @ApiCreatedResponse({
    description: 'Category created successfully.',
  })
  @ApiConflictResponse({
    description: 'Category name already exists.',
  })
  @ApiNotFoundResponse({
    description: 'Parent category not found.',
  })
  @Post()
  create(@Body() body: CreateCategoryDto) {
    return this.commandBus.execute(
      new CreateCategoryCommand(body.name, body.parentId),
    );
  }

  @ApiOperation({
    summary: 'List Categories',
    description: 'Returns the list of categories ordered by creation date.',
  })
  @ApiOkResponse({
    description: 'Categories retrieved successfully.',
  })
  @Get()
  findAll() {
    return this.queryBus.execute(new ListCategoriesQuery());
  }

  @ApiOperation({
    summary: 'Update Category',
    description: 'Updates the name or parent of an existing category.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category identifier.',
  })
  @ApiOkResponse({
    description: 'Category updated successfully.',
  })
  @ApiConflictResponse({
    description: 'Category name already exists.',
  })
  @ApiNotFoundResponse({
    description: 'Category or parent category not found.',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateCategoryDto) {
    return this.commandBus.execute(
      new UpdateCategoryCommand(id, body.name, body.parentId),
    );
  }
}
