import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto, UserResponseDto, ForgotPasswordDto, ResetPasswordDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';

/**
 * Контроллер аутентификации
 * 
 * API Endpoints:
 * POST /api/auth/register — регистрация
 * POST /api/auth/login — вход
 * POST /api/auth/logout — выход
 * POST /api/auth/refresh — обновление токенов
 * GET  /api/auth/me — получение текущего пользователя
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Регистрация нового пользователя
   */
  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь создан', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'Email или username уже занят' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(registerDto, res);
  }

  /**
   * Вход в систему
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiResponse({ status: 200, description: 'Успешный вход', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Неверный email или пароль' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(loginDto, res);
  }


  /**
   * Выход из системы
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Выход из системы' })
  @ApiResponse({ status: 200, description: 'Успешный выход' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async logout(
    @CurrentUser('userId') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(userId, res);
  }

  /**
   * Обновление токенов
   */
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновление токенов' })
  @ApiResponse({ status: 200, description: 'Токены обновлены' })
  @ApiResponse({ status: 401, description: 'Недействительный refresh token' })
  async refresh(
    @CurrentUser('userId') userId: string,
    @CurrentUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshTokens(userId, refreshToken, res);
  }

  /**
   * Получение данных текущего пользователя
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Данные пользователя', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getMe(@CurrentUser('userId') userId: string) {
    return this.authService.getMe(userId);
  }

  /**
   * Запрос сброса пароля
   */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Запрос сброса пароля' })
  @ApiResponse({ status: 200, description: 'Инструкции отправлены (если email существует)' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  /**
   * Проверка токена сброса пароля
   */
  @Public()
  @Get('verify-reset-token')
  @ApiOperation({ summary: 'Проверка токена сброса пароля' })
  @ApiResponse({ status: 200, description: 'Токен действителен' })
  async verifyResetToken(@Query('token') token: string) {
    return this.authService.verifyResetToken(token);
  }

  /**
   * Сброс пароля по токену
   */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Сброс пароля по токену' })
  @ApiResponse({ status: 200, description: 'Пароль успешно изменён' })
  @ApiResponse({ status: 400, description: 'Недействительный или истёкший токен' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
  }
}
