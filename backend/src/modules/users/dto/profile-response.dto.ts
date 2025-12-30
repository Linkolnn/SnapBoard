import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO ответа профиля
 */
export class ProfileResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: 'John Doe', nullable: true })
  name: string | null;

  @ApiProperty({ example: 'Frontend developer', nullable: true })
  bio: string | null;

  @ApiProperty({ example: '/uploads/avatars/uuid.jpg', nullable: true })
  avatar: string | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}
