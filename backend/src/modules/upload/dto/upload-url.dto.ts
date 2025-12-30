import { IsString, IsOptional, IsUUID, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для загрузки по URL
 */
export class UploadUrlDto {
  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL изображения для загрузки',
  })
  @IsUrl({}, { message: 'Некорректный URL' })
  url: string;

  @ApiProperty({
    example: 'Downloaded Image',
    description: 'Название изображения',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Название должно быть максимум 200 символов' })
  title?: string;

  @ApiProperty({
    example: 'Image from external source',
    description: 'Описание изображения',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Описание должно быть максимум 2000 символов' })
  description?: string;

  @ApiProperty({
    example: 'external,download',
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
