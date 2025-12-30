# Этап 1: Инициализация проекта и базовая настройка

## 🎯 Цель этапа
Создать структуру NestJS проекта с базовой конфигурацией, установить все необходимые зависимости и настроить окружение разработки.

---

## 📋 Чеклист этапа
- [x] Инициализация NestJS проекта
- [x] Настройка TypeScript
- [x] Установка и настройка зависимостей
- [x] Настройка ESLint и Prettier
- [x] Создание базовой структуры папок
- [x] Настройка переменных окружения (.env)
- [x] Настройка конфигурационного модуля
- [x] Создание базовых common компонентов

---

## 1️⃣ Инициализация проекта

### Создание NestJS проекта

```bash
# Установка NestJS CLI глобально
npm i -g @nestjs/cli

# Создание нового проекта
nest new backend

# Переход в папку проекта
cd backend
```

---

## 2️⃣ Установка зависимостей

### Core зависимости

```bash
# Конфигурация и база данных
npm install @nestjs/config @nestjs/typeorm typeorm pg

# Аутентификация и безопасность
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install helmet express-rate-limit cookie-parser

# Валидация
npm install class-validator class-transformer

# Загрузка файлов и обработка изображений
npm install multer sharp

# Types (devDependencies)
npm install -D @types/passport-jwt @types/bcrypt @types/multer @types/cookie-parser
```

---

## 3️⃣ Структура папок

```
backend/
├── src/
│   ├── main.ts                    # Точка входа
│   ├── app.module.ts              # Корневой модуль
│   ├── config/
│   │   ├── configuration.ts       # Конфигурация приложения
│   │   ├── database.config.ts     # Конфигурация БД
│   │   └── jwt.config.ts          # Конфигурация JWT
│   ├── common/
│   │   ├── decorators/            # Кастомные декораторы
│   │   │   └── current-user.decorator.ts
│   │   ├── filters/               # Exception filters
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/                # Auth guards
│   │   ├── interceptors/          # Interceptors
│   │   │   └── transform.interceptor.ts
│   │   ├── pipes/                 # Validation pipes
│   │   └── dto/                   # Общие DTO
│   │       └── pagination.dto.ts
│   ├── modules/                   # Модули приложения
│   │   ├── auth/
│   │   ├── users/
│   │   ├── boards/
│   │   ├── images/
│   │   ├── favorites/
│   │   └── upload/
│   └── database/
│       ├── migrations/
│       └── seeds/
├── uploads/                       # Загруженные файлы
├── test/
├── .env
├── .env.example
└── package.json
```

---

## 4️⃣ Конфигурация приложения

### Файл: `src/config/configuration.ts`

```typescript
/**
 * Главный конфигурационный файл приложения
 * Загружает все настройки из переменных окружения
 */
export default () => ({
  // Настройки приложения
  app: {
    port: parseInt(process.env.PORT, 10) || 3001,
    apiPrefix: process.env.API_PREFIX || 'api',
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  
  // Настройки базы данных
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USER || 'snapboard',
    password: process.env.DATABASE_PASSWORD || 'snapboard123',
    name: process.env.DATABASE_NAME || 'snapboard',
  },
  
  // Настройки JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  },
  
  // Настройки загрузки файлов
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(','),
  },
  
  // Настройки CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  
  // Настройки Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15 * 60 * 1000, // 15 минут
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
});
```

### Файл: `src/config/database.config.ts`

```typescript
import { registerAs } from '@nestjs/config';

/**
 * Конфигурация подключения к PostgreSQL
 * Используется TypeORM для работы с базой данных
 */
export default registerAs('database', () => ({
  type: 'postgres' as const,
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USER || 'snapboard',
  password: process.env.DATABASE_PASSWORD || 'snapboard123',
  database: process.env.DATABASE_NAME || 'snapboard',
  
  // Автоматическая синхронизация схемы (только для разработки!)
  synchronize: process.env.NODE_ENV === 'development',
  
  // Логирование SQL запросов
  logging: process.env.NODE_ENV === 'development',
  
  // Путь к entities
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  
  // Путь к миграциям
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  
  // Автозапуск миграций
  migrationsRun: false,
}));
```

### Файл: `src/config/jwt.config.ts`

```typescript
import { registerAs } from '@nestjs/config';

/**
 * Конфигурация JWT токенов
 * Access token - короткоживущий (15 минут)
 * Refresh token - долгоживущий (7 дней)
 */
export default registerAs('jwt', () => ({
  // Access Token
  accessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret-key',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  
  // Refresh Token
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  
  // Cookie настройки
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  },
}));
```

