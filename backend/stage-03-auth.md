# Этап 3: Аутентификация и авторизация ✅

> **Статус:** Реализовано и протестировано
> 
> **Сервер:** http://localhost:3001/api
> 
> **Swagger:** http://localhost:3001/api/docs

---

## 🎯 Цель этапа

Реализовать полноценную систему аутентификации с JWT токенами (Access + Refresh), регистрацию, вход, выход и защиту маршрутов.

---

## 📚 Глоссарий (для frontend разработчиков)

### 🔐 Аутентификация vs Авторизация

**Аутентификация (Authentication)** — проверка "кто ты?". Пользователь доказывает свою личность (логин + пароль).

**Авторизация (Authorization)** — проверка "что тебе можно?". Система проверяет права доступа к ресурсу.

### 🎫 JWT (JSON Web Token)

**JWT** — это зашифрованная строка с информацией о пользователе. Сервер создаёт токен при входе, клиент отправляет его с каждым запросом.

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
│                                      │                              │
└── Header (алгоритм)                  └── Payload (данные)           └── Signature (подпись)
```

### 🔄 Access Token vs Refresh Token

| Характеристика | Access Token | Refresh Token |
|----------------|--------------|---------------|
| **Назначение** | Доступ к API | Получение нового Access Token |
| **Время жизни** | 15 минут (900 сек) | 7 дней (604800 сек) |
| **Хранение** | httpOnly cookie | httpOnly cookie |
| **Передача** | С каждым запросом | Только на /auth/refresh |

### 🍪 httpOnly Cookie

**httpOnly** — флаг cookie, запрещающий доступ из JavaScript. Защита от XSS-атак.

```
Set-Cookie: access_token=eyJ...; HttpOnly; Secure; SameSite=Lax
```

### 🛡️ Guards (Охранники)

**Guard** — класс, который решает, пропустить запрос или отклонить. Проверяет токен перед выполнением контроллера.


### 🎨 Decorators (Декораторы)

**Декоратор** — функция, добавляющая метаданные или поведение. В NestJS используются для маршрутов, параметров, guards.

```typescript
@Public()           // Маршрут доступен без авторизации
@UseGuards(...)     // Применить guard
@CurrentUser()      // Извлечь пользователя из request
```

### 📋 DTO (Data Transfer Object)

**DTO** — объект для передачи данных между слоями. Определяет структуру входящих данных и правила валидации.

---

## 📁 Структура файлов

```
backend/src/modules/
├── auth/
│   ├── auth.module.ts           # Модуль аутентификации
│   ├── auth.controller.ts       # API endpoints
│   ├── auth.service.ts          # Бизнес-логика
│   ├── dto/
│   │   ├── index.ts             # Экспорт всех DTO
│   │   ├── register.dto.ts      # DTO регистрации
│   │   ├── login.dto.ts         # DTO входа
│   │   ├── auth-response.dto.ts # DTO ответа
│   │   └── user-response.dto.ts # DTO пользователя
│   ├── strategies/
│   │   ├── jwt.strategy.ts      # Стратегия Access Token
│   │   └── jwt-refresh.strategy.ts # Стратегия Refresh Token
│   ├── guards/
│   │   ├── jwt-auth.guard.ts    # Guard для Access Token
│   │   └── jwt-refresh.guard.ts # Guard для Refresh Token
│   ├── decorators/
│   │   ├── current-user.decorator.ts # @CurrentUser()
│   │   └── public.decorator.ts       # @Public()
│   └── interfaces/
│       └── jwt-payload.interface.ts  # Типы JWT payload
└── users/
    ├── users.module.ts          # Модуль пользователей
    ├── users.service.ts         # Сервис пользователей
    └── entities/
        └── user.entity.ts       # Entity пользователя
```

---

## 🔧 Конфигурация

### Переменные окружения (.env)

```env
# JWT Configuration (время в СЕКУНДАХ)
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRES_IN=900       # 15 минут
JWT_REFRESH_EXPIRES_IN=604800   # 7 дней
```

> ⚠️ **Важно:** В `@nestjs/jwt` v11 параметр `expiresIn` должен быть числом (секунды), а не строкой типа `'15m'`. Это позволяет избежать использования `as any`.


### configuration.ts

```typescript
// backend/src/config/configuration.ts
export default () => ({
  // ... другие настройки
  
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    // Время жизни токенов в секундах (числа, не строки!)
    accessExpiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES_IN || '900', 10),   // 15 минут
    refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800', 10), // 7 дней
  },
});
```

---

## 📝 API Endpoints

### POST /api/auth/register

Регистрация нового пользователя.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "Password123!",
  "name": "John Doe"  // опционально
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "name": "John Doe",
    "bio": null,
    "avatar": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "eyJ...",
  "message": "Регистрация успешна"
}
```

