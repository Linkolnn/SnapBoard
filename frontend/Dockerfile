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
