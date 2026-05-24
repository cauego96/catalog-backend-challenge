import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  CATEGORY_REPOSITORY,
  CategoryRepository,
} from '../../../domain/repositories/category.repository';
import { ListCategoriesQuery } from '../../queries/list-categories.query';

@QueryHandler(ListCategoriesQuery)
export class ListCategoriesHandler implements IQueryHandler<ListCategoriesQuery> {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  execute() {
    return this.categoryRepository.findAll();
  }
}
