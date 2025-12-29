# SnapBoard Backend - Поэтапный план разработки

## 📋 Обзор проекта

Backend для SnapBoard - визуальной доски вдохновения. Реализует REST API для управления пользователями, досками, изображениями и аутентификацией.

## 🛠️ Технологический стек

- **Node.js** - серверная платформа
- **NestJS** - веб-фреймворк
- **PostgreSQL** - реляционная база данных
- **TypeORM** - ORM для работы с БД
- **Sharp** - обработка изображений
- **JWT** - аутентификация (access + refresh tokens)
- **bcrypt** - хеширование паролей
- **Multer** - загрузка файлов
- **class-validator** - валидация данных
- **Docker** - контейнеризация

## 🏗️ Архитектура Backend

### Структура проекта
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
│   │   ├── filters/               # Exception filters
│   │   ├── guards/                # Auth guards
│   │   ├── interceptors/          # Interceptors
│   │   ├── pipes/                 # Validation pipes
│   │   └── dto/                   # Общие DTO
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── jwt-refresh.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── register.dto.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   └── dto/
│   │   │       ├── update-profile.dto.ts
│   │   │       └── change-password.dto.ts
│   │   ├── boards/
│   │   │   ├── boards.module.ts
│   │   │   ├── boards.controller.ts
│   │   │   ├── boards.service.ts
│   │   │   ├── entities/
│   │   │   │   └── board.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-board.dto.ts
│   │   │       └── update-board.dto.ts
│   │   ├── images/
│   │   │   ├── images.module.ts
│   │   │   ├── images.controller.ts
│   │   │   ├── images.service.ts
│   │   │   ├── entities/
│   │   │   │   └── image.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-image.dto.ts
│   │   │       └── update-image.dto.ts
│   │   ├── favorites/
│   │   │   ├── favorites.module.ts
│   │   │   ├── favorites.controller.ts
│   │   │   ├── favorites.service.ts
│   │   │   └── entities/
│   │   │       └── favorite.entity.ts
│   │   └── upload/
│   │       ├── upload.module.ts
│   │       ├── upload.controller.ts
│   │       ├── upload.service.ts
│   │       └── storage/
│   │           └── local.storage.ts
│   └── database/
│       ├── migrations/
│       └── seeds/
├── uploads/                       # Загруженные файлы
├── test/
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 📝 Этапы разработки

### Этап 1: Инициализация проекта и базовая настройка
**Цель**: Создать структуру NestJS проекта с базовой конфигурацией

**Задачи**:
- [ ] Инициализация NestJS проекта
- [ ] Настройка TypeScript
- [ ] Установка и настройка зависимостей
- [ ] Настройка ESLint и Prettier
- [ ] Создание базовой структуры папок
- [ ] Настройка переменных окружения (.env)
- [ ] Настройка конфигурационного модуля

**Зависимости для установки**:
```bash
# Core
@nestjs/config @nestjs/typeorm typeorm pg

# Auth & Security
@nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
helmet express-rate-limit

# Validation
class-validator class-transformer

# File upload & Image processing
multer sharp

# Types
@types/passport-jwt @types/bcrypt @types/multer
```

**Файлы конфигурации**:
- `src/config/configuration.ts` - основные настройки
- `src/config/database.config.ts` - подключение к PostgreSQL
- `src/config/jwt.config.ts` - настройки JWT токенов

---

### Этап 2: Настройка базы данных и TypeORM
**Цель**: Подключить PostgreSQL и настроить ORM

**Задачи**:
- [ ] Настройка подключения к PostgreSQL
- [ ] Создание базовых entities
- [ ] Настройка миграций
- [ ] Создание seed данных для разработки
- [ ] Docker Compose для PostgreSQL

**Схема базы данных**:

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    bio TEXT,
    avatar VARCHAR(500),
    refresh_token VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Boards
CREATE TABLE boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cover_image VARCHAR(500),
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Images
CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url VARCHAR(500) NOT NULL,
    title VARCHAR(200),
    description TEXT,
    board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tags TEXT[],
    width INTEGER,
    height INTEGER,
    size INTEGER,
    mime_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favorites (связь многие-ко-многим)
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    image_id UUID REFERENCES images(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, image_id)
);

