import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Декоратор @CurrentUser() — извлекает текущего пользователя из request
 * 
 * @example
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: JwtPayload) {
 *   return user;
 * }
 * 
 * // Можно извлечь конкретное поле
 * @Get('my-id')
 * getMyId(@CurrentUser('userId') userId: string) {
 *   return userId;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
