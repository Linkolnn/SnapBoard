import { IsString, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для обновления доски
 */
export class UpdateBoardDto {
  @ApiProperty({
    example: 'Updated Board Title',
    description: 'Название доски (1-100 символов)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Название не может быть пустым' })
  @MaxLength(100, { message: 'Название должно быть максимум 100 символов' })
  title?: string;

  @ApiProperty({
    example: 'Updated description',
    description: 'Описание доски (до 500 символов)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Описание должно быть максимум 500 символов' })
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Приватная доска',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @ApiProperty({
    example: '/uploads/images/cover.jpg',
    description: 'URL обложки доски',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImage?: string;
}
