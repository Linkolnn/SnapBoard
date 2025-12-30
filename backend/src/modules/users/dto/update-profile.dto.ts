import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для обновления профиля
 */
export class UpdateProfileDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Отображаемое имя (2-100 символов)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Имя должно быть минимум 2 символа' })
  @MaxLength(100, { message: 'Имя должно быть максимум 100 символов' })
  name?: string;

  @ApiProperty({
    example: 'Frontend developer from Moscow',
    description: 'Описание профиля (до 500 символов)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Bio должно быть максимум 500 символов' })
  bio?: string;
}
