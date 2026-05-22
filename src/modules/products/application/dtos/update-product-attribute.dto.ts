import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateProductAttributeDto {
  @ApiProperty()
  @IsString()
  value: string;
}
