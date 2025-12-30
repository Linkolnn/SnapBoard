import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters';
import { LoggingInterceptor } from './common/interceptors';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3001;
  const apiPrefix = configService.get<string>('apiPrefix') || 'api';
  const corsOrigin =
    configService.get<string>('cors.origin') || 'http://localhost:3000';
  const nodeEnv = configService.get<string>('nodeEnv') || 'development';

  // ==================== GLOBAL PREFIX ====================
  app.setGlobalPrefix(apiPrefix);

  // ==================== SECURITY: HELMET ====================
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:', '*'],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        },
      },
    }),
  );

  // ==================== SECURITY: CORS ====================
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ==================== SECURITY: RATE LIMITING ====================
  const generalRateLimit = configService.get('rateLimit.general');
  app.use(
    rateLimit({
      windowMs: generalRateLimit?.windowMs || 15 * 60 * 1000,
      max: generalRateLimit?.max || 100,
      message: {
        statusCode: 429,
        message: 'Слишком много запросов. Попробуйте позже.',
        error: 'Too Many Requests',
      },
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Auth endpoints rate limit
  const authRateLimit = configService.get('rateLimit.auth');
  app.use(
    `/${apiPrefix}/auth`,
    rateLimit({
      windowMs: authRateLimit?.windowMs || 60 * 60 * 1000,
      max: authRateLimit?.max || 10,
      message: {
        statusCode: 429,
        message: 'Слишком много попыток входа. Попробуйте через час.',
        error: 'Too Many Requests',
      },
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Upload endpoints rate limit
  const uploadRateLimit = configService.get('rateLimit.upload');
  app.use(
    `/${apiPrefix}/upload`,
    rateLimit({
      windowMs: uploadRateLimit?.windowMs || 60 * 60 * 1000,
      max: uploadRateLimit?.max || 50,
      message: {
        statusCode: 429,
        message: 'Превышен лимит загрузок. Попробуйте через час.',
        error: 'Too Many Requests',
      },
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // ==================== COOKIE PARSER ====================
  app.use(cookieParser());

  // ==================== VALIDATION PIPE ====================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          const constraints = error.constraints;
          return constraints
            ? Object.values(constraints).join(', ')
            : 'Validation error';
        });
        return new BadRequestException(messages);
      },
    }),
  );

  // ==================== GLOBAL FILTERS ====================
  app.useGlobalFilters(new HttpExceptionFilter());

  // ==================== GLOBAL INTERCEPTORS ====================
  if (nodeEnv === 'development') {
    app.useGlobalInterceptors(new LoggingInterceptor());
  }

  // ==================== STATIC FILES ====================
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // ==================== SWAGGER ====================
  const config = new DocumentBuilder()
    .setTitle('SnapBoard API')
    .setDescription('API для приложения SnapBoard')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .addTag('Auth', 'Аутентификация и авторизация')
    .addTag('Profile', 'Профиль пользователя')
    .addTag('Boards', 'Управление досками')
    .addTag('Images', 'Управление изображениями')
    .addTag('Upload', 'Загрузка файлов')
    .addTag('Favorites', 'Избранное')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  // ==================== START SERVER ====================
  await app.listen(port);

  logger.log(
    `🚀 Application is running on: http://localhost:${port}/${apiPrefix}`,
  );
  logger.log(`📚 Swagger docs: http://localhost:${port}/${apiPrefix}/docs`);
  logger.log(`📝 Environment: ${nodeEnv}`);
  logger.log(`🔒 CORS origin: ${corsOrigin}`);
  logger.log(
    `⏱️ Rate limits: General ${generalRateLimit?.max || 100}/15min, Auth ${authRateLimit?.max || 10}/hour, Upload ${uploadRateLimit?.max || 50}/hour`,
  );
}

bootstrap();
