# Этап 11: Docker и деплой (Full Stack)

> **Статус:** В разработке
> 
> **Зависимости:** Все предыдущие этапы ✅
> 
> **Цель:** Контейнеризация всего проекта (Frontend + Backend + PostgreSQL)

---

## 🎯 Цель этапа

Создать полноценную Docker-инфраструктуру для развёртывания SnapBoard:
- Dockerfile для NestJS backend
- Dockerfile для Nuxt frontend
- Docker Compose для оркестрации всех сервисов
- Настройка volumes для персистентности данных
- Health check endpoints для мониторинга
- Переменные окружения для production

---

## 📚 Глоссарий

### 🐳 Docker

**Docker** — платформа для контейнеризации приложений. Позволяет упаковать приложение со всеми зависимостями в изолированный контейнер.

### 📦 Docker Image

**Docker Image** — неизменяемый шаблон для создания контейнеров. Содержит код приложения, runtime, библиотеки и настройки.

### 🏃 Docker Container

**Docker Container** — запущенный экземпляр Docker Image. Изолированная среда выполнения приложения.

### 🎼 Docker Compose

**Docker Compose** — инструмент для определения и запуска многоконтейнерных приложений. Использует YAML-файл для конфигурации.

### 💾 Docker Volume

**Docker Volume** — механизм для сохранения данных вне контейнера. Данные сохраняются при перезапуске/удалении контейнера.

### 🔗 Docker Network

**Docker Network** — виртуальная сеть для связи между контейнерами. Позволяет контейнерам общаться по имени сервиса.

### 🏗️ Multi-stage Build

**Multi-stage Build** — техника создания Docker образов с несколькими этапами сборки. Позволяет уменьшить размер финального образа.

### ❤️ Health Check

**Health Check** — механизм проверки работоспособности контейнера. Docker периодически проверяет состояние сервиса.

---

## 📁 Структура файлов

```
snapboard/
├── docker-compose.yml              # Production compose
├── docker-compose.dev.yml          # Development compose
├── .env.example                    # Пример переменных окружения
├── .dockerignore                   # Игнорируемые файлы для Docker
├── backend/
│   ├── Dockerfile                  # Production Dockerfile
│   ├── Dockerfile.dev              # Development Dockerfile
│   └── .dockerignore               # Backend-specific ignores
├── frontend/
│   ├── Dockerfile                  # Production Dockerfile
│   ├── Dockerfile.dev              # Development Dockerfile
│   └── .dockerignore               # Frontend-specific ignores
└── nginx/                          # (опционально)
    └── nginx.conf                  # Reverse proxy конфигурация
```

---

## 🐳 Backend Dockerfile

### Production Dockerfile

```dockerfile
# backend/Dockerfile

# ==================== STAGE 1: Builder ====================
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package files для кэширования зависимостей
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая devDependencies для сборки)
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# ==================== STAGE 2: Production ====================
FROM node:20-alpine AS production

# Метаданные образа
LABEL maintainer="SnapBoard Team"
LABEL description="SnapBoard Backend API"
LABEL version="1.0"

# Устанавливаем рабочую директорию
WORKDIR /app

# Создаём непривилегированного пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Копируем package files
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --only=production && \
    npm cache clean --force

# Копируем собранное приложение из builder stage
COPY --from=builder /app/dist ./dist

# Создаём директорию для uploads с правильными правами
RUN mkdir -p /app/uploads && \
    chown -R nestjs:nodejs /app/uploads

# Переключаемся на непривилегированного пользователя
USER nestjs

# Открываем порт
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Запускаем приложение
CMD ["node", "dist/main.js"]
```

### Development Dockerfile

```dockerfile
# backend/Dockerfile.dev

FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем все зависимости
RUN npm ci

# Копируем исходный код (будет перезаписан volume в dev режиме)
COPY . .

# Создаём директорию для uploads
RUN mkdir -p /app/uploads

# Открываем порт
EXPOSE 3001

# Запускаем в режиме разработки с hot reload
CMD ["npm", "run", "start:dev"]
```

### Backend .dockerignore

