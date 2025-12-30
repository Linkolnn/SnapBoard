import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO статистики пользователя
 */
export class StatsResponseDto {
  @ApiProperty({ example: 5, description: 'Количество досок' })
  boardsCount: number;

  @ApiProperty({ example: 42, description: 'Количество изображений' })
  imagesCount: number;

  @ApiProperty({ example: 18, description: 'Количество избранного' })
  favoritesCount: number;
}
