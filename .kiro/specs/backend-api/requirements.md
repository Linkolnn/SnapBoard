# Requirements Document - SnapBoard Backend API

## Introduction

Backend API для SnapBoard - визуальной доски вдохновения. Реализует REST API на NestJS с PostgreSQL для управления пользователями, досками, изображениями, избранным и аутентификацией. Включает Docker-контейнеризацию всего проекта (Frontend + Backend + PostgreSQL).

Детальный план разработки: #[[file:backend/backend.md]]

## Glossary

- **Auth_Module**: Модуль аутентификации с JWT (access + refresh tokens)
- **Users_Module**: Модуль управления профилем пользователя
- **Boards_Module**: Модуль управления досками/коллекциями
- **Images_Module**: Модуль управления изображениями
- **Favorites_Module**: Модуль избранного
- **Upload_Module**: Модуль загрузки и обработки файлов
- **Docker_Setup**: Контейнеризация всего проекта

## Requirements

### Requirement 1: Настройка базы данных и TypeORM

**User Story:** As a разработчик, I want настроить PostgreSQL с TypeORM, so that данные приложения надёжно хранятся и легко управляются.

#### Acceptance Criteria

1. THE Database SHALL подключаться к PostgreSQL через TypeORM с конфигурацией из .env
2. THE Database SHALL содержать entities: User, Board, Image, Favorite, BoardImage
3. THE Database SHALL поддерживать миграции для версионирования схемы
4. THE Database SHALL использовать UUID для первичных ключей
5. THE Database SHALL иметь индексы для оптимизации запросов (user_id, board_id, tags)

### Requirement 2: Модуль аутентификации (Auth)

**User Story:** As a пользователь, I want безопасно регистрироваться и входить в систему, so that мои данные защищены.

#### Acceptance Criteria

1. WHEN пользователь регистрируется, THE Auth_Module SHALL создавать аккаунт с хешированным паролем (bcrypt)
2. WHEN пользователь входит, THE Auth_Module SHALL выдавать access token (15 мин) и refresh token (7 дней)
3. WHEN access token истекает, THE Auth_Module SHALL позволять обновление через refresh token
4. WHEN пользователь выходит, THE Auth_Module SHALL инвалидировать refresh token в БД
5. THE Auth_Module SHALL валидировать email уникальность и формат при регистрации
6. THE Auth_Module SHALL использовать Passport JWT Strategy для защиты роутов

**API Endpoints:**
- POST /api/auth/register - Регистрация
- POST /api/auth/login - Вход
- POST /api/auth/refresh - Обновление токена
- POST /api/auth/logout - Выход
- GET /api/auth/me - Текущий пользователь

### Requirement 3: Модуль пользователей (Users/Profile)

**User Story:** As a пользователь, I want управлять своим профилем, so that я могу обновлять информацию и настройки.

#### Acceptance Criteria

1. WHEN пользователь запрашивает профиль, THE Users_Module SHALL возвращать данные без пароля
2. WHEN пользователь обновляет профиль, THE Users_Module SHALL валидировать и сохранять изменения
3. WHEN пользователь меняет пароль, THE Users_Module SHALL проверять текущий пароль и хешировать новый
4. WHEN пользователь загружает аватар, THE Users_Module SHALL обрабатывать изображение через Sharp
5. WHEN пользователь удаляет аккаунт, THE Users_Module SHALL каскадно удалять все связанные данные
6. THE Users_Module SHALL возвращать статистику: количество досок, изображений, избранного

**API Endpoints:**
- GET /api/profile - Получить профиль
- PUT /api/profile - Обновить профиль
- PUT /api/profile/password - Сменить пароль
- POST /api/profile/avatar - Загрузить аватар
- DELETE /api/profile - Удалить аккаунт
- GET /api/profile/stats - Статистика

### Requirement 4: Модуль досок (Boards)

**User Story:** As a пользователь, I want создавать и управлять досками, so that я могу организовывать изображения по темам.

#### Acceptance Criteria

1. WHEN пользователь создаёт доску, THE Boards_Module SHALL сохранять с привязкой к user_id
2. WHEN запрашивается список досок, THE Boards_Module SHALL возвращать публичные + свои приватные
3. WHEN доска приватная, THE Boards_Module SHALL скрывать её от других пользователей
4. WHEN изображение добавляется на доску, THE Boards_Module SHALL автоматически обновлять cover_image
5. WHEN доска удаляется, THE Boards_Module SHALL каскадно удалять связи с изображениями
6. THE Boards_Module SHALL поддерживать пагинацию списка досок

**API Endpoints:**
- GET /api/boards - Список досок
- POST /api/boards - Создать доску
- GET /api/boards/:id - Получить доску
- PUT /api/boards/:id - Обновить доску
- DELETE /api/boards/:id - Удалить доску
- GET /api/boards/:id/images - Изображения доски
- POST /api/boards/:id/images - Сохранить изображение на доску
- DELETE /api/boards/:id/images/:imageId - Удалить изображение с доски

### Requirement 5: Модуль изображений (Images)

**User Story:** As a пользователь, I want загружать и управлять изображениями, so that я могу создавать визуальные коллекции.

#### Acceptance Criteria

1. WHEN запрашивается список изображений, THE Images_Module SHALL поддерживать пагинацию и фильтры
2. WHEN изображение создаётся, THE Images_Module SHALL сохранять метаданные (width, height, size, mime_type)
3. WHEN изображение обновляется, THE Images_Module SHALL проверять права владельца
4. WHEN изображение удаляется, THE Images_Module SHALL удалять файл и все связи
5. THE Images_Module SHALL поддерживать поиск по title, description и tags
6. THE Images_Module SHALL поддерживать сортировку: newest, oldest, title_asc, title_desc

