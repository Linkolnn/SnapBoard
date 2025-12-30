import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для регистрации нового пользователя
 */
export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя (уникальный)',
  })
  @IsEmail({}, { message: 'Некорректный формат email' })
  email: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'Имя пользователя (уникальное, 3-30 символов)',
  })
  @IsString()
  @MinLength(3, { message: 'Username должен быть минимум 3 символа' })
  @MaxLength(30, { message: 'Username должен быть максимум 30 символов' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username может содержать только буквы, цифры и _',
  })
  username: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Пароль (минимум 6 символов)',
  })
  @IsString()
  @MinLength(6, { message: 'Пароль должен быть минимум 6 символов' })
  @MaxLength(100, { message: 'Пароль слишком длинный' })
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Отображаемое имя (опционально)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
