import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO для query параметров рекомендаций
 */
export class RecommendationsQueryDto {
  @ApiProperty({
    example: 12,
    description: 'Количество рекомендаций (max: 50)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 12;
}

/**
 * DTO пользователя (краткая информация)
 */
export class RecommendationUserDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: '/uploads/avatars/avatar.jpg', nullable: true })
  avatar: string | null;
}

/**
 * DTO рекомендуемого изображения
 */
export class RecommendedImageDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: '/uploads/images/image.jpg' })
  url: string;

  @ApiProperty({ example: 'Similar Sunset', nullable: true })
  title: string | null;

  @ApiProperty({ example: 'Another beautiful sunset', nullable: true })
  description: string | null;

  @ApiProperty({ example: ['nature', 'sunset'], nullable: true })
  tags: string[] | null;

  @ApiProperty({ example: 1920 })
  width: number;

  @ApiProperty({ example: 1080 })
  height: number;

  @ApiProperty({ example: false })
  isFavorite: boolean;

  @ApiProperty({ example: 15 })
  favoritesCount: number;

  @ApiProperty({ example: 5, description: 'Оценка релевантности' })
  score: number;

  @ApiProperty({ example: ['nature', 'sunset'], description: 'Совпавшие теги' })
  matchedTags: string[];

  @ApiProperty({ type: RecommendationUserDto })
  user: RecommendationUserDto;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}

/**
 * DTO исходного изображения (краткая информация)
 */
export class SourceImageDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Original Sunset', nullable: true })
  title: string | null;

  @ApiProperty({ example: ['nature', 'sunset', 'ocean'] })
  tags: string[];
}

/**
 * DTO ответа рекомендаций
 */
export class RecommendationsResponseDto {
  @ApiProperty({ type: [RecommendedImageDto] })
  items: RecommendedImageDto[];

  @ApiProperty({ type: SourceImageDto })
  sourceImage: SourceImageDto;

  @ApiProperty({ example: 25, description: 'Общее количество найденных совпадений' })
  totalMatches: number;
}