-- Board Images (для сохранения чужих изображений на свои доски)
CREATE TABLE board_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
    image_id UUID REFERENCES images(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(board_id, image_id)
);

-- Indexes
CREATE INDEX idx_boards_user_id ON boards(user_id);
CREATE INDEX idx_images_board_id ON images(board_id);
CREATE INDEX idx_images_user_id ON images(user_id);
CREATE INDEX idx_images_tags ON images USING GIN(tags);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_board_images_board_id ON board_images(board_id);
```

---

### Этап 3: Модуль аутентификации (Auth)
**Цель**: Реализовать полную систему аутентификации с JWT

**Задачи**:
- [ ] Создание Auth модуля
- [ ] Регистрация пользователей
- [ ] Вход с выдачей access + refresh токенов
- [ ] Обновление access токена
- [ ] Выход (инвалидация refresh токена)
- [ ] Получение текущего пользователя
- [ ] JWT Strategy для Passport
- [ ] Auth Guard для защиты роутов

**API Endpoints**:
```
POST   /api/auth/register     - Регистрация
POST   /api/auth/login        - Вход
POST   /api/auth/refresh      - Обновление токена
POST   /api/auth/logout       - Выход
GET    /api/auth/me           - Текущий пользователь
```

**DTO**:
```typescript
// register.dto.ts
class RegisterDto {
  @IsEmail()
  email: string;
  
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;
  
  @IsString()
  @MinLength(6)
  password: string;
}

// login.dto.ts
class LoginDto {
  @IsEmail()
  email: string;
  
  @IsString()
  password: string;
}
```

**Логика токенов**:
- Access Token: 15 минут, хранится в cookie (httpOnly: false)
- Refresh Token: 7 дней, хранится в cookie (httpOnly: true) и в БД

---

### Этап 4: Модуль пользователей (Users)
**Цель**: CRUD операции для профиля пользователя

**Задачи**:
- [ ] Создание Users модуля
- [ ] User Entity с TypeORM
- [ ] Получение профиля
- [ ] Обновление профиля (имя, bio)
- [ ] Смена пароля
- [ ] Загрузка аватара
- [ ] Удаление аккаунта
- [ ] Статистика пользователя

**API Endpoints**:
```
GET    /api/profile           - Получить профиль
PUT    /api/profile           - Обновить профиль
PUT    /api/profile/password  - Сменить пароль
POST   /api/profile/avatar    - Загрузить аватар
DELETE /api/profile           - Удалить аккаунт
GET    /api/profile/stats     - Статистика
GET    /api/profile/boards    - Доски пользователя
GET    /api/profile/images    - Изображения пользователя
```

**DTO**:
```typescript
// update-profile.dto.ts
class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;
  
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bio?: string;
}

// change-password.dto.ts
class ChangePasswordDto {
  @IsString()
  currentPassword: string;
  
