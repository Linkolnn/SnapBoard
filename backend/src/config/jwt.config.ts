import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (configService: ConfigService): JwtModuleOptions => ({
  secret: configService.get<string>('jwt.accessSecret'),
  signOptions: {
    expiresIn: configService.get('jwt.accessExpiresIn'),
  },
});

export const JWT_ACCESS_TOKEN_COOKIE = 'access_token';
export const JWT_REFRESH_TOKEN_COOKIE = 'refresh_token';
