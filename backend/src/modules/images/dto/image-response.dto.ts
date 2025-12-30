import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO владельца изображения (краткая информация)
 */
export class ImageUserDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: '/uploads/avatars/avatar.jpg', nullable: true })
  avatar: string | null;
}

/**
 * DTO доски изображения (краткая информация)
 */
export class ImageBoardDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Nature Collection' })
  title: string;
}

/**
 * DTO ответа изображения
 */
export class ImageResponseDto {
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

  @ApiProperty({ example: 1920, nullable: true })
  width: number | null;

  @ApiProperty({ example: 1080, nullable: true })
  height: number | null;

  @ApiProperty({ example: 245760, nullable: true })
  size: number | null;

  @ApiProperty({ example: 'image/jpeg', nullable: true })
  mimeType: string | null;

  @ApiProperty({ example: false })
  isFavorite: boolean;

  @ApiProperty({ example: true })
  isSaved: boolean;

  @ApiProperty({ example: 42 })
  favoritesCount: number;

  @ApiProperty({ type: ImageUserDto })
  user: ImageUserDto;

  @ApiProperty({ type: ImageBoardDto, nullable: true })
  board: ImageBoardDto | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}

/**
 * DTO пагинированного ответа изображений
 */
export class PaginatedImagesResponseDto {
  @ApiProperty({ type: [ImageResponseDto] })
  items: ImageResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 12 })
  pageSize: number;

  @ApiProperty({ example: 150 })
  totalItems: number;

  @ApiProperty({ example: 13 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasMore: boolean;
}
