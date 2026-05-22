import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddProductCategoryDto {
  @ApiProperty()
  @IsUUID()
  categoryId: string;
}
