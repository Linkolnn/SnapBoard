# Stage 13: Восстановление пароля (Frontend)

## Обзор

Реализация UI для восстановления пароля: страницы запроса сброса и установки нового пароля.

## Страницы

### 1. /forgot-password - Запрос сброса пароля

**Функционал:**
- Форма с полем email
- Отправка запроса на backend
- Отображение успешного сообщения
- В dev-режиме: показ токена и ссылки для перехода

**Компоненты:**
- CommonBaseInput (email)
- CommonBaseButton (submit)
- Сообщения об успехе/ошибке

### 2. /reset-password - Установка нового пароля

**Функционал:**
- Получение токена из query параметра (?token=xxx)
- Форма с полями: новый пароль, подтверждение
- Валидация совпадения паролей
- Отправка запроса на backend
- Редирект на /login после успеха

**Компоненты:**
- CommonBaseInput (password x2)
- CommonBaseButton (submit)
- Сообщения об успехе/ошибке

## API интеграция

```typescript
// frontend/store/auth.ts

async forgotPassword(email: string): Promise<{ message: string; token?: string }> {
  const { post } = useApi();
  return post('/auth/forgot-password', { email });
}

async resetPassword(token: string, password: string): Promise<{ message: string }> {
  const { post } = useApi();
  return post('/auth/reset-password', { token, password });
}
```

## Валидация

### forgot-password
- Email: обязательный, валидный формат

### reset-password
- Пароль: минимум 6 символов
- Подтверждение: должно совпадать с паролем
- Токен: обязательный (из URL)

## Стили

Использовать существующий auth layout (`layouts/auth.vue`) для единообразия с login/register.

## Обработка ошибок

- Недействительный токен → сообщение + ссылка на /forgot-password
- Истёкший токен → сообщение + ссылка на /forgot-password  
- Сетевая ошибка → общее сообщение об ошибке

## Задачи

- [ ] 1. Создать страницу pages/forgot-password.vue
- [ ] 2. Создать страницу pages/reset-password.vue
- [ ] 3. Добавить методы в store/auth.ts
- [ ] 4. Применить auth layout к новым страницам
- [ ] 5. Добавить валидацию форм
- [ ] 6. Обработка состояний загрузки
- [ ] 7. Тестирование flow
