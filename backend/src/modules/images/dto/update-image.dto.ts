import { IsString, IsOptional, IsArray, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для обновления изображения
 */
export class UpdateImageDto {
  @ApiProperty({
    example: 'Beautiful Sunset',
    description: 'Название изображения (до 200 символов)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Название должно быть максимум 200 символов' })
  title?: string;

  @ApiProperty({
    example: 'Sunset over the ocean with vibrant colors',
    description: 'Описание изображения',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Описание должно быть максимум 2000 символов' })
  description?: string;

  @ApiProperty({
    example: ['nature', 'sunset', 'ocean'],
    description: 'Теги изображения',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
