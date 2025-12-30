import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для batch проверки избранного
 */
export class FavoriteCheckDto {
  @ApiProperty({
    example: 'uuid-1,uuid-2,uuid-3',
    description: 'ID изображений через запятую (max: 50)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Укажите imageIds' })
  imageIds: string;
}