  @IsString()
  @MinLength(8)
  newPassword: string;
}
```

---

### Этап 5: Модуль досок (Boards)
**Цель**: CRUD операции для досок/коллекций

**Задачи**:
- [ ] Создание Boards модуля
- [ ] Board Entity
- [ ] Создание доски
- [ ] Получение списка досок (с пагинацией)
- [ ] Получение одной доски
- [ ] Обновление доски
- [ ] Удаление доски
- [ ] Приватность досок
- [ ] Автоматическое обновление cover_image

**API Endpoints**:
```
GET    /api/boards            - Список досок (публичные + свои)
POST   /api/boards            - Создать доску
GET    /api/boards/:id        - Получить доску
PUT    /api/boards/:id        - Обновить доску
DELETE /api/boards/:id        - Удалить доску
GET    /api/boards/:id/images - Изображения доски
POST   /api/boards/:id/images - Сохранить изображение на доску
DELETE /api/boards/:id/images - Удалить изображение с доски
```

**DTO**:
```typescript
// create-board.dto.ts
class CreateBoardDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;
  
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
  
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
```

---

### Этап 6: Модуль изображений (Images)
**Цель**: CRUD операции для изображений

**Задачи**:
- [ ] Создание Images модуля
- [ ] Image Entity
- [ ] Получение списка изображений (с пагинацией)
- [ ] Получение одного изображения
- [ ] Обновление метаданных
- [ ] Удаление изображения
- [ ] Поиск по тегам и названию
- [ ] Сортировка (newest, oldest, title)

**API Endpoints**:
```
GET    /api/images            - Список изображений (пагинация, поиск, фильтры)
GET    /api/images/:id        - Получить изображение
PUT    /api/images/:id        - Обновить метаданные
DELETE /api/images/:id        - Удалить изображение
```

**Query параметры для списка**:
```typescript
interface ImageQueryParams {
  page?: number;        // default: 1
  pageSize?: number;    // default: 12, max: 50
  boardId?: string;     // фильтр по доске
  query?: string;       // поиск по title/description
  tags?: string[];      // фильтр по тегам
  sortBy?: 'newest' | 'oldest' | 'title_asc' | 'title_desc';
}
```

**Формат ответа с пагинацией**:
```typescript
interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasMore: boolean;
}
```

---

### Этап 7: Модуль загрузки файлов (Upload)
**Цель**: Загрузка и обработка изображений

**Задачи**:
- [ ] Создание Upload модуля
- [ ] Настройка Multer для загрузки
- [ ] Валидация файлов (тип, размер)
- [ ] Обработка изображений с Sharp
- [ ] Генерация thumbnails
- [ ] Загрузка по URL
- [ ] Хранение файлов (локально / S3)
- [ ] Очистка неиспользуемых файлов

**API Endpoints**:
```
POST   /api/upload/file       - Загрузка файла
POST   /api/upload/url        - Загрузка по URL
DELETE /api/upload/:filename  - Удаление файла
```

**Конфигурация загрузки**:
```typescript
const uploadConfig = {
  maxFileSize: 10 * 1024 * 1024,  // 10MB
  maxFiles: 10,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  thumbnailSizes: {
    small: { width: 150, height: 150 },
    medium: { width: 400, height: 400 },
    large: { width: 800, height: 800 }
  }
};
```

**Обработка изображений (Sharp)**:
- Ресайз до максимального размера
- Генерация thumbnails
- Оптимизация качества
- Извлечение метаданных (width, height)
- Конвертация в WebP (опционально)

---

### Этап 8: Модуль избранного (Favorites)
**Цель**: Функционал добавления в избранное

**Задачи**:
- [ ] Создание Favorites модуля
- [ ] Favorite Entity
- [ ] Добавление в избранное
- [ ] Удаление из избранного
- [ ] Получение списка избранного
- [ ] Проверка статуса избранного

**API Endpoints**:
```
GET    /api/favorites         - Список избранного
POST   /api/favorites/:imageId - Добавить в избранное
DELETE /api/favorites/:imageId - Удалить из избранного
GET    /api/favorites/check   - Проверить статус (batch)
```

---

### Этап 9: Безопасность и защита
**Цель**: Настройка защиты API

**Задачи**:
- [ ] Helmet для HTTP заголовков
- [ ] Rate limiting (express-rate-limit)
- [ ] CORS настройка
- [ ] Валидация всех входных данных
- [ ] Санитизация данных
- [ ] Защита от SQL injection (TypeORM)
- [ ] Логирование запросов
- [ ] Error handling (глобальный exception filter)

**Конфигурация Rate Limiting**:
```typescript
// Общий лимит
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100 // 100 запросов
}));

// Лимит для auth endpoints
app.use('/api/auth', rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 10 // 10 попыток
}));

