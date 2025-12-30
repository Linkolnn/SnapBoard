import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO пользователя (краткая информация)
 */
export class FavoriteUserDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: '/uploads/avatars/avatar.jpg', nullable: true })
  avatar: string | null;
}

/**
 * DTO изображения в избранном
 */
export class FavoriteImageDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: '/uploads/images/image.jpg' })
  url: string;

  @ApiProperty({ example: 'Beautiful Sunset', nullable: true })
  title: string | null;

  @ApiProperty({ example: 'Sunset over the ocean', nullable: true })
  description: string | null;

  @ApiProperty({ example: ['nature', 'sunset'], nullable: true })
  tags: string[] | null;

  @ApiProperty({ example: 1920 })
  width: number;

  @ApiProperty({ example: 1080 })
  height: number;

  @ApiProperty({ example: true })
  isFavorite: boolean;

  @ApiProperty({ example: 42 })
  favoritesCount: number;

  @ApiProperty({ type: FavoriteUserDto })
  user: FavoriteUserDto;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  addedAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}


/**
 * DTO ответа списка избранного
 */
export class FavoritesListResponseDto {
  @ApiProperty({ type: [FavoriteImageDto] })
  items: FavoriteImageDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 12 })
  pageSize: number;

  @ApiProperty({ example: 25 })
  totalItems: number;

  @ApiProperty({ example: 3 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasMore: boolean;
}

/**
 * DTO ответа добавления/удаления
 */
export class FavoriteActionResponseDto {
  @ApiProperty({ example: 'Добавлено в избранное' })
  message: string;

  @ApiProperty({ example: 'uuid' })
  imageId: string;

  @ApiProperty({ example: 43 })
  favoritesCount: number;
}

/**
 * DTO ответа batch проверки
 */
export class FavoriteCheckResponseDto {
  @ApiProperty({
    example: { 'uuid-1': true, 'uuid-2': false },
    description: 'Объект с ID изображений и их статусом избранного',
  })
  results: Record<string, boolean>;
}