**Cookies (устанавливаются автоматически):**
- `access_token` — httpOnly, 15 минут
- `refresh_token` — httpOnly, 7 дней

---

### POST /api/auth/login

Вход в систему.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "user": { ... },
  "accessToken": "eyJ...",
  "message": "Вход выполнен успешно"
}
```

---

### POST /api/auth/logout

Выход из системы. Требует авторизации.

**Headers:** `Cookie: access_token=...` или `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Выход выполнен успешно"
}
```

---

### POST /api/auth/refresh

Обновление токенов. Использует refresh_token из cookie.

**Headers:** `Cookie: refresh_token=...`

**Response (200):**
```json
{
  "accessToken": "eyJ...",
  "message": "Токены обновлены"
}
```

---

### GET /api/auth/me

Получение данных текущего пользователя.

**Headers:** `Cookie: access_token=...` или `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "johndoe",
  "name": "John Doe",
  "bio": null,
  "avatar": null,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 💻 Реализация


### auth.module.ts

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.accessSecret') || 'fallback-secret',
        signOptions: {
          // Число в секундах — без as any!
          expiresIn: configService.get<number>('jwt.accessExpiresIn') || 900,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

---

### auth.service.ts

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

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

  async logout(userId: string, res: Response) {
    await this.usersService.updateRefreshToken(userId, null);
    this.clearTokenCookies(res);
    return { message: 'Выход выполнен успешно' };
  }

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

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return this.sanitizeUser(user);
  }

  // ==================== PRIVATE METHODS ====================

  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.accessSecret'),
        // Число в секундах — без as any!
        expiresIn: this.configService.get<number>('jwt.accessExpiresIn') || 900,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        // Число в секундах — без as any!
        expiresIn: this.configService.get<number>('jwt.refreshExpiresIn') || 604800,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private setTokenCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 минут в миллисекундах
      path: '/',
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней в миллисекундах
      path: '/',
    });
  }

  private clearTokenCookies(res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
  }

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
```


---

### auth.controller.ts

```typescript
import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto, UserResponseDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Данные пользователя', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getMe(@CurrentUser('userId') userId: string) {
    return this.authService.getMe(userId);
  }
}
```

---

### JWT Strategies

#### jwt.strategy.ts (Access Token)

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const secret = configService.get<string>('jwt.accessSecret');
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not defined');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Извлечение из httpOnly cookie
        (request: Request) => request?.cookies?.access_token || null,
        // Fallback: из заголовка Authorization: Bearer <token>
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      username: payload.username,
    };
  }
}
```


#### jwt-refresh.strategy.ts (Refresh Token)

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service';

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
        (request: Request) => request?.cookies?.refresh_token || null,
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    } as any);
  }

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
```

> ⚠️ **Примечание:** В `jwt-refresh.strategy.ts` используется `as any` для опции `passReqToCallback`, так как типы `passport-jwt` не полностью совместимы с NestJS. Это единственное место, где `as any` необходим.

---

### Guards

#### jwt-auth.guard.ts

```typescript
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

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
```

#### jwt-refresh.guard.ts

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
```

---

### Decorators

#### current-user.decorator.ts

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
```

**Использование:**
```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: JwtPayload) {
  return user;
}

// Или конкретное поле
@Get('my-id')
getMyId(@CurrentUser('userId') userId: string) {
  return userId;
}
```


#### public.decorator.ts

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

---

### DTOs

#### register.dto.ts

```typescript
import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Некорректный формат email' })
  email: string;

  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @MinLength(3, { message: 'Username должен быть минимум 3 символа' })
  @MaxLength(30, { message: 'Username должен быть максимум 30 символов' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username может содержать только буквы, цифры и _',
  })
  username: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(6, { message: 'Пароль должен быть минимум 6 символов' })
  @MaxLength(100, { message: 'Пароль слишком длинный' })
  password: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