```dockerignore
# backend/.dockerignore

# Dependencies
node_modules
npm-debug.log*

# Build output
dist

# IDE
.idea
.vscode
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local
.env.*.local

# Uploads (будут монтироваться как volume)
uploads/*
!uploads/.gitkeep

# Tests
coverage
*.spec.ts
test

# Documentation
*.md
!README.md

# Git
.git
.gitignore

# Docker
Dockerfile*
docker-compose*
.dockerignore
```

---

## 🎨 Frontend Dockerfile

### Production Dockerfile

```dockerfile
# frontend/Dockerfile

# ==================== STAGE 1: Builder ====================
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package files
COPY package*.json ./
COPY yarn.lock ./

# Устанавливаем зависимости (используем yarn, т.к. есть yarn.lock)
RUN yarn install --frozen-lockfile

# Копируем исходный код
COPY . .

# Собираем приложение
RUN yarn build

# ==================== STAGE 2: Production ====================
FROM node:20-alpine AS production

# Метаданные образа
LABEL maintainer="SnapBoard Team"
LABEL description="SnapBoard Frontend"
LABEL version="1.0"

# Устанавливаем рабочую директорию
WORKDIR /app

# Создаём непривилегированного пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nuxt -u 1001

# Копируем собранное приложение
COPY --from=builder --chown=nuxt:nodejs /app/.output ./.output

# Переключаемся на непривилегированного пользователя
USER nuxt

# Открываем порт
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Запускаем приложение
CMD ["node", ".output/server/index.mjs"]
```

### Development Dockerfile

```dockerfile
# frontend/Dockerfile.dev

FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package files
COPY package*.json ./
COPY yarn.lock ./

# Устанавливаем зависимости
RUN yarn install

# Копируем исходный код (будет перезаписан volume в dev режиме)
COPY . .

# Открываем порт
EXPOSE 3000

# Запускаем в режиме разработки
CMD ["yarn", "dev"]
```

### Frontend .dockerignore

```dockerignore
# frontend/.dockerignore

# Dependencies
node_modules
npm-debug.log*
yarn-error.log*

# Build output
.output
.nuxt
dist

# IDE
.idea
.vscode
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local
.env.*.local

# Tests
coverage
*.spec.ts
*.test.ts

# Documentation
*.md
!README.md

# Git
.git
.gitignore

# Docker
Dockerfile*
docker-compose*
.dockerignore
```

---

## 🎼 Docker Compose

### Production docker-compose.yml

```yaml
# docker-compose.yml (корень проекта)

version: '3.8'

services:
  # ==================== PostgreSQL Database ====================
  db:
    image: postgres:15-alpine
    container_name: snapboard-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-snapboard}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-snapboard123}
      POSTGRES_DB: ${DB_NAME:-snapboard}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "${DB_PORT:-5432}:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-snapboard} -d ${DB_NAME:-snapboard}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    networks:
      - snapboard-network

  # ==================== NestJS Backend ====================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: snapboard-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3001
      API_PREFIX: api
      # Database
      DATABASE_HOST: db
      DATABASE_PORT: 5432
      DATABASE_USER: ${DB_USER:-snapboard}
      DATABASE_PASSWORD: ${DB_PASSWORD:-snapboard123}
      DATABASE_NAME: ${DB_NAME:-snapboard}
      # JWT
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      JWT_ACCESS_EXPIRES_IN: ${JWT_ACCESS_EXPIRES_IN:-900}
      JWT_REFRESH_EXPIRES_IN: ${JWT_REFRESH_EXPIRES_IN:-604800}
      # CORS
      CORS_ORIGIN: ${CORS_ORIGIN:-http://localhost:3000}
      # Upload
      UPLOAD_DIR: /app/uploads
      MAX_FILE_SIZE: ${MAX_FILE_SIZE:-10485760}
      # Rate Limiting
      RATE_LIMIT_WINDOW: ${RATE_LIMIT_WINDOW:-900000}
      RATE_LIMIT_MAX: ${RATE_LIMIT_MAX:-100}
    ports:
      - "${BACKEND_PORT:-3001}:3001"
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - uploads_data:/app/uploads
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    networks:
      - snapboard-network

  # ==================== Nuxt Frontend ====================
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        NUXT_PUBLIC_API_BASE: ${NUXT_PUBLIC_API_BASE:-http://localhost:3001/api}
    container_name: snapboard-frontend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      NUXT_PUBLIC_API_BASE: ${NUXT_PUBLIC_API_BASE:-http://backend:3001/api}
    ports:
      - "${FRONTEND_PORT:-3000}:3000"
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    networks:
      - snapboard-network

# ==================== Volumes ====================
volumes:
  postgres_data:
    driver: local
  uploads_data:
    driver: local

# ==================== Networks ====================
networks:
  snapboard-network:
    driver: bridge
```

