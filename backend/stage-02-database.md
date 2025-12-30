# Этап 2: Настройка базы данных и TypeORM

## 🎯 Цель этапа
Подключить PostgreSQL через TypeORM, создать все entities (User, Board, Image, Favorite, BoardImage), настроить миграции и Docker Compose для базы данных.

---

## � Глоссатрий (для frontend разработчиков)

Прежде чем начать, разберём ключевые термины backend разработки:

### 🗄️ База данных (Database)

**PostgreSQL** — это реляционная база данных (RDBMS). В отличие от localStorage или Pinia store на frontend, база данных:
- Хранит данные постоянно на диске (не теряются при перезагрузке)
- Поддерживает сложные запросы и связи между данными
- Может обрабатывать миллионы записей
- Обеспечивает целостность данных (транзакции, constraints)

**Аналогия с frontend**: Если Pinia store — это "оперативная память" приложения, то PostgreSQL — это "жёсткий диск".

### 🔗 ORM (Object-Relational Mapping)

**TypeORM** — это библиотека, которая позволяет работать с базой данных через TypeScript классы вместо написания SQL запросов вручную.

```typescript
// Без ORM (чистый SQL)
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

// С TypeORM (через классы)
const user = await userRepository.findOne({ where: { id: userId } });
```

**Аналогия с frontend**: TypeORM для базы данных — это как Axios для HTTP запросов. Оба упрощают работу с низкоуровневыми операциями.

### 📦 Entity (Сущность)

**Entity** — это TypeScript класс, который описывает структуру таблицы в базе данных. Каждое свойство класса = колонка в таблице.

```typescript
@Entity('users')        // Имя таблицы в БД
export class User {
  @Column()             // Колонка в таблице
  email: string;
}
```

**Аналогия с frontend**: Entity — это как TypeScript interface для данных, но с дополнительной информацией о том, как хранить эти данные в БД.

### 🔄 Миграция (Migration)

**Миграция** — это файл с инструкциями по изменению структуры базы данных. Миграции позволяют:
- Версионировать схему БД (как Git для кода)
- Безопасно обновлять БД на production
- Откатывать изменения при ошибках

**Почему файл называется `1704067200000-InitialSchema.ts`?**
- `1704067200000` — это **timestamp** (Unix время в миллисекундах), гарантирует уникальность и порядок выполнения
- `InitialSchema` — человекочитаемое название миграции
- Миграции выполняются в порядке timestamp (от старых к новым)

```typescript
// Миграция содержит два метода:
export class InitialSchema1704067200000 {
  async up() {
    // Применить изменения (создать таблицы)
  }
  
  async down() {
    // Откатить изменения (удалить таблицы)
  }
}
```

**Аналогия с frontend**: Миграции — это как коммиты в Git, но для структуры базы данных.

### 🌱 Seed (Сидирование)

**Seed** — это скрипт для заполнения базы данных начальными/тестовыми данными.

Зачем нужен seed:
- Создать тестового пользователя для разработки
- Заполнить справочники (категории, роли)
- Быстро развернуть БД с данными для тестирования

**Аналогия с frontend**: Seed — это как mock данные в Storybook или тестах, но для базы данных.

### 🐳 Docker и Docker Compose

**Docker** — инструмент для запуска приложений в изолированных контейнерах. Контейнер — это "мини-виртуальная машина" с приложением и всеми зависимостями.

**Docker Compose** — инструмент для запуска нескольких контейнеров одной командой.

Зачем нужен Docker для PostgreSQL:
- Не нужно устанавливать PostgreSQL на компьютер
- Одинаковая версия БД у всех разработчиков
- Легко удалить и пересоздать БД

```bash
docker-compose up -d    # Запустить контейнер в фоне
docker-compose down     # Остановить и удалить контейнер
```

### 🔑 Primary Key (PK) и Foreign Key (FK)

**Primary Key (PK)** — уникальный идентификатор записи в таблице. Как `id` в массиве объектов.

**Foreign Key (FK)** — ссылка на запись в другой таблице. Создаёт связь между таблицами.