---

## 5️⃣ Точка входа приложения

### Файл: `src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Получаем настройки из конфигурации
  const port = configService.get<number>('app.port');
  const apiPrefix = configService.get<string>('app.apiPrefix');
  const corsOrigin = configService.get<string>('cors.origin');
  
  // Глобальный префикс API
  app.setGlobalPrefix(apiPrefix);
  
  // Безопасность: Helmet для HTTP заголовков
  app.use(helmet());
  
  // Парсинг cookies
  app.use(cookieParser());
  
  // CORS настройка
  app.enableCors({
    origin: corsOrigin,
    credentials: true, // Важно для cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Глобальная валидация DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Удаляет неизвестные поля
      forbidNonWhitelisted: true, // Ошибка при неизвестных полях
      transform: true,           // Автоматическое преобразование типов
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // Глобальный фильтр исключений
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Глобальный interceptor для трансформации ответов
  app.useGlobalInterceptors(new TransformInterceptor());
  
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
}

bootstrap();
```

---

## 6️⃣ Корневой модуль

### Файл: `src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    // Конфигурация приложения
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration, databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),
    
    // Подключение к базе данных
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('app.nodeEnv') === 'development',
        logging: configService.get('app.nodeEnv') === 'development',
      }),
      inject: [ConfigService],
    }),
    
    // Модули приложения будут добавлены здесь
    // AuthModule,
    // UsersModule,
    // BoardsModule,
    // ImagesModule,
    // FavoritesModule,
    // UploadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

---

## 7️⃣ Common компоненты

### Файл: `src/common/filters/http-exception.filter.ts`

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Глобальный фильтр исключений
 * Форматирует все ошибки в единый формат ответа
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    // Определяем статус код
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    
    // Получаем сообщение об ошибке
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
      }
    }
    
    // Формируем ответ
    response.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      error,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Файл: `src/common/interceptors/transform.interceptor.ts`

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Интерфейс стандартного ответа API
 */
export interface Response<T> {
  data: T;
  timestamp: string;
}

/**
 * Interceptor для трансформации всех ответов
 * Оборачивает данные в стандартный формат
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

### Файл: `src/common/dto/pagination.dto.ts`

```typescript
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO для пагинации
 * Используется во всех списковых endpoints
 */
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number = 12;
}

/**
 * Интерфейс пагинированного ответа
 */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Хелпер для создания пагинированного ответа
 */
export function createPaginatedResponse<T>(
  items: T[],
  totalItems: number,
  page: number,
  pageSize: number,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages,
    hasMore: page < totalPages,
  };
}
```

### Файл: `src/common/decorators/current-user.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Декоратор для получения текущего пользователя из request
 * Используется в контроллерах для доступа к данным авторизованного пользователя
 * 
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    // Если указано конкретное поле - возвращаем его
    return data ? user?.[data] : user;
  },
);
```

---

## 8️⃣ Переменные окружения

### Файл: `.env.example`

```env
# ===================
# App
# ===================
NODE_ENV=development
PORT=3001
API_PREFIX=api

# ===================
# Database
# ===================
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=snapboard
DATABASE_PASSWORD=snapboard123
DATABASE_NAME=snapboard

# ===================
# JWT
# ===================
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# ===================
# Upload
# ===================
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp,image/gif

# ===================
# CORS
# ===================
CORS_ORIGIN=http://localhost:3000

# ===================
# Rate Limiting
# ===================
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### Файл: `.env` (копия для разработки)

```env
NODE_ENV=development
PORT=3001
API_PREFIX=api

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=snapboard
DATABASE_PASSWORD=snapboard123
DATABASE_NAME=snapboard

JWT_ACCESS_SECRET=dev-access-secret-key
JWT_REFRESH_SECRET=dev-refresh-secret-key
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp,image/gif

CORS_ORIGIN=http://localhost:3000

RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

---

## ✅ Результат этапа

После завершения этапа у вас будут:

1. ✅ Инициализированный NestJS проект
2. ✅ Установлены все необходимые зависимости
3. ✅ Настроена конфигурация через @nestjs/config
4. ✅ Созданы базовые common компоненты (filters, interceptors, decorators, dto)
5. ✅ Настроены переменные окружения
6. ✅ Готова структура папок для модулей

---

## 🚀 Запуск проекта

```bash
# Режим разработки
npm run start:dev

# Production сборка
npm run build
npm run start:prod
```

---

## 📝 Следующий этап

**Этап 2: Настройка базы данных и TypeORM** - создание entities, миграций и подключение PostgreSQL.
