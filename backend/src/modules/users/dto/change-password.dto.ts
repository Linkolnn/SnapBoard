import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для смены пароля
 */
export class ChangePasswordDto {
  @ApiProperty({
    example: 'oldPassword123',
    description: 'Текущий пароль',
  })
  @IsString()
  @MinLength(1, { message: 'Текущий пароль обязателен' })
  currentPassword: string;

  @ApiProperty({
    example: 'newPassword456',
    description: 'Новый пароль (минимум 6 символов)',
  })
  @IsString()
  @MinLength(6, { message: 'Новый пароль должен быть минимум 6 символов' })
  @MaxLength(100, { message: 'Пароль слишком длинный' })
  newPassword: string;
}
