import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для входа в систему
 */
export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail({}, { message: 'Некорректный формат email' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Пароль пользователя',
  })
  @IsString()
  @MinLength(1, { message: 'Пароль обязателен' })
  password: string;
}
