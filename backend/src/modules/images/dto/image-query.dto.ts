import { IsOptional, IsString, IsInt, Min, Max, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum ImageSortBy {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  TITLE_ASC = 'title_asc',
  TITLE_DESC = 'title_desc',
}

/**
 * DTO для query параметров списка изображений
 */
export class ImageQueryDto {
  @ApiProperty({ example: 1, required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 12, required: false, default: 12, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number = 12;

  @ApiProperty({ example: 'uuid', required: false, description: 'Фильтр по доске' })
  @IsOptional()
  @IsUUID('4', { message: 'Некорректный ID доски' })
  boardId?: string;

  @ApiProperty({ example: 'uuid', required: false, description: 'Фильтр по владельцу' })
  @IsOptional()
  @IsUUID('4', { message: 'Некорректный ID пользователя' })
  userId?: string;

  @ApiProperty({ example: 'sunset', required: false, description: 'Поиск по названию/описанию' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ example: 'nature,sunset', required: false, description: 'Фильтр по тегам (через запятую)' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({ 
    enum: ImageSortBy, 
    required: false, 
    default: ImageSortBy.NEWEST,
    description: 'Сортировка' 
  })
  @IsOptional()
  @IsEnum(ImageSortBy)
  sortBy?: ImageSortBy = ImageSortBy.NEWEST;
}