// Лимит для upload
app.use('/api/upload', rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 50 // 50 загрузок
}));
```

---

### Этап 10: Docker и деплой (Full Stack)
**Цель**: Контейнеризация всего проекта (Frontend + Backend + PostgreSQL)

**Задачи**:
- [ ] Dockerfile для backend (`backend/Dockerfile`)
- [ ] Dockerfile для frontend (`frontend/Dockerfile`)
- [ ] Docker Compose для всего проекта (корень репозитория)
- [ ] Настройка volumes для uploads
- [ ] Health check endpoints
- [ ] Nginx как reverse proxy (опционально)
- [ ] Переменные окружения для production
- [ ] Документация по деплою

**Структура Docker файлов**:
```
snapboard/
├── docker-compose.yml          # Главный compose файл
├── docker-compose.dev.yml      # Для разработки
├── .env.example                # Пример переменных окружения
├── frontend/
│   └── Dockerfile
├── backend/
│   └── Dockerfile
└── nginx/
    └── nginx.conf              # Конфигурация reverse proxy
```

**docker-compose.yml** (корень проекта):
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    container_name: snapboard-db
    environment:
      POSTGRES_USER: ${DB_USER:-snapboard}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-snapboard123}
      POSTGRES_DB: ${DB_NAME:-snapboard}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-snapboard}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - snapboard-network

  # NestJS Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: snapboard-backend
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_HOST: db
      DATABASE_PORT: 5432
      DATABASE_USER: ${DB_USER:-snapboard}
      DATABASE_PASSWORD: ${DB_PASSWORD:-snapboard123}
      DATABASE_NAME: ${DB_NAME:-snapboard}
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      CORS_ORIGIN: http://localhost:3000
    ports:
      - "3001:3001"
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - uploads_data:/app/uploads
    networks:
      - snapboard-network

  # Nuxt Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: snapboard-frontend
    environment:
      NODE_ENV: production
      NUXT_PUBLIC_API_BASE: http://backend:3001/api
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - snapboard-network

volumes:
  postgres_data:
  uploads_data:

networks:
  snapboard-network:
    driver: bridge
```

**backend/Dockerfile**:
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package files
COPY package*.json ./
RUN npm ci

# Копируем исходники и собираем
COPY . .
RUN npm run build

# Production image
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# Создаём папку для uploads
RUN mkdir -p /app/uploads

EXPOSE 3001

CMD ["node", "dist/main.js"]
```

**frontend/Dockerfile**:
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package files
COPY package*.json ./
RUN npm ci

# Копируем исходники и собираем
COPY . .
RUN npm run build

# Production image
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
```

**docker-compose.dev.yml** (для разработки с hot reload):
```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: snapboard-db-dev
    environment:
      POSTGRES_USER: snapboard
      POSTGRES_PASSWORD: snapboard123
      POSTGRES_DB: snapboard
    volumes:
      - postgres_data_dev:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - snapboard-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: snapboard-backend-dev
    environment:
      NODE_ENV: development
      DATABASE_HOST: db
      DATABASE_PORT: 5432
      DATABASE_USER: snapboard
      DATABASE_PASSWORD: snapboard123
      DATABASE_NAME: snapboard
    ports:
      - "3001:3001"
    depends_on:
      - db
    volumes:
      - ./backend:/app
      - /app/node_modules
      - uploads_data_dev:/app/uploads
    networks:
      - snapboard-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: snapboard-frontend-dev
    environment:
      NODE_ENV: development
      NUXT_PUBLIC_API_BASE: http://localhost:3001/api
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    networks:
      - snapboard-network

volumes:
  postgres_data_dev:
  uploads_data_dev:

networks:
  snapboard-network:
    driver: bridge
```

