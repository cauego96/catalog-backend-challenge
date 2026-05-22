import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CategoryCannotBeParentOfItselfError } from '../../../../modules/categories/domain/errors/category-domain.errors';
import {
  ArchivedProductCannotChangeAttributesError,
  ArchivedProductCannotChangeCategoriesError,
  DuplicatedProductAttributeKeyError,
  ProductAttributeNotFoundError,
  ProductCannotBeActivatedError,
} from '../../../../modules/products/domain/errors/product-domain.errors';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        return response.status(status).json({
          statusCode: status,
          message: exceptionResponse,
          path: request.url,
          timestamp: new Date().toISOString(),
        });
      }

      return response.status(status).json(exceptionResponse);
    }

    const mappedException = this.mapDomainException(exception);

    if (mappedException) {
      return response.status(mappedException.statusCode).json({
        statusCode: mappedException.statusCode,
        message: mappedException.message,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private mapDomainException(
    exception: unknown,
  ): { statusCode: number; message: string } | null {
    if (
      exception instanceof ProductCannotBeActivatedError ||
      exception instanceof ArchivedProductCannotChangeCategoriesError ||
      exception instanceof ArchivedProductCannotChangeAttributesError ||
      exception instanceof CategoryCannotBeParentOfItselfError
    ) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
      };
    }

    if (exception instanceof DuplicatedProductAttributeKeyError) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: exception.message,
      };
    }

    if (exception instanceof ProductAttributeNotFoundError) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: exception.message,
      };
    }

    return null;
  }
}
