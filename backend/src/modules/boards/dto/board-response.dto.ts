import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO владельца доски (краткая информация)
 */
export class BoardUserDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: '/uploads/avatars/avatar.jpg', nullable: true })
  avatar: string | null;
}

/**
 * DTO ответа доски
 */
export class BoardResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'My Inspiration Board' })
  title: string;

  @ApiProperty({ example: 'Collection of beautiful images', nullable: true })
  description: string | null;

  @ApiProperty({ example: '/uploads/images/cover.jpg', nullable: true })
  coverImage: string | null;

  @ApiProperty({ example: false })
  isPrivate: boolean;

  @ApiProperty({ example: 15 })
  imagesCount: number;

  @ApiProperty({ type: BoardUserDto, nullable: true })
  user: BoardUserDto | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

/**
 * DTO пагинированного ответа досок
 */
export class PaginatedBoardsResponseDto {
  @ApiProperty({ type: [BoardResponseDto] })
  items: BoardResponseDto[];

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