```typescript
// В таблице boards есть FK на таблицу users
@Column({ name: 'user_id' })
userId: string;  // FK → users.id
```

**Аналогия с frontend**: FK — это как `userId` в объекте поста, который ссылается на объект пользователя.

### 📊 Типы связей между таблицами

**OneToMany / ManyToOne** — один ко многим
- Один пользователь → много досок
- Много досок → один пользователь

```typescript
// User (один)
@OneToMany(() => Board, board => board.user)
boards: Board[];

// Board (много)
@ManyToOne(() => User, user => user.boards)
user: User;
```

**ManyToMany** — многие ко многим (через промежуточную таблицу)
- Много пользователей могут добавить в избранное много изображений
- Реализуется через таблицу `favorites`

### 🏷️ Index (Индекс)

**Индекс** — специальная структура для ускорения поиска в таблице.

```typescript
@Index('idx_boards_user_id')  // Создаёт индекс
userId: string;
```

Без индекса БД просматривает ВСЕ записи (медленно).
С индексом БД быстро находит нужные записи (как оглавление в книге).

**Когда нужен индекс**: на колонках, по которым часто ищут (userId, boardId, tags).

### 🔒 Constraints (Ограничения)

**UNIQUE** — значение должно быть уникальным в таблице
```typescript
@Column({ unique: true })
email: string;  // Два пользователя не могут иметь одинаковый email
```

**NOT NULL** — значение обязательно (не может быть пустым)
```typescript
@Column()           // NOT NULL по умолчанию
title: string;

@Column({ nullable: true })  // Может быть NULL
description: string;
```

**CASCADE** — каскадное удаление связанных записей
```typescript
@ManyToOne(() => User, { onDelete: 'CASCADE' })
// При удалении пользователя удалятся все его доски
```

---

## 📋 Чеклист этапа
- [x] Docker Compose для PostgreSQL
- [x] Создание User Entity
- [x] Создание Board Entity
- [x] Создание Image Entity
- [x] Создание Favorite Entity
- [x] Создание BoardImage Entity
- [x] Настройка связей между entities
- [x] Настройка миграций
- [x] Seed данные для разработки

---

## 1️⃣ Docker Compose для PostgreSQL

> 💡 **Что происходит**: Мы создаём конфигурацию для запуска PostgreSQL в Docker контейнере. Это избавляет от необходимости устанавливать PostgreSQL на компьютер.

### Файл: `docker-compose.db.yml` (в папке backend)

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine        # Образ PostgreSQL (alpine = минимальный размер)
    container_name: snapboard-db     # Имя контейнера
    environment:
      POSTGRES_USER: snapboard       # Имя пользователя БД
      POSTGRES_PASSWORD: snapboard123 # Пароль (в production используйте сложный!)
      POSTGRES_DB: snapboard         # Имя базы данных
    volumes:
      - postgres_data:/var/lib/postgresql/data  # Сохранение данных между перезапусками
    ports:
      - "5432:5432"                   # Порт: локальный:контейнер
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U snapboard"]  # Проверка готовности БД
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:  # Именованный volume для персистентности данных
```

### Запуск базы данных

```bash
# Запуск PostgreSQL (флаг -d = в фоновом режиме)
docker-compose -f docker-compose.db.yml up -d

# Проверка статуса (должен быть "Up")
docker-compose -f docker-compose.db.yml ps

# Просмотр логов (полезно при ошибках)
docker-compose -f docker-compose.db.yml logs -f

# Остановка и удаление контейнера
docker-compose -f docker-compose.db.yml down

# Остановка с удалением данных (ОСТОРОЖНО!)
docker-compose -f docker-compose.db.yml down -v
```

---

## 2️⃣ User Entity

> 💡 **Что происходит**: Создаём класс User, который описывает структуру таблицы `users` в базе данных. TypeORM использует декораторы (@Entity, @Column) для понимания, как преобразовать класс в таблицу.

### Файл: `src/modules/users/entities/user.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Board } from '../../boards/entities/board.entity';
import { Image } from '../../images/entities/image.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';

