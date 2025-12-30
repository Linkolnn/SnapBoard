import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service';

/**
 * JWT Refresh Strategy для проверки Refresh Token
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const secret = configService.get<string>('jwt.refreshSecret');
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.refresh_token || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    } as any);
  }

  /**
   * Проверяет refresh token
   */
  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.cookies?.refresh_token;
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token не найден');
    }

    const user = await this.usersService.findById(payload.sub);
    
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Недействительный refresh token');
    }

    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Refresh token не совпадает');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      username: payload.username,
      refreshToken,
    };
  }
}
