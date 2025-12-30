import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для загрузки файла
 */
export class UploadFileDto {
  @ApiProperty({
    example: 'Beautiful Sunset',
    description: 'Название изображения',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Название должно быть максимум 200 символов' })
  title?: string;

  @ApiProperty({
    example: 'Sunset over the ocean',
    description: 'Описание изображения',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Описание должно быть максимум 2000 символов' })
  description?: string;

  @ApiProperty({
    example: 'nature,sunset,ocean',
    description: 'Теги через запятую',
    required: false,
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({
    example: 'uuid',
    description: 'ID доски для привязки',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Некорректный ID доски' })
  boardId?: string;
}