/**
 * Entity пользователя
 * Хранит данные аккаунта, профиля и связи с контентом
 * 
 * 📝 Декораторы TypeORM:
 * @Entity('users') - указывает имя таблицы в БД
 * @PrimaryGeneratedColumn('uuid') - автогенерируемый UUID как первичный ключ
 * @Column() - обычная колонка
 * @CreateDateColumn() - автоматически заполняется при создании записи
 * @UpdateDateColumn() - автоматически обновляется при изменении записи
 * @OneToMany() - связь "один ко многим"
 */
@Entity('users')
export class User {
  // UUID вместо числового ID (безопаснее, не раскрывает количество пользователей)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // unique: true - два пользователя не могут иметь одинаковый email
  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ unique: true, length: 50 })
  username: string;

  // name: 'password_hash' - имя колонки в БД отличается от имени свойства
  // @Exclude() - не включать в JSON ответы API (безопасность!)
  @Column({ name: 'password_hash', length: 255 })
  @Exclude()
  passwordHash: string;

  // nullable: true - поле может быть пустым (NULL в БД)
  @Column({ length: 100, nullable: true })
  name: string;

  // type: 'text' - неограниченная длина текста
  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ length: 500, nullable: true })
  avatar: string;

  // Refresh token хранится в БД для возможности инвалидации
  @Column({ name: 'refresh_token', length: 500, nullable: true })
  @Exclude()
  refreshToken: string;

  // Автоматически заполняется текущей датой при INSERT
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Автоматически обновляется при UPDATE
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ==================== RELATIONS ====================
  // Связи определяют, как таблицы связаны между собой

  /**
   * Доски пользователя
   * OneToMany: один пользователь → много досок
   * () => Board - ленивая загрузка (избегает циклических зависимостей)
   * (board) => board.user - обратная сторона связи
   */
  @OneToMany(() => Board, (board) => board.user)
  boards: Board[];

  @OneToMany(() => Image, (image) => image.user)
  images: Image[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];
}
```

---

## 3️⃣ Board Entity

### Файл: `src/modules/boards/entities/board.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Image } from '../../images/entities/image.entity';
import { BoardImage } from './board-image.entity';

/**
 * Entity доски (коллекции)
 * Доска - это тематическая коллекция изображений
 */
@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'user_id' })
  @Index('idx_boards_user_id')
  userId: string;

  @Column({ name: 'cover_image', length: 500, nullable: true })
  coverImage: string;

  @Column({ name: 'is_private', default: false })
  isPrivate: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ==================== RELATIONS ====================

  /**
   * Владелец доски
   * Связь многие-к-одному: много досок принадлежат одному пользователю
   */
  @ManyToOne(() => User, (user) => user.boards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * Изображения, загруженные на эту доску
   * Связь один-ко-многим: одна доска может содержать много изображений
   */
  @OneToMany(() => Image, (image) => image.board)
  images: Image[];

  /**
   * Сохранённые изображения с других досок
   * Связь через промежуточную таблицу board_images
   */
  @OneToMany(() => BoardImage, (boardImage) => boardImage.board)
  savedImages: BoardImage[];
}
```

---

## 4️⃣ Image Entity

### Файл: `src/modules/images/entities/image.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Board } from '../../boards/entities/board.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';
import { BoardImage } from '../../boards/entities/board-image.entity';

/**
 * Entity изображения
 * Хранит метаданные загруженного изображения
 */