### Development docker-compose.dev.yml

```yaml
# docker-compose.dev.yml (корень проекта)

version: '3.8'

services:
  # ==================== PostgreSQL Database ====================
  db:
    image: postgres:15-alpine
    container_name: snapboard-db-dev
    restart: unless-stopped
    environment:
      POSTGRES_USER: snapboard
      POSTGRES_PASSWORD: snapboard123
      POSTGRES_DB: snapboard
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data_dev:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U snapboard -d snapboard"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    networks:
      - snapboard-network-dev

  # ==================== NestJS Backend (Development) ====================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: snapboard-backend-dev
    restart: unless-stopped
    environment:
      NODE_ENV: development
      PORT: 3001
      API_PREFIX: api
      # Database
      DATABASE_HOST: db
      DATABASE_PORT: 5432
      DATABASE_USER: snapboard
      DATABASE_PASSWORD: snapboard123
      DATABASE_NAME: snapboard
      # JWT
      JWT_ACCESS_SECRET: dev-access-secret-key
      JWT_REFRESH_SECRET: dev-refresh-secret-key
      JWT_ACCESS_EXPIRES_IN: 900
      JWT_REFRESH_EXPIRES_IN: 604800
      # CORS
      CORS_ORIGIN: http://localhost:3000
      # Upload
      UPLOAD_DIR: /app/uploads
      MAX_FILE_SIZE: 10485760
    ports:
      - "3001:3001"
    depends_on:
      db:
        condition: service_healthy
    volumes:
      # Монтируем исходный код для hot reload
      - ./backend/src:/app/src
      - ./backend/package.json:/app/package.json
      # Исключаем node_modules (используем из контейнера)
      - /app/node_modules
      # Персистентное хранилище для uploads
      - uploads_data_dev:/app/uploads
    networks:
      - snapboard-network-dev

  # ==================== Nuxt Frontend (Development) ====================
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: snapboard-frontend-dev
    restart: unless-stopped
    environment:
      NODE_ENV: development
      NUXT_PUBLIC_API_BASE: http://localhost:3001/api
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      # Монтируем исходный код для hot reload
      - ./frontend:/app
      # Исключаем node_modules и .nuxt
      - /app/node_modules
      - /app/.nuxt
    networks:
      - snapboard-network-dev

# ==================== Volumes ====================
volumes:
  postgres_data_dev:
    driver: local
  uploads_data_dev:
    driver: local

# ==================== Networks ====================
networks:
  snapboard-network-dev:
    driver: bridge
```

---

## 🔧 Переменные окружения

### .env.example (корень проекта)

```env
# ==========================================
# SnapBoard Docker Environment Variables
# ==========================================
# Скопируйте этот файл в .env и заполните значения

# ==================== Database ====================
DB_USER=snapboard
DB_PASSWORD=snapboard123
DB_NAME=snapboard
DB_PORT=5432

# ==================== JWT Secrets ====================
# ВАЖНО: Замените на случайные строки в production!
# Генерация: openssl rand -base64 32
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRES_IN=900
JWT_REFRESH_EXPIRES_IN=604800

# ==================== Ports ====================
BACKEND_PORT=3001
FRONTEND_PORT=3000

# ==================== CORS ====================
CORS_ORIGIN=http://localhost:3000

# ==================== Upload ====================
MAX_FILE_SIZE=10485760

# ==================== Rate Limiting ====================
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# ==================== Frontend ====================
NUXT_PUBLIC_API_BASE=http://localhost:3001/api
```

---

## ❤️ Health Check Endpoint

Для корректной работы Docker health checks необходимо добавить endpoint `/api/health` в backend.

### health.controller.ts

