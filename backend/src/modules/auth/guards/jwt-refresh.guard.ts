import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard для проверки Refresh Token
 * Используется только на endpoint /auth/refresh
 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