```

#### login.dto.ts

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Некорректный формат email' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(1, { message: 'Пароль обязателен' })
  password: string;
}
```

---

### Interfaces

#### jwt-payload.interface.ts

```typescript
export interface JwtPayload {
  sub: string;      // User ID
  email: string;
  username: string;
}

export interface JwtPayloadWithTimestamps extends JwtPayload {
  iat: number;  // Issued At (Unix timestamp)
  exp: number;  // Expiration (Unix timestamp)
}
```

---

### users.service.ts

```typescript
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(registerDto: RegisterDto): Promise<User> {
    const existingByEmail = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });
    
    if (existingByEmail) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const existingByUsername = await this.usersRepository.findOne({
      where: { username: registerDto.username },
    });
    
    if (existingByUsername) {
      throw new ConflictException('Пользователь с таким username уже существует');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = this.usersRepository.create({
      email: registerDto.email,
      username: registerDto.username,
      passwordHash,
      name: registerDto.name ?? null,
    });

    return await this.usersRepository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken: refreshToken ?? undefined });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}
```


---

## 🧪 Тестирование

### Через Swagger UI

Откройте http://localhost:3001/api/docs

### Через curl

```bash
# Регистрация
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"test123"}' \
  -c cookies.txt

# Вход
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Получение текущего пользователя
curl http://localhost:3001/api/auth/me \
  -b cookies.txt

# Обновление токенов
curl -X POST http://localhost:3001/api/auth/refresh \
  -b cookies.txt \
  -c cookies.txt

# Выход
curl -X POST http://localhost:3001/api/auth/logout \
  -b cookies.txt
```

---

## 🔄 Схема работы токенов

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           РЕГИСТРАЦИЯ / ВХОД                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Frontend                          Backend                              │
│  ─────────                         ───────                              │
│                                                                         │
│  POST /auth/login ──────────────►  Проверка email/password              │
│  { email, password }               │                                    │
│                                    ▼                                    │
│                                    Генерация токенов                    │
│                                    │                                    │
│                                    ▼                                    │
│  ◄──────────────────────────────── Set-Cookie: access_token             │
│  { user, accessToken }             Set-Cookie: refresh_token            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         ЗАЩИЩЁННЫЙ ЗАПРОС                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Frontend                          Backend                              │
│  ─────────                         ───────                              │
│                                                                         │
│  GET /api/images ───────────────►  JwtAuthGuard                         │
│  Cookie: access_token              │                                    │
│                                    ▼                                    │
│                                    JwtStrategy.validate()               │
│                                    │                                    │
│                                    ▼                                    │
│  ◄──────────────────────────────── Данные или 401 Unauthorized          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         ОБНОВЛЕНИЕ ТОКЕНОВ                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Frontend                          Backend                              │
│  ─────────                         ───────                              │
│                                                                         │
│  (Access token истёк)                                                   │
│                                                                         │
│  POST /auth/refresh ────────────►  JwtRefreshGuard                      │
│  Cookie: refresh_token             │                                    │
│                                    ▼                                    │
│                                    Проверка refresh_token в БД          │
│                                    │                                    │
│                                    ▼                                    │
│  ◄──────────────────────────────── Новые токены в cookies               │
│  { accessToken }                                                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Важные замечания

### @nestjs/jwt v11 и expiresIn

В версии 11 библиотеки `@nestjs/jwt` параметр `expiresIn` должен быть **числом в секундах**, а не строкой:

```typescript
// ❌ Старый способ (требует as any в v11)
expiresIn: '15m'

// ✅ Правильный способ
expiresIn: 900  // 15 минут в секундах
```

### Безопасность

1. **Секреты** — используйте длинные случайные строки в production
2. **HTTPS** — в production cookies должны иметь `secure: true`
3. **Refresh Token Rotation** — при каждом refresh старый токен инвалидируется
4. **httpOnly cookies** — защита от XSS-атак

---

## ✅ Чеклист

- [x] Модуль аутентификации создан
- [x] JWT стратегии настроены
- [x] Guards реализованы
- [x] Декораторы созданы
- [x] DTOs с валидацией
- [x] Swagger документация
- [x] Тестирование через curl/Swagger
- [x] Типизация без `as any` (кроме passReqToCallback)
