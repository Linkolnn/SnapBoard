# Stage 13: Восстановление пароля

## Обзор

Реализация функционала восстановления пароля через email с использованием токенов сброса.

## Функциональные требования

### 1. Запрос сброса пароля
- Пользователь вводит email на странице `/forgot-password`
- Система проверяет существование пользователя
- Генерируется уникальный токен сброса (срок действия 1 час)
- Отправляется email со ссылкой для сброса
- Показывается сообщение об успешной отправке (даже если email не найден - для безопасности)

### 2. Сброс пароля
- Пользователь переходит по ссылке `/reset-password?token=xxx`
- Система проверяет валидность токена
- Пользователь вводит новый пароль (с подтверждением)
- Пароль обновляется, токен инвалидируется
- Пользователь перенаправляется на страницу входа

## Технические требования

### Backend (NestJS)

#### 1. Миграция базы данных
Добавить поля в таблицу `users`:
```sql
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP;
```

#### 2. API Endpoints

**POST /api/auth/forgot-password**
```typescript
// Request
{ email: string }

// Response 200
{ message: "Если email существует, инструкции отправлены" }
```

**POST /api/auth/reset-password**
```typescript
// Request
{ 
  token: string,
  password: string,
  confirmPassword: string
}

// Response 200
{ message: "Пароль успешно изменён" }

// Response 400
{ message: "Токен недействителен или истёк" }
```

**GET /api/auth/verify-reset-token**
```typescript
// Query: ?token=xxx

// Response 200
{ valid: true }

// Response 400
{ valid: false, message: "Токен недействителен или истёк" }
```

#### 3. Сервис отправки email
- Использовать nodemailer
- Настроить SMTP через переменные окружения
- Шаблон письма с ссылкой для сброса

#### 4. Безопасность
- Токен: crypto.randomBytes(32).toString('hex')
- Хеширование токена в БД (bcrypt)
- Rate limiting на endpoint forgot-password (3 запроса в час на email)
- Токен одноразовый - удаляется после использования

### Frontend (Nuxt 3)

#### 1. Страница /forgot-password
- Форма с полем email
- Валидация email
- Кнопка "Отправить инструкции"
- Сообщение об успехе
- Ссылка "Вернуться к входу"

#### 2. Страница /reset-password
- Проверка токена при загрузке
- Форма с полями: новый пароль, подтверждение
- Валидация (мин. 6 символов, совпадение паролей)
- Кнопка "Сменить пароль"
- Редирект на /login после успеха

## Переменные окружения

```env
# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="SnapBoard <noreply@snapboard.com>"

# Frontend URL для ссылок в письмах
FRONTEND_URL=http://localhost:3000
```

## Структура файлов

### Backend
```
backend/src/modules/auth/
├── dto/
│   ├── forgot-password.dto.ts
│   └── reset-password.dto.ts
├── auth.controller.ts  (добавить endpoints)
├── auth.service.ts     (добавить методы)
└── auth.module.ts      (добавить MailerModule)

backend/src/modules/mailer/
├── mailer.module.ts
├── mailer.service.ts
└── templates/
    └── reset-password.hbs
```

### Frontend
```
frontend/pages/
├── forgot-password.vue
└── reset-password.vue
```

## Этапы реализации

### Этап 1: Backend - База данных
- [ ] Создать миграцию для полей reset_token
- [ ] Обновить User entity

### Этап 2: Backend - Email сервис
- [ ] Установить nodemailer, @nestjs-modules/mailer
- [ ] Создать MailerModule и MailerService
- [ ] Создать шаблон письма

### Этап 3: Backend - API
- [ ] Создать DTO для forgot-password и reset-password
- [ ] Добавить методы в AuthService
- [ ] Добавить endpoints в AuthController
- [ ] Добавить rate limiting

### Этап 4: Frontend - Страницы
- [ ] Создать страницу forgot-password.vue
- [ ] Создать страницу reset-password.vue
- [ ] Добавить методы в store/auth.ts

### Этап 5: Тестирование
- [ ] Тест запроса сброса
- [ ] Тест с несуществующим email
- [ ] Тест сброса пароля
- [ ] Тест истёкшего токена
- [ ] Тест повторного использования токена

## Примечания

### Для разработки без SMTP
Можно использовать:
1. Ethereal Email (fake SMTP для тестов)
2. Mailtrap
3. Логирование токена в консоль (dev mode)

### Альтернатива без email
Для MVP можно реализовать упрощённую версию:
- Показывать токен на экране (только dev)
- Или использовать секретный вопрос
