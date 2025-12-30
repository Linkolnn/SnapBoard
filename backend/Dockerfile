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
