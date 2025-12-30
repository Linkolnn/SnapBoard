import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO thumbnails
 */
export class ThumbnailsDto {
  @ApiProperty({ example: '/uploads/thumbnails/small/image.jpg' })
  small: string;

  @ApiProperty({ example: '/uploads/thumbnails/medium/image.jpg' })
  medium: string;

  @ApiProperty({ example: '/uploads/thumbnails/large/image.jpg' })
  large: string;
}

/**
 * DTO владельца (краткая информация)
 */
export class UploadUserDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;
}

/**
 * DTO доски (краткая информация)
 */
export class UploadBoardDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Nature Collection' })
  title: string;
}

/**
 * DTO ответа загрузки
 */
export class UploadResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: '/uploads/images/1704067200000-abc123.jpg' })
  url: string;

  @ApiProperty({ type: ThumbnailsDto })
  thumbnails: ThumbnailsDto;

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

  @ApiProperty({ example: 245760 })
  size: number;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', nullable: true })
  originalUrl?: string | null;

  @ApiProperty({ type: UploadUserDto })
  user: UploadUserDto;

  @ApiProperty({ type: UploadBoardDto, nullable: true })
  board: UploadBoardDto | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}