@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  url: string;

  @Column({ length: 200, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'board_id', nullable: true })
  @Index('idx_images_board_id')
  boardId: string;

  @Column({ name: 'user_id' })
  @Index('idx_images_user_id')
  userId: string;

  @Column({ type: 'text', array: true, nullable: true })
  @Index('idx_images_tags', { synchronize: false }) // GIN индекс создаётся в миграции
  tags: string[];

  @Column({ type: 'int', nullable: true })
  width: number;

  @Column({ type: 'int', nullable: true })
  height: number;

  @Column({ type: 'int', nullable: true })
  size: number;

  @Column({ name: 'mime_type', length: 50, nullable: true })
  mimeType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // ==================== RELATIONS ====================

  /**
   * Доска, на которую загружено изображение
   * Связь многие-к-одному: много изображений на одной доске
   */
  @ManyToOne(() => Board, (board) => board.images, { 
    onDelete: 'CASCADE',
    nullable: true 
  })
  @JoinColumn({ name: 'board_id' })
  board: Board;

  /**
   * Владелец изображения
   * Связь многие-к-одному: много изображений у одного пользователя
   */
  @ManyToOne(() => User, (user) => user.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * Записи избранного для этого изображения
   * Связь один-ко-многим
   */
  @OneToMany(() => Favorite, (favorite) => favorite.image)
  favorites: Favorite[];

  /**
   * Сохранения на другие доски
   * Связь через промежуточную таблицу board_images
   */
  @OneToMany(() => BoardImage, (boardImage) => boardImage.image)
  boardImages: BoardImage[];
}
```

---

## 5️⃣ Favorite Entity

### Файл: `src/modules/favorites/entities/favorite.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Image } from '../../images/entities/image.entity';

/**
 * Entity избранного
 * Связь многие-ко-многим между пользователями и изображениями
 */
@Entity('favorites')
@Unique(['userId', 'imageId']) // Уникальная пара user-image
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index('idx_favorites_user_id')
  userId: string;

  @Column({ name: 'image_id' })
  imageId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // ==================== RELATIONS ====================

  /**
   * Пользователь, добавивший в избранное
   */
  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * Изображение в избранном
   */
  @ManyToOne(() => Image, (image) => image.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'image_id' })
  image: Image;
}
```

---

## 6️⃣ BoardImage Entity (для сохранения чужих изображений)

### Файл: `src/modules/boards/entities/board-image.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Board } from './board.entity';
import { Image } from '../../images/entities/image.entity';

/**
 * Entity для сохранения изображений на доски
 * Позволяет сохранять чужие изображения на свои доски
 */
@Entity('board_images')
@Unique(['boardId', 'imageId']) // Уникальная пара board-image
export class BoardImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'board_id' })
  @Index('idx_board_images_board_id')
  boardId: string;

  @Column({ name: 'image_id' })
  imageId: string;

  @CreateDateColumn({ name: 'saved_at' })
  savedAt: Date;

  // ==================== RELATIONS ====================

  /**
   * Доска, на которую сохранено изображение
   */
  @ManyToOne(() => Board, (board) => board.savedImages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'board_id' })
  board: Board;

  /**
   * Сохранённое изображение
   */
  @ManyToOne(() => Image, (image) => image.boardImages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'image_id' })
  image: Image;
}
```

---

## 7️⃣ Миграции

> 💡 **Что такое миграция?**
> 
> Миграция — это "рецепт" изменения структуры базы данных. Представь, что ты работаешь в команде:
> - Ты добавил новую колонку в таблицу
> - Коллега должен сделать то же самое у себя
> - На production сервере тоже нужно обновить БД
> 
> Миграции решают эту проблему — они хранят историю изменений БД в коде.

### Почему файл называется `1704067200000-InitialSchema.ts`?

```
1704067200000-InitialSchema.ts
│             │
│             └── Человекочитаемое название (что делает миграция)
│
└── Timestamp (Unix время в миллисекундах)
    = 1 января 2024, 00:00:00 UTC
```

**Зачем timestamp?**
1. **Уникальность** — две миграции не могут иметь одинаковое имя
2. **Порядок выполнения** — миграции запускаются от старых к новым
3. **Отслеживание** — TypeORM помнит, какие миграции уже выполнены

### Создание миграции

```bash
# Автоматическая генерация миграции из изменений в entities
npm run migration:generate -- -n AddUserAvatar

# Создание пустой миграции (для ручного написания SQL)
npm run typeorm migration:create -- -n InitialSchema

# Запуск всех непримененных миграций
npm run migration:run

