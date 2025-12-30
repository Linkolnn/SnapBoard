import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для ответа с данными пользователя
 */
export class UserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: 'John Doe', nullable: true })
  name: string | null;

  @ApiProperty({ example: null, nullable: true })
  avatar: string | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}

/**
 * DTO для ответа аутентификации
 */
export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Access Token (также устанавливается в cookie)',
  })
  accessToken: string;

  @ApiProperty({
    example: 'Успешный вход',
    description: 'Сообщение о результате операции',
  })
  message: string;
}