```typescript
// backend/src/modules/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Health Check Controller
 * 
 * Предоставляет endpoint для проверки работоспособности сервиса.
 * Используется Docker для health checks и мониторинга.
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Проверка работоспособности сервиса' })
  @ApiResponse({
    status: 200,
    description: 'Сервис работает',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        uptime: { type: 'number', example: 12345.67 },
        environment: { type: 'string', example: 'production' },
      },
    },
  })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Проверка готовности сервиса' })
  @ApiResponse({
    status: 200,
    description: 'Сервис готов к приёму запросов',
  })
  ready() {
    // Здесь можно добавить проверку подключения к БД
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }
}
```

### health.module.ts

```typescript
// backend/src/modules/health/health.module.ts
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
```

### Регистрация в app.module.ts

```typescript
// backend/src/app.module.ts
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // ... другие модули
    HealthModule,
  ],
})
export class AppModule {}
```

---

## 🔀 Nginx Reverse Proxy (опционально)

Nginx может использоваться как reverse proxy для:
- SSL termination
- Load balancing
- Статические файлы
- Кэширование

### nginx/nginx.conf

```nginx
# nginx/nginx.conf

upstream backend {
    server backend:3001;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 80;
    server_name localhost;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Увеличенные таймауты для загрузки файлов
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Увеличенный размер тела запроса для загрузки файлов
        client_max_body_size 10M;
    }

    # Статические файлы uploads
    location /uploads {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        
        # Кэширование изображений
        proxy_cache_valid 200 1d;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### docker-compose.yml с Nginx

```yaml
# Добавить в docker-compose.yml

  # ==================== Nginx Reverse Proxy ====================
  nginx:
    image: nginx:alpine
    container_name: snapboard-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      # Для SSL (опционально)
      # - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - snapboard-network
```

---

## 🚀 Команды запуска

### Production

```bash
# Запуск всех сервисов
docker-compose up -d

# Запуск с пересборкой образов
docker-compose up -d --build

# Просмотр логов всех сервисов
docker-compose logs -f

# Просмотр логов конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Остановка всех сервисов
docker-compose down

# Остановка с удалением volumes (ОСТОРОЖНО: удалит данные!)
docker-compose down -v

# Перезапуск конкретного сервиса
docker-compose restart backend

# Проверка статуса сервисов
docker-compose ps

# Выполнение команды в контейнере
docker-compose exec backend sh
docker-compose exec db psql -U snapboard -d snapboard
```

### Development

```bash
# Запуск в режиме разработки
docker-compose -f docker-compose.dev.yml up -d

# Запуск с пересборкой
docker-compose -f docker-compose.dev.yml up -d --build

# Просмотр логов
docker-compose -f docker-compose.dev.yml logs -f

# Остановка
docker-compose -f docker-compose.dev.yml down
```

### Только база данных

```bash
# Запуск только PostgreSQL (для локальной разработки)
docker-compose up db -d

# Или из dev compose
docker-compose -f docker-compose.dev.yml up db -d
```

### Пересборка образов

```bash
# Пересборка всех образов без кэша
docker-compose build --no-cache

# Пересборка конкретного образа
docker-compose build --no-cache backend
docker-compose build --no-cache frontend
```

### Очистка

```bash
# Удаление остановленных контейнеров
docker container prune

# Удаление неиспользуемых образов
docker image prune

# Удаление неиспользуемых volumes
docker volume prune