**Команды запуска**:
```bash
# Production
docker-compose up -d

# Development (с hot reload)
docker-compose -f docker-compose.dev.yml up

# Только база данных (для локальной разработки)
docker-compose up db -d

# Пересборка образов
docker-compose build --no-cache

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

---

### Этап 11: Тестирование
**Цель**: Покрытие кода тестами

**Задачи**:
- [ ] Unit тесты для сервисов
- [ ] E2E тесты для API endpoints
- [ ] Тесты аутентификации
- [ ] Тесты загрузки файлов
- [ ] Настройка тестовой БД
- [ ] CI/CD pipeline

---

### Этап 12: Документация API
**Цель**: Swagger документация

**Задачи**:
- [ ] Настройка @nestjs/swagger
- [ ] Документирование всех endpoints
- [ ] Описание DTO и responses
- [ ] Примеры запросов
- [ ] Авторизация в Swagger UI

---

## 📊 API Reference (Сводка)

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Регистрация | ❌ |
| POST | /api/auth/login | Вход | ❌ |
| POST | /api/auth/refresh | Обновление токена | 🔄 |
| POST | /api/auth/logout | Выход | ✅ |
| GET | /api/auth/me | Текущий пользователь | ✅ |

### Profile
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/profile | Получить профиль | ✅ |
| PUT | /api/profile | Обновить профиль | ✅ |
| PUT | /api/profile/password | Сменить пароль | ✅ |
| POST | /api/profile/avatar | Загрузить аватар | ✅ |
| DELETE | /api/profile | Удалить аккаунт | ✅ |
| GET | /api/profile/stats | Статистика | ✅ |
| GET | /api/profile/boards | Мои доски | ✅ |
| GET | /api/profile/images | Мои изображения | ✅ |

### Boards
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/boards | Список досок | ❌/✅ |
| POST | /api/boards | Создать доску | ✅ |
| GET | /api/boards/:id | Получить доску | ❌/✅ |
| PUT | /api/boards/:id | Обновить доску | ✅ |
| DELETE | /api/boards/:id | Удалить доску | ✅ |
| GET | /api/boards/:id/images | Изображения доски | ❌/✅ |
| POST | /api/boards/:id/images | Сохранить на доску | ✅ |
| DELETE | /api/boards/:id/images | Удалить с доски | ✅ |

### Images
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/images | Список изображений | ❌ |
| GET | /api/images/:id | Получить изображение | ❌ |
| PUT | /api/images/:id | Обновить метаданные | ✅ |
| DELETE | /api/images/:id | Удалить изображение | ✅ |

### Upload
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/upload/file | Загрузка файла | ✅ |
| POST | /api/upload/url | Загрузка по URL | ✅ |

### Favorites
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/favorites | Список избранного | ✅ |
| POST | /api/favorites/:imageId | Добавить в избранное | ✅ |
| DELETE | /api/favorites/:imageId | Удалить из избранного | ✅ |

---

## 🔐 Переменные окружения

**.env.example** (корень проекта):
```env
# ===================
# Database
# ===================
DB_USER=snapboard
DB_PASSWORD=snapboard123
DB_NAME=snapboard

# ===================
# JWT Secrets
# ===================
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# ===================
# App URLs (for production)
# ===================
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
```

**backend/.env** (для локальной разработки без Docker):
```env
# App
NODE_ENV=development
PORT=3001
API_PREFIX=api

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=snapboard
DATABASE_PASSWORD=snapboard123
DATABASE_NAME=snapboard

# JWT
JWT_ACCESS_SECRET=dev-access-secret-key
JWT_REFRESH_SECRET=dev-refresh-secret-key
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp,image/gif

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

**frontend/.env** (для локальной разработки):
```env
NUXT_PUBLIC_API_BASE=http://localhost:3001/api
```

---

## 🚀 Порядок выполнения

1. **Этап 1-2**: Базовая настройка и БД (2-3 дня)
2. **Этап 3-4**: Auth и Users (2-3 дня)
3. **Этап 5-6**: Boards и Images (3-4 дня)
4. **Этап 7**: Upload (2 дня)
5. **Этап 8**: Favorites (1 день)
6. **Этап 9**: Безопасность (1-2 дня)
7. **Этап 10**: Docker (1 день)
8. **Этап 11-12**: Тесты и документация (2-3 дня)

**Общая оценка**: 2-3 недели

---

## 📚 Рекомендации

1. **Начинайте с миграций** - сначала создайте схему БД
2. **Тестируйте каждый endpoint** - используйте Postman/Insomnia
3. **Логируйте всё** - это поможет при отладке
4. **Используйте транзакции** - для связанных операций
5. **Кэшируйте** - добавьте Redis для частых запросов (опционально)