# Откат последней миграции
npm run migration:revert
```

### Файл: `src/database/migrations/1704067200000-InitialSchema.ts`

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Начальная миграция — создаёт все таблицы с нуля
 * 
 * 📝 Структура миграции:
 * - up() — применить изменения (CREATE TABLE, ADD COLUMN)
 * - down() — откатить изменения (DROP TABLE, DROP COLUMN)
 * 
 * ⚠️ Важно: down() должен полностью отменять up()
 */
export class InitialSchema1704067200000 implements MigrationInterface {
  name = 'InitialSchema1704067200000';

  /**
   * Применение миграции (npm run migration:run)
   * Выполняется один раз, TypeORM запоминает в таблице migrations
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ========== ТАБЛИЦА USERS ==========
    // gen_random_uuid() — PostgreSQL функция для генерации UUID
    // CONSTRAINT — ограничения (уникальность, первичный ключ)
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying(255) NOT NULL,
        "username" character varying(50) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "name" character varying(100),
        "bio" text,
        "avatar" character varying(500),
        "refresh_token" character varying(500),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // ========== ТАБЛИЦА BOARDS ==========
    // FOREIGN KEY — связь с таблицей users
    // ON DELETE CASCADE — при удалении пользователя удалятся все его доски
    await queryRunner.query(`
      CREATE TABLE "boards" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying(100) NOT NULL,
        "description" text,
        "user_id" uuid NOT NULL,
        "cover_image" character varying(500),
        "is_private" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_boards" PRIMARY KEY ("id"),
        CONSTRAINT "FK_boards_user" FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // ========== ТАБЛИЦА IMAGES ==========
    // text[] — массив строк (PostgreSQL специфичный тип для тегов)
    await queryRunner.query(`
      CREATE TABLE "images" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "url" character varying(500) NOT NULL,
        "title" character varying(200),
        "description" text,
        "board_id" uuid,
        "user_id" uuid NOT NULL,
        "tags" text[],
        "width" integer,
        "height" integer,
        "size" integer,
        "mime_type" character varying(50),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_images" PRIMARY KEY ("id"),
        CONSTRAINT "FK_images_board" FOREIGN KEY ("board_id") 
          REFERENCES "boards"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_images_user" FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // ========== ТАБЛИЦА FAVORITES ==========
    // UNIQUE (user_id, image_id) — пользователь не может добавить одно изображение дважды
    await queryRunner.query(`
      CREATE TABLE "favorites" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "image_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_favorites" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_favorites_user_image" UNIQUE ("user_id", "image_id"),
        CONSTRAINT "FK_favorites_user" FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_favorites_image" FOREIGN KEY ("image_id") 
          REFERENCES "images"("id") ON DELETE CASCADE
      )
    `);

    // ========== ТАБЛИЦА BOARD_IMAGES ==========
    // Промежуточная таблица для сохранения чужих изображений на свои доски
    await queryRunner.query(`
      CREATE TABLE "board_images" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "board_id" uuid NOT NULL,
        "image_id" uuid NOT NULL,
        "saved_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_board_images" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_board_images_board_image" UNIQUE ("board_id", "image_id"),
        CONSTRAINT "FK_board_images_board" FOREIGN KEY ("board_id") 
          REFERENCES "boards"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_board_images_image" FOREIGN KEY ("image_id") 
          REFERENCES "images"("id") ON DELETE CASCADE
      )
    `);

    // ========== ИНДЕКСЫ ==========
    // Индексы ускоряют поиск по часто используемым колонкам
    await queryRunner.query(`CREATE INDEX "idx_boards_user_id" ON "boards" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_images_board_id" ON "images" ("board_id")`);
    await queryRunner.query(`CREATE INDEX "idx_images_user_id" ON "images" ("user_id")`);
    
    // GIN индекс — специальный индекс для поиска по массивам (тегам)
    await queryRunner.query(`CREATE INDEX "idx_images_tags" ON "images" USING GIN ("tags")`);
    
    await queryRunner.query(`CREATE INDEX "idx_favorites_user_id" ON "favorites" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_board_images_board_id" ON "board_images" ("board_id")`);
  }

  /**
   * Откат миграции (npm run migration:revert)
   * Удаляет всё, что создал up() — в обратном порядке!
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Сначала удаляем индексы
    await queryRunner.query(`DROP INDEX "idx_board_images_board_id"`);
    await queryRunner.query(`DROP INDEX "idx_favorites_user_id"`);
    await queryRunner.query(`DROP INDEX "idx_images_tags"`);
    await queryRunner.query(`DROP INDEX "idx_images_user_id"`);
    await queryRunner.query(`DROP INDEX "idx_images_board_id"`);
    await queryRunner.query(`DROP INDEX "idx_boards_user_id"`);

    // Затем таблицы (в обратном порядке из-за foreign keys!)
    // Нельзя удалить users, пока существуют boards, которые на неё ссылаются
    await queryRunner.query(`DROP TABLE "board_images"`);
    await queryRunner.query(`DROP TABLE "favorites"`);
    await queryRunner.query(`DROP TABLE "images"`);
    await queryRunner.query(`DROP TABLE "boards"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
```

---

## 8️⃣ Настройка TypeORM CLI

### Обновите `package.json`

```json
{
  "scripts": {
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js",
    "migration:generate": "npm run typeorm -- migration:generate -d src/config/typeorm.config.ts",
    "migration:run": "npm run typeorm -- migration:run -d src/config/typeorm.config.ts",
    "migration:revert": "npm run typeorm -- migration:revert -d src/config/typeorm.config.ts"
  }
}
```

### Файл: `src/config/typeorm.config.ts` (для CLI)

```typescript
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Конфигурация TypeORM для CLI (миграции)
 */
