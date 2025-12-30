import { IsString, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для создания доски
 */
export class CreateBoardDto {
  @ApiProperty({
    example: 'My Inspiration Board',
    description: 'Название доски (1-100 символов)',
  })
  @IsString()
  @MinLength(1, { message: 'Название обязательно' })
  @MaxLength(100, { message: 'Название должно быть максимум 100 символов' })
  title: string;

  @ApiProperty({
    example: 'Collection of beautiful landscapes and nature photos',
    description: 'Описание доски (до 500 символов)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Описание должно быть максимум 500 символов' })
  description?: string;

  @ApiProperty({
    example: false,
    description: 'Приватная доска (видна только владельцу)',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