# Полная очистка (ОСТОРОЖНО!)
docker system prune -a --volumes
```

---

## 🔄 Схема работы Docker Compose

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DOCKER COMPOSE ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        EXTERNAL                                 │    │
│  │                                                                 │    │
│  │    Browser ──────────────────────────────────────────────────   │    │
│  │         │                                                       │    │
│  │         │ :3000 (Frontend)                                      │    │
│  │         │ :3001 (Backend API)                                   │    │
│  │         ▼                                                       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                           │                                             │
│  ┌────────────────────────┼────────────────────────────────────────┐    │
│  │                        │                                        │    │
│  │  ┌─────────────────────▼─────────────────────┐                  │    │
│  │  │              FRONTEND                     │                  │    │
│  │  │         (snapboard-frontend)              │                  │    │
│  │  │                                           │                  │    │
│  │  │  • Nuxt 3 SSR                             │                  │    │
│  │  │  • Port: 3000                             │                  │    │
│  │  │  • Health: /                              │                  │    │
│  │  │                                           │                  │    │
│  │  │  depends_on: backend                      │                  │    │
│  │  └─────────────────────┬─────────────────────┘                  │    │
│  │                        │                                        │    │
│  │                        │ http://backend:3001/api                │    │
│  │                        ▼                                        │    │
│  │  ┌───────────────────────────────────────────┐                  │    │
│  │  │              BACKEND                      │                  │    │
│  │  │         (snapboard-backend)               │                  │    │
│  │  │                                           │                  │    │
│  │  │  • NestJS                                 │                  │    │
│  │  │  • Port: 3001                             │                  │    │
│  │  │  • Health: /api/health                    │                  │    │
│  │  │                                           │                  │    │
│  │  │  Volumes:                                 │                  │    │
│  │  │  • uploads_data:/app/uploads              │                  │    │
│  │  │                                           │                  │    │
│  │  │  depends_on: db (healthy)                 │                  │    │
│  │  └─────────────────────┬─────────────────────┘                  │    │
│  │                        │                                        │    │
│  │                        │ db:5432                                │    │
│  │                        ▼                                        │    │
│  │  ┌───────────────────────────────────────────┐                  │    │
│  │  │              DATABASE                     │                  │    │
│  │  │           (snapboard-db)                  │                  │    │
│  │  │                                           │                  │    │
│  │  │  • PostgreSQL 15                          │                  │    │
│  │  │  • Port: 5432                             │                  │    │
│  │  │  • Health: pg_isready                     │                  │    │
│  │  │                                           │                  │    │
│  │  │  Volumes:                                 │                  │    │
│  │  │  • postgres_data:/var/lib/postgresql/data │                  │    │
│  │  └───────────────────────────────────────────┘                  │    │
│  │                                                                 │    │
│  │  ┌───────────────────────────────────────────┐                  │    │
│  │  │              NETWORK                      │                  │    │
│  │  │       (snapboard-network)                 │                  │    │
│  │  │                                           │                  │    │
│  │  │  • Driver: bridge                         │                  │    │
│  │  │  • Все сервисы в одной сети               │                  │    │
│  │  │  • Обращение по имени сервиса             │                  │    │
│  │  └───────────────────────────────────────────┘                  │    │
│  │                                                                 │    │
│  │  ┌───────────────────────────────────────────┐                  │    │
│  │  │              VOLUMES                      │                  │    │
│  │  │                                           │                  │    │
│  │  │  • postgres_data - данные PostgreSQL      │                  │    │
│  │  │  • uploads_data - загруженные файлы       │                  │    │
│  │  └───────────────────────────────────────────┘                  │    │
│  │                                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                        DOCKER COMPOSE                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Порядок запуска сервисов

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    STARTUP SEQUENCE                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. DATABASE (db)                                                       │
│     │                                                                   │
│     │  ┌─────────────────────────────────────────────────────────┐      │
│     │  │ • Запуск PostgreSQL                                     │      │
│     │  │ • Инициализация данных                                  │      │
│     │  │ • Health check: pg_isready                              │      │
│     │  │ • Статус: healthy                                       │      │
│     │  └─────────────────────────────────────────────────────────┘      │
│     │                                                                   │
│     ▼                                                                   │
│  2. BACKEND (depends_on: db healthy)                                    │
│     │                                                                   │
│     │  ┌─────────────────────────────────────────────────────────┐      │
│     │  │ • Ожидание готовности БД                                │      │
│     │  │ • Запуск NestJS                                         │      │
│     │  │ • Подключение к PostgreSQL                              │      │
│     │  │ • Выполнение миграций (если настроено)                  │      │
│     │  │ • Health check: /api/health                             │      │
│     │  │ • Статус: healthy                                       │      │
│     │  └─────────────────────────────────────────────────────────┘      │
│     │                                                                   │
│     ▼                                                                   │
│  3. FRONTEND (depends_on: backend healthy)                              │
│                                                                         │
│     ┌─────────────────────────────────────────────────────────────┐     │
│     │ • Ожидание готовности Backend                               │     │
│     │ • Запуск Nuxt                                               │     │
│     │ • Health check: /                                           │     │
│     │ • Статус: healthy                                           │     │
│     └─────────────────────────────────────────────────────────────┘     │
│                                                                         │
│  ✅ ВСЕ СЕРВИСЫ ЗАПУЩЕНЫ                                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Проблема: Контейнер не запускается

```bash
# Проверить логи контейнера
docker-compose logs backend