export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USER || 'snapboard',
  password: process.env.DATABASE_PASSWORD || 'snapboard123',
  database: process.env.DATABASE_NAME || 'snapboard',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
```

---

## 9️⃣ Seed данные для разработки

> 💡 **Что такое Seed?**
> 
> Seed (от англ. "семя") — это скрипт для заполнения базы данных начальными данными.
> 
> **Зачем нужен:**
> - Создать тестового пользователя для разработки (не регистрироваться каждый раз)
> - Заполнить БД демо-данными для тестирования UI
> - Быстро восстановить БД после очистки
> 
> **Аналогия с frontend:** Seed — это как mock данные в Storybook, но для базы данных.

### Файл: `src/database/seeds/seed.ts`

```typescript
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/entities/user.entity';
import { Board } from '../../modules/boards/entities/board.entity';

/**
 * Seed данные для разработки
 * 
 * 📝 Что создаёт:
 * - Тестовый пользователь: test@example.com / password123
 * - 3 доски: Design Inspiration, Travel Photos, Private Collection
 */
export async function seed(dataSource: DataSource): Promise<void> {
  // Repository — это "менеджер" для работы с конкретной таблицей
  // Аналог: как отдельный API endpoint для каждой сущности
  const userRepository = dataSource.getRepository(User);
  const boardRepository = dataSource.getRepository(Board);

  // Проверяем, есть ли уже данные (чтобы не дублировать)
  const existingUser = await userRepository.findOne({
    where: { email: 'test@example.com' },
  });

  if (existingUser) {
    console.log('⚠️ Seed data already exists, skipping...');
    return;
  }

  // bcrypt.hash() — хеширование пароля
  // 10 — количество "раундов" хеширования (больше = безопаснее, но медленнее)
  // НИКОГДА не храните пароли в открытом виде!
  const passwordHash = await bcrypt.hash('password123', 10);

  // create() — создаёт объект, но НЕ сохраняет в БД
  // save() — сохраняет объект в БД
  const user = userRepository.create({
    email: 'test@example.com',
    username: 'testuser',
    passwordHash,
    name: 'Test User',
    bio: 'This is a test user for development',
  });

  await userRepository.save(user);
  console.log('✅ Created test user:', user.email);

  // Создаём тестовые доски
  const boardsData = [
    {
      title: 'Design Inspiration',
      description: 'UI/UX design ideas and inspiration',
      isPrivate: false,  // Публичная доска
    },
    {
      title: 'Travel Photos',
      description: 'Beautiful places to visit around the world',
      isPrivate: false,
    },
    {
      title: 'Private Collection',
      description: 'My private images collection',
      isPrivate: true,   // Приватная доска (видна только владельцу)
    },
  ];

  for (const boardData of boardsData) {
    const board = boardRepository.create({
      ...boardData,
      userId: user.id,  // Связываем доску с пользователем
    });
    await boardRepository.save(board);
    console.log('✅ Created board:', board.title);
  }

  console.log('🎉 Seed completed successfully!');
}
```

### Запуск seed

```bash
# Запустить seed (создаст тестовые данные)
npm run seed

