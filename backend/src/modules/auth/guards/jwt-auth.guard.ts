import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Guard для защиты маршрутов с помощью JWT
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Определяет, можно ли выполнить запрос
   */
  canActivate(context: ExecutionContext) {
    // Проверяем, помечен ли маршрут как публичный (@Public())
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  /**
   * Обрабатывает результат аутентификации
   */
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Токен истёк');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Недействительный токен');
      }
      throw new UnauthorizedException('Требуется авторизация');
    }
    
    return user;
  }
}
