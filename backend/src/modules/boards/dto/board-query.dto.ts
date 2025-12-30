import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum BoardSortBy {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  TITLE_ASC = 'title_asc',
  TITLE_DESC = 'title_desc',
}

/**
 * DTO для query параметров списка досок
 */
export class BoardQueryDto {
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

  @ApiProperty({ example: 'uuid', required: false, description: 'Фильтр по владельцу' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: 'inspiration', required: false, description: 'Поиск по названию/описанию' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ 
    enum: BoardSortBy, 
    required: false, 
    default: BoardSortBy.NEWEST,
    description: 'Сортировка' 
  })
  @IsOptional()
  @IsEnum(BoardSortBy)
  sortBy?: BoardSortBy = BoardSortBy.NEWEST;
}
