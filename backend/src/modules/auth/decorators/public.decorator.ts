import { SetMetadata } from '@nestjs/common';

/**
 * Ключ для метаданных публичного маршрута
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Декоратор @Public() — помечает маршрут как публичный
 * Используется когда JwtAuthGuard установлен глобально
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
