import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для сброса пароля
 */
export class ResetPasswordDto {
  @ApiProperty({
    description: 'Токен сброса пароля',
    example: 'abc123def456...',
  })
  @IsString({ message: 'Токен должен быть строкой' })
  @IsNotEmpty({ message: 'Токен обязателен' })
  token: string;

  @ApiProperty({
    description: 'Новый пароль',
    example: 'newPassword123',
    minLength: 6,
  })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;
}