# Проверить статус
docker-compose ps

# Проверить health check
docker inspect snapboard-backend | grep -A 10 "Health"
```

### Проблема: Backend не может подключиться к БД

```bash
# Проверить, что БД запущена и healthy
docker-compose ps db

# Проверить логи БД
docker-compose logs db

# Проверить сеть
docker network inspect snapboard_snapboard-network

# Попробовать подключиться вручную
docker-compose exec backend sh
# Внутри контейнера:
nc -zv db 5432
```

### Проблема: Порт уже занят

```bash
# Найти процесс, занимающий порт
# Windows
netstat -ano | findstr :3001

# Linux/Mac
lsof -i :3001

# Изменить порт в .env
BACKEND_PORT=3002
```

### Проблема: Volumes не сохраняют данные

```bash
# Проверить volumes
docker volume ls

# Проверить содержимое volume
docker volume inspect snapboard_postgres_data

# Пересоздать volumes (ОСТОРОЖНО: удалит данные!)
docker-compose down -v
docker-compose up -d
```

### Проблема: Hot reload не работает (dev mode)

```bash
# Проверить, что volumes правильно смонтированы
docker-compose -f docker-compose.dev.yml exec backend ls -la /app/src

# Перезапустить с пересборкой
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d --build
```

### Проблема: Недостаточно памяти

```bash
# Проверить использование ресурсов
docker stats

# Ограничить память для контейнера (добавить в docker-compose.yml)
# services:
#   backend:
#     deploy:
#       resources:
#         limits:
#           memory: 512M
```

---

## ✅ Чек-лист реализации

### Dockerfiles
- [ ] Создан `backend/Dockerfile` (production)
- [ ] Создан `backend/Dockerfile.dev` (development)
- [ ] Создан `backend/.dockerignore`
- [ ] Создан `frontend/Dockerfile` (production)
- [ ] Создан `frontend/Dockerfile.dev` (development)
- [ ] Создан `frontend/.dockerignore`

### Docker Compose
- [ ] Создан `docker-compose.yml` (production)
- [ ] Создан `docker-compose.dev.yml` (development)
- [ ] Настроены volumes для PostgreSQL
- [ ] Настроены volumes для uploads
- [ ] Настроена сеть между сервисами
- [ ] Настроены health checks для всех сервисов
- [ ] Настроены depends_on с condition: service_healthy

### Environment
- [ ] Создан `.env.example` в корне проекта
- [ ] Создан `.env` с реальными значениями
- [ ] JWT секреты заменены на случайные строки

### Health Check
- [ ] Создан `HealthModule` в backend
- [ ] Создан `HealthController` с endpoint `/api/health`
- [ ] Зарегистрирован в `AppModule`

### Nginx (опционально)
- [ ] Создана директория `nginx/`
- [ ] Создан `nginx/nginx.conf`
- [ ] Добавлен nginx сервис в docker-compose.yml

### Тестирование
- [ ] `docker-compose up -d` запускает все сервисы
- [ ] Frontend доступен на http://localhost:3000
- [ ] Backend API доступен на http://localhost:3001/api
- [ ] Health check работает: http://localhost:3001/api/health
- [ ] Данные сохраняются после перезапуска
- [ ] Uploads сохраняются в volume

---

## 📦 Зависимости

| Компонент | Версия | Описание |
|-----------|--------|----------|
| Docker | 24.x+ | Контейнеризация |
| Docker Compose | 2.x+ | Оркестрация |
| Node.js | 20-alpine | Base image |
| PostgreSQL | 15-alpine | База данных |
| Nginx | alpine | Reverse proxy (опционально) |

---

## 🔗 Связанные этапы

- **Этап 1**: Базовая настройка (структура проекта)
- **Этап 2**: База данных (PostgreSQL)
- **Этап 10**: Безопасность (production настройки)
- **Этап 12**: Тестирование (CI/CD)

---

## 📚 Дополнительные ресурсы

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/recipes/docker)
- [Nuxt Docker Deployment](https://nuxt.com/docs/getting-started/deployment)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Nginx Docker Hub](https://hub.docker.com/_/nginx)
