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
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case';
import { ListCategoriesUseCase } from '../../application/use-cases/list-categories.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/update-category.use-case';
import { CreateCategoryDto } from '../../application/dtos/create-category.dto';
import { UpdateCategoryDto } from '../../application/dtos/update-category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
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
    return this.createCategoryUseCase.execute(body);
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
    return this.listCategoriesUseCase.execute();
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
    return this.updateCategoryUseCase.execute(id, body);
  }
}
