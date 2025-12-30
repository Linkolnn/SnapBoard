import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для удаления аккаунта
 */
export class DeleteAccountDto {
  @ApiProperty({
    example: 'currentPassword123',
    description: 'Текущий пароль для подтверждения',
  })
  @IsString()
  @MinLength(1, { message: 'Пароль обязателен' })
  password: string;
}
