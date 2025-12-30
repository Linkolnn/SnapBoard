import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для добавления/удаления изображения на доску
 */
export class AddImageDto {
  @ApiProperty({
    example: 'uuid',
    description: 'ID изображения',
  })
  @IsUUID('4', { message: 'Некорректный ID изображения' })
  imageId: string;
}
