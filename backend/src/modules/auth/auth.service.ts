import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';

/**
 * Сервис аутентификации
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Регистрация нового пользователя
   */
  async register(registerDto: RegisterDto, res: Response) {
    const user = await this.usersService.create(registerDto);
    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    this.setTokenCookies(res, tokens);

    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      message: 'Регистрация успешна',
    };
  }

  /**
   * Вход в систему
   */
  async login(loginDto: LoginDto, res: Response) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      user,
      loginDto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    this.setTokenCookies(res, tokens);

    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      message: 'Вход выполнен успешно',
    };
  }


  /**
   * Выход из системы
   */
  async logout(userId: string, res: Response) {
    await this.usersService.updateRefreshToken(userId, null);
    this.clearTokenCookies(res);
    return { message: 'Выход выполнен успешно' };
  }

  /**
   * Обновление токенов
   */
  async refreshTokens(userId: string, refreshToken: string, res: Response) {
    const user = await this.usersService.findById(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Доступ запрещён');
    }

    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Недействительный refresh token');
    }

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    this.setTokenCookies(res, tokens);

    return {
      accessToken: tokens.accessToken,
      message: 'Токены обновлены',
    };
  }

  /**
   * Получение текущего пользователя
   */
  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return this.sanitizeUser(user);
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Генерация пары токенов (access + refresh)
   */
  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: this.configService.get<number>('jwt.accessExpiresIn') || 900, // 15 минут в секундах
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<number>('jwt.refreshExpiresIn') || 604800, // 7 дней в секундах
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Установка токенов в httpOnly cookies
   */
  private setTokenCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 минут
      path: '/',
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      path: '/',
    });
  }

  /**
   * Очистка cookies при выходе
   */
  private clearTokenCookies(res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
  }

  /**
   * Удаление чувствительных данных из объекта пользователя
   */
  private sanitizeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  }
}