**API Endpoints:**
- GET /api/images - Список изображений (с пагинацией, поиском, фильтрами)
- GET /api/images/:id - Получить изображение
- PUT /api/images/:id - Обновить метаданные
- DELETE /api/images/:id - Удалить изображение

**Query параметры:**
- page, pageSize - пагинация
- boardId - фильтр по доске
- query - поиск по тексту
- tags - фильтр по тегам
- sortBy - сортировка

### Requirement 6: Модуль загрузки файлов (Upload)

**User Story:** As a пользователь, I want загружать изображения разными способами, so that я могу удобно добавлять контент.

#### Acceptance Criteria

1. WHEN файл загружается, THE Upload_Module SHALL валидировать тип (jpeg, png, webp, gif) и размер (max 10MB)
2. WHEN файл принят, THE Upload_Module SHALL обрабатывать через Sharp (ресайз, оптимизация)
3. WHEN загрузка по URL, THE Upload_Module SHALL скачивать и обрабатывать изображение
4. THE Upload_Module SHALL генерировать thumbnails разных размеров (small, medium, large)
5. THE Upload_Module SHALL извлекать и сохранять метаданные изображения
6. THE Upload_Module SHALL использовать Multer для обработки multipart/form-data

**API Endpoints:**
- POST /api/upload/file - Загрузка файла
- POST /api/upload/url - Загрузка по URL

### Requirement 7: Модуль избранного (Favorites)

**User Story:** As a пользователь, I want добавлять изображения в избранное, so that я могу быстро находить понравившийся контент.

#### Acceptance Criteria

1. WHEN пользователь добавляет в избранное, THE Favorites_Module SHALL создавать уникальную связь user-image
2. WHEN пользователь удаляет из избранного, THE Favorites_Module SHALL удалять связь
3. WHEN запрашивается список избранного, THE Favorites_Module SHALL возвращать с пагинацией
4. THE Favorites_Module SHALL поддерживать batch-проверку статуса избранного для списка изображений
5. IF изображение уже в избранном, THEN THE Favorites_Module SHALL возвращать ошибку при повторном добавлении

**API Endpoints:**
- GET /api/favorites - Список избранного
- POST /api/favorites/:imageId - Добавить в избранное
- DELETE /api/favorites/:imageId - Удалить из избранного
- GET /api/favorites/check?ids=... - Проверить статус (batch)

### Requirement 8: Безопасность и защита API

**User Story:** As a разработчик, I want защитить API от атак, so that приложение безопасно для пользователей.

#### Acceptance Criteria

1. THE API SHALL использовать Helmet для защиты HTTP заголовков
2. THE API SHALL применять Rate Limiting: 100 req/15min общий, 10 req/hour для auth
3. THE API SHALL настроить CORS только для разрешённых origins
4. THE API SHALL валидировать все входные данные через class-validator
5. THE API SHALL использовать глобальный Exception Filter для обработки ошибок
6. THE API SHALL логировать все запросы и ошибки
7. THE API SHALL защищать от SQL injection через TypeORM параметризованные запросы

### Requirement 9: Docker-контейнеризация (Full Stack)

**User Story:** As a разработчик, I want запускать весь проект в Docker, so that развёртывание простое и воспроизводимое.

#### Acceptance Criteria

1. THE Docker_Setup SHALL включать docker-compose.yml в корне проекта
2. THE Docker_Setup SHALL запускать PostgreSQL, Backend (NestJS), Frontend (Nuxt) как отдельные сервисы
3. THE Docker_Setup SHALL использовать volumes для персистентности данных БД и uploads
4. THE Docker_Setup SHALL настраивать health checks для зависимостей между сервисами
5. THE Docker_Setup SHALL поддерживать режим разработки (docker-compose.dev.yml) с hot reload
6. THE Docker_Setup SHALL использовать multi-stage builds для оптимизации размера образов
7. THE Docker_Setup SHALL передавать переменные окружения через .env файл

**Файлы:**
- /docker-compose.yml - Production
- /docker-compose.dev.yml - Development
- /backend/Dockerfile
- /frontend/Dockerfile
- /.env.example

### Requirement 10: Формат ответов API

**User Story:** As a frontend разработчик, I want получать консистентные ответы от API, so that обработка данных предсказуема.

#### Acceptance Criteria

1. THE API SHALL возвращать пагинированные списки в формате: { items, page, pageSize, totalItems, totalPages, hasMore }
2. THE API SHALL возвращать ошибки в формате: { statusCode, message, error, timestamp }
3. THE API SHALL использовать HTTP статус коды корректно (200, 201, 400, 401, 403, 404, 500)
4. THE API SHALL трансформировать ответы через Interceptor (exclude password, etc.)
5. THE API SHALL возвращать timestamps в ISO 8601 формате

## Implementation Phases

### Phase 1: База и Auth (Этапы 1-3 из backend.md)
- Настройка TypeORM и PostgreSQL
- Создание entities и миграций
- Модуль аутентификации

### Phase 2: Core Modules (Этапы 4-6)
- Модуль пользователей
- Модуль досок
- Модуль изображений

### Phase 3: Features (Этапы 7-8)
- Модуль загрузки файлов
- Модуль избранного

### Phase 4: Security & DevOps (Этапы 9-10)
- Безопасность API
- Docker-контейнеризация

### Phase 5: Quality (Этапы 11-12)
- Тестирование
- Swagger документация