# Тестовые данные для входа:
# Email: test@example.com
# Password: password123
```

---

## ✅ Результат этапа

После завершения этапа у вас будут:

1. ✅ Docker Compose для PostgreSQL
2. ✅ User Entity с полями профиля и связями
3. ✅ Board Entity с приватностью и cover image
4. ✅ Image Entity с метаданными и тегами
5. ✅ Favorite Entity для избранного
6. ✅ BoardImage Entity для сохранения чужих изображений
7. ✅ Настроенные миграции
8. ✅ Seed данные для разработки

---

## 🗄️ Схема базы данных

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   users     │     │   boards    │     │   images    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │◄────│ user_id (FK)│     │ id (PK)     │
│ email       │     │ id (PK)     │◄────│ board_id(FK)│
│ username    │     │ title       │     │ user_id (FK)│──►
│ password    │     │ description │     │ url         │
│ name        │     │ cover_image │     │ title       │
│ bio         │     │ is_private  │     │ tags[]      │
│ avatar      │     │ created_at  │     │ width/height│
│ refresh_tkn │     │ updated_at  │     │ created_at  │
│ created_at  │     └─────────────┘     └─────────────┘
│ updated_at  │            │                   │
└─────────────┘            │                   │
       │                   │                   │
       │            ┌──────┴──────┐            │
       │            │board_images │            │
       │            ├─────────────┤            │
       │            │ board_id(FK)│────────────┘
       │            │ image_id(FK)│
       │            │ saved_at    │
       │            └─────────────┘
       │
       │            ┌─────────────┐
       └───────────►│  favorites  │
                    ├─────────────┤
                    │ user_id (FK)│
                    │ image_id(FK)│────────────►
                    │ created_at  │
                    └─────────────┘
```

---

## 📝 Следующий этап

**Этап 3: Модуль аутентификации (Auth)** - регистрация, вход, JWT токены, защита роутов.

---

## 🚀 Быстрый старт (все команды)

```bash
# 1. Запустить PostgreSQL в Docker
docker-compose -f docker-compose.db.yml up -d

# 2. Проверить, что БД запустилась
docker-compose -f docker-compose.db.yml ps

# 3. Запустить миграции (создать таблицы)
npm run migration:run

# 4. Заполнить тестовыми данными
npm run seed

# 5. Запустить backend
npm run start:dev
```

### Полезные команды

```bash
# Посмотреть логи PostgreSQL
docker-compose -f docker-compose.db.yml logs -f

# Подключиться к БД через psql (внутри контейнера)
docker exec -it snapboard-db psql -U snapboard -d snapboard

# Посмотреть все таблицы
\dt

# Посмотреть структуру таблицы users
\d users

# Выйти из psql
\q

# Остановить PostgreSQL
docker-compose -f docker-compose.db.yml down

# Удалить PostgreSQL вместе с данными (ОСТОРОЖНО!)
docker-compose -f docker-compose.db.yml down -v
```

---

## ❓ FAQ (Частые вопросы)

**Q: Зачем UUID вместо числового ID?**
A: UUID безопаснее — не раскрывает количество записей. Числовой ID = 1000 говорит, что есть ~1000 пользователей.

**Q: Почему пароль хранится как hash, а не plain text?**
A: Безопасность! Если БД утечёт, хакеры не смогут узнать пароли. bcrypt — односторонний алгоритм.

**Q: Что такое CASCADE в foreign key?**
A: При удалении родительской записи автоматически удаляются дочерние. Удалил пользователя → удалились все его доски.

**Q: Зачем нужны индексы?**
A: Ускоряют поиск. Без индекса БД просматривает ВСЕ записи. С индексом — находит мгновенно.

**Q: Можно ли изменить миграцию после запуска?**
A: Нет! Создайте новую миграцию с изменениями. Старые миграции — это история.
