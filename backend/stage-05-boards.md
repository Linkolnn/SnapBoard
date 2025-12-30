# Этап 5: Модуль досок (Boards)

> **Статус:** В разработке
> 
> **Зависимости:** Этап 4 (Users) ✅
> 
> **Сервер:** http://localhost:3001/api
> 
> **Swagger:** http://localhost:3001/api/docs

---

## 🎯 Цель этапа

Реализовать полноценный модуль управления досками (коллекциями): создание, получение, обновление, удаление досок, управление приватностью, а также сохранение/удаление изображений на доски.

---

## 📚 Глоссарий (для frontend разработчиков)

### 📋 Board (Доска)

**Board** — тематическая коллекция изображений. Пользователь может создавать неограниченное количество досок для организации своего контента.

### 🖼️ Cover Image

**Cover Image** — обложка доски. Автоматически устанавливается из первого изображения на доске или может быть задана вручную.

### 🔒 Private Board

**Private Board** — приватная доска, видимая только владельцу. Публичные доски видны всем пользователям.

### 📌 Board Images

**Board Images** — связь между досками и изображениями. Позволяет:
- Загружать собственные изображения на доску
- Сохранять чужие изображения на свои доски (без копирования файла)

### 📊 Images Count

**Images Count** — общее количество изображений на доске (собственные + сохранённые).

---

## 📁 Структура файлов

```
backend/src/modules/boards/
├── boards.module.ts              # Модуль
├── boards.controller.ts          # Контроллер
├── boards.service.ts             # Сервис
├── entities/
│   ├── index.ts                  # Экспорт entities
│   ├── board.entity.ts           # Entity доски (уже есть)
│   └── board-image.entity.ts     # Entity связи (уже есть)
└── dto/
    ├── index.ts                  # Экспорт всех DTO
    ├── create-board.dto.ts       # DTO создания доски
    ├── update-board.dto.ts       # DTO обновления доски
    ├── board-response.dto.ts     # DTO ответа доски
    ├── board-query.dto.ts        # DTO query параметров
    └── add-image.dto.ts          # DTO добавления изображения
```

---

## 📝 API Endpoints

### GET /api/boards

Получение списка досок с пагинацией.

**Доступ:** Публичный (с ограничениями)
- Неавторизованные пользователи видят только публичные доски
- Авторизованные пользователи видят публичные доски + свои приватные

**Query параметры:**
| Параметр | Тип | Default | Описание |
|----------|-----|---------|----------|
| page | number | 1 | Номер страницы |
| pageSize | number | 12 | Размер страницы (max: 50) |
| userId | string | - | Фильтр по владельцу |
| query | string | - | Поиск по названию/описанию |
| sortBy | string | newest | Сортировка: newest, oldest, title_asc, title_desc |

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Inspiration",
      "description": "My design inspiration",
      "coverImage": "/uploads/images/cover.jpg",
      "isPrivate": false,
      "imagesCount": 15,
      "user": {
        "id": "uuid",
        "username": "johndoe",
        "avatar": "/uploads/avatars/avatar.jpg"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 12,
  "totalItems": 25,
  "totalPages": 3,
  "hasMore": true
}
```

---

### POST /api/boards

Создание новой доски.

**Headers:** `Cookie: access_token=...` или `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "My New Board",
  "description": "Collection of beautiful landscapes",
  "isPrivate": false
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "title": "My New Board",
  "description": "Collection of beautiful landscapes",
  "coverImage": null,
  "isPrivate": false,
  "imagesCount": 0,
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "avatar": "/uploads/avatars/avatar.jpg"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:**
- `400` — Невалидные данные
- `401` — Не авторизован

---

### GET /api/boards/:id

Получение одной доски по ID.

**Доступ:** 
- Публичные доски — доступны всем
- Приватные доски — только владельцу

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Inspiration",
  "description": "My design inspiration",
  "coverImage": "/uploads/images/cover.jpg",
  "isPrivate": false,
  "imagesCount": 15,
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "avatar": "/uploads/avatars/avatar.jpg"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:**
- `403` — Доступ запрещён (приватная доска)
- `404` — Доска не найдена

---

### PUT /api/boards/:id

Обновление доски.

**Headers:** `Cookie: access_token=...`

**Request:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "isPrivate": true,
  "coverImage": "/uploads/images/new-cover.jpg"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Updated Title",
  "description": "Updated description",
  "coverImage": "/uploads/images/new-cover.jpg",
  "isPrivate": true,
  "imagesCount": 15,
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "avatar": "/uploads/avatars/avatar.jpg"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

**Errors:**
- `400` — Невалидные данные
- `401` — Не авторизован
- `403` — Нет прав на редактирование
- `404` — Доска не найдена

---

### DELETE /api/boards/:id

Удаление доски.

**Headers:** `Cookie: access_token=...`

**Response (200):**
```json
{
  "message": "Доска удалена"
}
```

**Errors:**
- `401` — Не авторизован
- `403` — Нет прав на удаление
- `404` — Доска не найдена

> **Важно:** При удалении доски удаляются все изображения, загруженные на эту доску. Сохранённые изображения (с других досок) не удаляются — удаляется только связь.

---

### GET /api/boards/:id/images

Получение изображений доски с пагинацией.

**Доступ:** 
- Публичные доски — доступны всем
- Приватные доски — только владельцу

**Query параметры:**
| Параметр | Тип | Default | Описание |
|----------|-----|---------|----------|
| page | number | 1 | Номер страницы |
| pageSize | number | 12 | Размер страницы (max: 50) |

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "url": "/uploads/images/image.jpg",
      "title": "Sunset",
      "description": "Beautiful sunset",
      "tags": ["nature", "sunset"],
      "width": 1920,
      "height": 1080,
      "isSaved": false,
      "user": {
        "id": "uuid",
        "username": "johndoe"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 12,
  "totalItems": 15,
  "totalPages": 2,
  "hasMore": true
}
```

> **Примечание:** Поле `isSaved` указывает, является ли изображение сохранённым с другой доски (true) или загруженным на эту доску (false).

---

### POST /api/boards/:id/images

Сохранение изображения на доску.

**Headers:** `Cookie: access_token=...`

**Request:**
```json
{
  "imageId": "uuid"
}
```

**Response (201):**
```json
{
  "message": "Изображение сохранено на доску",
  "boardId": "uuid",
  "imageId": "uuid",
  "savedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:**
- `400` — Изображение уже на доске
- `401` — Не авторизован
- `403` — Нет прав на доску
- `404` — Доска или изображение не найдены

---

### DELETE /api/boards/:id/images

Удаление изображения с доски.

**Headers:** `Cookie: access_token=...`

**Request:**
```json
{
  "imageId": "uuid"
}
```

**Response (200):**
```json
{
  "message": "Изображение удалено с доски"
}
```

**Errors:**
- `401` — Не авторизован
- `403` — Нет прав на доску
- `404` — Доска или изображение не найдены

> **Важно:** Если изображение было загружено на эту доску (не сохранено), оно будет полностью удалено. Если изображение было сохранено с другой доски — удаляется только связь.

---

## 💻 Реализация

### DTOs

#### create-board.dto.ts

```typescript
import { IsString, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для создания доски
 */
export class CreateBoardDto {
  @ApiProperty({
    example: 'My Inspiration Board',
    description: 'Название доски (1-100 символов)',
  })
  @IsString()
  @MinLength(1, { message: 'Название обязательно' })
  @MaxLength(100, { message: 'Название должно быть максимум 100 символов' })
  title: string;

  @ApiProperty({
    example: 'Collection of beautiful landscapes and nature photos',
    description: 'Описание доски (до 500 символов)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Описание должно быть максимум 500 символов' })
  description?: string;

  @ApiProperty({
    example: false,
    description: 'Приватная доска (видна только владельцу)',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
```

#### update-board.dto.ts

```typescript
import { IsString, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для обновления доски
 */
export class UpdateBoardDto {
  @ApiProperty({
    example: 'Updated Board Title',
    description: 'Название доски (1-100 символов)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Название не может быть пустым' })
  @MaxLength(100, { message: 'Название должно быть максимум 100 символов' })
  title?: string;

  @ApiProperty({
    example: 'Updated description',
    description: 'Описание доски (до 500 символов)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Описание должно быть максимум 500 символов' })
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Приватная доска',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @ApiProperty({
    example: '/uploads/images/cover.jpg',
    description: 'URL обложки доски',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImage?: string;
}
```

#### board-query.dto.ts

```typescript
import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum BoardSortBy {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  TITLE_ASC = 'title_asc',
  TITLE_DESC = 'title_desc',
}

/**
 * DTO для query параметров списка досок
 */
export class BoardQueryDto {
  @ApiProperty({ example: 1, required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 12, required: false, default: 12, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number = 12;

  @ApiProperty({ example: 'uuid', required: false, description: 'Фильтр по владельцу' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: 'inspiration', required: false, description: 'Поиск по названию/описанию' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ 
    enum: BoardSortBy, 
    required: false, 
    default: BoardSortBy.NEWEST,
    description: 'Сортировка' 
  })
  @IsOptional()
  @IsEnum(BoardSortBy)
  sortBy?: BoardSortBy = BoardSortBy.NEWEST;
}
```

#### add-image.dto.ts

```typescript
import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для добавления/удаления изображения на доску
 */
export class AddImageDto {
  @ApiProperty({
    example: 'uuid',
    description: 'ID изображения',
  })
  @IsUUID('4', { message: 'Некорректный ID изображения' })
  imageId: string;
}
```

#### board-response.dto.ts

```typescript
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO владельца доски (краткая информация)
 */
export class BoardUserDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: '/uploads/avatars/avatar.jpg', nullable: true })
  avatar: string | null;
}

/**
 * DTO ответа доски
 */
export class BoardResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'My Inspiration Board' })
  title: string;

  @ApiProperty({ example: 'Collection of beautiful images', nullable: true })
  description: string | null;

  @ApiProperty({ example: '/uploads/images/cover.jpg', nullable: true })
  coverImage: string | null;

  @ApiProperty({ example: false })
  isPrivate: boolean;

  @ApiProperty({ example: 15 })
  imagesCount: number;

  @ApiProperty({ type: BoardUserDto })
  user: BoardUserDto;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

/**
 * DTO пагинированного ответа досок
 */
export class PaginatedBoardsResponseDto {
  @ApiProperty({ type: [BoardResponseDto] })
  items: BoardResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 12 })
  pageSize: number;

  @ApiProperty({ example: 25 })
  totalItems: number;

  @ApiProperty({ example: 3 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasMore: boolean;
}
```

#### dto/index.ts

```typescript
export * from './create-board.dto';
export * from './update-board.dto';
export * from './board-query.dto';
export * from './add-image.dto';
export * from './board-response.dto';
```

---

### boards.service.ts

```typescript
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Board } from './entities/board.entity';
import { BoardImage } from './entities/board-image.entity';
import { Image } from '../images/entities/image.entity';
import { CreateBoardDto, UpdateBoardDto, BoardQueryDto, BoardSortBy } from './dto';

/**
 * Сервис для работы с досками
 */
@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardsRepository: Repository<Board>,
    @InjectRepository(BoardImage)
    private boardImagesRepository: Repository<BoardImage>,
    @InjectRepository(Image)
    private imagesRepository: Repository<Image>,
  ) {}

  // ==================== CRUD OPERATIONS ====================

  /**
   * Создание новой доски
   */
  async create(userId: string, createDto: CreateBoardDto): Promise<Board> {
    const board = this.boardsRepository.create({
      ...createDto,
      userId,
      isPrivate: createDto.isPrivate ?? false,
    });

    return await this.boardsRepository.save(board);
  }

  /**
   * Получение списка досок с пагинацией
   */
  async findAll(
    queryDto: BoardQueryDto,
    currentUserId?: string,
  ): Promise<{
    items: Board[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasMore: boolean;
  }> {
    const { page = 1, pageSize = 12, userId, query, sortBy = BoardSortBy.NEWEST } = queryDto;

    const queryBuilder = this.boardsRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.user', 'user')
      .loadRelationCountAndMap('board.imagesCount', 'board.images')
      .loadRelationCountAndMap('board.savedImagesCount', 'board.savedImages');

    // Фильтр по приватности
    if (currentUserId) {
      // Авторизованный пользователь видит публичные + свои приватные
      queryBuilder.andWhere(
        '(board.isPrivate = false OR board.userId = :currentUserId)',
        { currentUserId },
      );
    } else {
      // Неавторизованный видит только публичные
      queryBuilder.andWhere('board.isPrivate = false');
    }

    // Фильтр по владельцу
    if (userId) {
      queryBuilder.andWhere('board.userId = :userId', { userId });
    }

    // Поиск по названию/описанию
    if (query) {
      queryBuilder.andWhere(
        '(LOWER(board.title) LIKE LOWER(:query) OR LOWER(board.description) LIKE LOWER(:query))',
        { query: `%${query}%` },
      );
    }

    // Сортировка
    this.applySorting(queryBuilder, sortBy);

    // Пагинация
    const totalItems = await queryBuilder.getCount();
    const totalPages = Math.ceil(totalItems / pageSize);

    const items = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return {
      items,
      page,
      pageSize,
      totalItems,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  /**
   * Получение одной доски по ID
   */
  async findOne(id: string, currentUserId?: string): Promise<Board> {
    const board = await this.boardsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!board) {
      throw new NotFoundException('Доска не найдена');
    }

    // Проверка доступа к приватной доске
    if (board.isPrivate && board.userId !== currentUserId) {
      throw new ForbiddenException('Доступ к приватной доске запрещён');
    }

    // Подсчёт изображений
    const imagesCount = await this.getImagesCount(id);
    (board as any).imagesCount = imagesCount;

    return board;
  }

  /**
   * Обновление доски
   */
  async update(id: string, userId: string, updateDto: UpdateBoardDto): Promise<Board> {
    const board = await this.findOneForOwner(id, userId);

    // Обновляем только переданные поля
    Object.assign(board, updateDto);

    return await this.boardsRepository.save(board);
  }

  /**
   * Удаление доски
   */
  async remove(id: string, userId: string): Promise<void> {
    const board = await this.findOneForOwner(id, userId);
    await this.boardsRepository.remove(board);
  }

  // ==================== BOARD IMAGES ====================

  /**
   * Получение изображений доски
   */
  async getBoardImages(
    boardId: string,
    page: number = 1,
    pageSize: number = 12,
    currentUserId?: string,
  ): Promise<{
    items: any[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasMore: boolean;
  }> {
    // Проверяем доступ к доске
    await this.findOne(boardId, currentUserId);

    // Получаем собственные изображения доски
    const ownImages = await this.imagesRepository
      .createQueryBuilder('image')
      .leftJoinAndSelect('image.user', 'user')
      .where('image.boardId = :boardId', { boardId })
      .getMany();

    // Получаем сохранённые изображения
    const savedImages = await this.boardImagesRepository
      .createQueryBuilder('bi')
      .leftJoinAndSelect('bi.image', 'image')
      .leftJoinAndSelect('image.user', 'user')
      .where('bi.boardId = :boardId', { boardId })
      .getMany();

    // Объединяем и помечаем
    const allImages = [
      ...ownImages.map((img) => ({ ...img, isSaved: false })),
      ...savedImages.map((bi) => ({ ...bi.image, isSaved: true, savedAt: bi.savedAt })),
    ];

    // Сортируем по дате (новые первые)
    allImages.sort((a, b) => {
      const dateA = (a as any).savedAt || a.createdAt;
      const dateB = (b as any).savedAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    // Пагинация
    const totalItems = allImages.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const items = allImages.slice(startIndex, startIndex + pageSize);

    return {
      items,
      page,
      pageSize,
      totalItems,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  /**
   * Сохранение изображения на доску
   */
  async addImageToBoard(
    boardId: string,
    imageId: string,
    userId: string,
  ): Promise<BoardImage> {
    // Проверяем, что доска принадлежит пользователю
    await this.findOneForOwner(boardId, userId);

    // Проверяем, что изображение существует
    const image = await this.imagesRepository.findOne({ where: { id: imageId } });
    if (!image) {
      throw new NotFoundException('Изображение не найдено');
    }

    // Проверяем, что изображение ещё не на этой доске
    const existing = await this.boardImagesRepository.findOne({
      where: { boardId, imageId },
    });
    if (existing) {
      throw new ConflictException('Изображение уже на этой доске');
    }

    // Если изображение уже принадлежит этой доске (загружено на неё)
    if (image.boardId === boardId) {
      throw new ConflictException('Изображение уже загружено на эту доску');
    }

    // Создаём связь
    const boardImage = this.boardImagesRepository.create({
      boardId,
      imageId,
    });

    const saved = await this.boardImagesRepository.save(boardImage);

    // Обновляем обложку если это первое изображение
    await this.updateCoverImageIfNeeded(boardId);

    return saved;
  }

  /**
   * Удаление изображения с доски
   */
  async removeImageFromBoard(
    boardId: string,
    imageId: string,
    userId: string,
  ): Promise<void> {
    // Проверяем, что доска принадлежит пользователю
    await this.findOneForOwner(boardId, userId);

    // Проверяем, является ли изображение сохранённым или загруженным
    const boardImage = await this.boardImagesRepository.findOne({
      where: { boardId, imageId },
    });

    if (boardImage) {
      // Это сохранённое изображение — удаляем только связь
      await this.boardImagesRepository.remove(boardImage);
    } else {
      // Это может быть загруженное изображение
      const image = await this.imagesRepository.findOne({
        where: { id: imageId, boardId },
      });

      if (!image) {
        throw new NotFoundException('Изображение не найдено на этой доске');
      }

      // Удаляем изображение полностью
      await this.imagesRepository.remove(image);
    }

    // Обновляем обложку
    await this.updateCoverImageIfNeeded(boardId);
  }

  // ==================== USER BOARDS (для profile) ====================

  /**
   * Получение досок пользователя (для /api/profile/boards)
   */
  async getUserBoards(
    userId: string,
    page: number = 1,
    pageSize: number = 12,
  ): Promise<{
    items: Board[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasMore: boolean;
  }> {
    const queryBuilder = this.boardsRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.user', 'user')
      .where('board.userId = :userId', { userId })
      .orderBy('board.createdAt', 'DESC');

    const totalItems = await queryBuilder.getCount();
    const totalPages = Math.ceil(totalItems / pageSize);

    const items = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    // Добавляем подсчёт изображений
    for (const board of items) {
      (board as any).imagesCount = await this.getImagesCount(board.id);
    }

    return {
      items,
      page,
      pageSize,
      totalItems,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Получение доски с проверкой владельца
   */
  private async findOneForOwner(id: string, userId: string): Promise<Board> {
    const board = await this.boardsRepository.findOne({
      where: { id },
    });

    if (!board) {
      throw new NotFoundException('Доска не найдена');
    }

    if (board.userId !== userId) {
      throw new ForbiddenException('Нет прав на эту доску');
    }

    return board;
  }

  /**
   * Подсчёт изображений на доске
   */
  private async getImagesCount(boardId: string): Promise<number> {
    const ownCount = await this.imagesRepository.count({
      where: { boardId },
    });

    const savedCount = await this.boardImagesRepository.count({
      where: { boardId },
    });

    return ownCount + savedCount;
  }

  /**
   * Обновление обложки доски
   */
  private async updateCoverImageIfNeeded(boardId: string): Promise<void> {
    const board = await this.boardsRepository.findOne({ where: { id: boardId } });
    if (!board) return;

    // Если обложка уже установлена вручную, не меняем
    if (board.coverImage) return;

    // Ищем первое изображение
    const firstImage = await this.imagesRepository.findOne({
      where: { boardId },
      order: { createdAt: 'ASC' },
    });

    if (firstImage) {
      board.coverImage = firstImage.url;
      await this.boardsRepository.save(board);
    }
  }

  /**
   * Применение сортировки
   */
  private applySorting(
    queryBuilder: SelectQueryBuilder<Board>,
    sortBy: BoardSortBy,
  ): void {
    switch (sortBy) {
      case BoardSortBy.OLDEST:
        queryBuilder.orderBy('board.createdAt', 'ASC');
        break;
      case BoardSortBy.TITLE_ASC:
        queryBuilder.orderBy('board.title', 'ASC');
        break;
      case BoardSortBy.TITLE_DESC:
        queryBuilder.orderBy('board.title', 'DESC');
        break;
      case BoardSortBy.NEWEST:
      default:
        queryBuilder.orderBy('board.createdAt', 'DESC');
        break;
    }
  }
}
```

---

### boards.controller.ts

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BoardsService } from './boards.service';
import {
  CreateBoardDto,
  UpdateBoardDto,
  BoardQueryDto,
  AddImageDto,
  BoardResponseDto,
  PaginatedBoardsResponseDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Контроллер досок
 * 
 * API Endpoints:
 * GET    /api/boards            — список досок
 * POST   /api/boards            — создать доску
 * GET    /api/boards/:id        — получить доску
 * PUT    /api/boards/:id        — обновить доску
 * DELETE /api/boards/:id        — удалить доску
 * GET    /api/boards/:id/images — изображения доски
 * POST   /api/boards/:id/images — сохранить изображение
 * DELETE /api/boards/:id/images — удалить изображение
 */
@ApiTags('Boards')
@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  /**
   * Получение списка досок
   */
  @Get()
  @Public()
  @ApiOperation({ summary: 'Получить список досок' })
  @ApiResponse({ status: 200, description: 'Список досок', type: PaginatedBoardsResponseDto })
  async findAll(
    @Query() queryDto: BoardQueryDto,
    @CurrentUser('userId') userId?: string,
  ) {
    const result = await this.boardsService.findAll(queryDto, userId);
    return {
      ...result,
      items: result.items.map((board) => this.formatBoard(board)),
    };
  }

  /**
   * Создание новой доски
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать доску' })
  @ApiResponse({ status: 201, description: 'Доска создана', type: BoardResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async create(
    @CurrentUser('userId') userId: string,
    @Body() createDto: CreateBoardDto,
  ) {
    const board = await this.boardsService.create(userId, createDto);
    return this.formatBoard(board);
  }

  /**
   * Получение одной доски
   */
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Получить доску по ID' })
  @ApiParam({ name: 'id', description: 'ID доски' })
  @ApiResponse({ status: 200, description: 'Доска', type: BoardResponseDto })
  @ApiResponse({ status: 403, description: 'Доступ запрещён' })
  @ApiResponse({ status: 404, description: 'Доска не найдена' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId?: string,
  ) {
    const board = await this.boardsService.findOne(id, userId);
    return this.formatBoard(board);
  }

  /**
   * Обновление доски
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить доску' })
  @ApiParam({ name: 'id', description: 'ID доски' })
  @ApiResponse({ status: 200, description: 'Доска обновлена', type: BoardResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав' })
  @ApiResponse({ status: 404, description: 'Доска не найдена' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @Body() updateDto: UpdateBoardDto,
  ) {
    const board = await this.boardsService.update(id, userId, updateDto);
    return this.formatBoard(board);
  }

  /**
   * Удаление доски
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить доску' })
  @ApiParam({ name: 'id', description: 'ID доски' })
  @ApiResponse({ status: 200, description: 'Доска удалена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав' })
  @ApiResponse({ status: 404, description: 'Доска не найдена' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
  ) {
    await this.boardsService.remove(id, userId);
    return { message: 'Доска удалена' };
  }

  /**
   * Получение изображений доски
   */
  @Get(':id/images')
  @Public()
  @ApiOperation({ summary: 'Получить изображения доски' })
  @ApiParam({ name: 'id', description: 'ID доски' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Список изображений' })
  @ApiResponse({ status: 403, description: 'Доступ запрещён' })
  @ApiResponse({ status: 404, description: 'Доска не найдена' })
  async getBoardImages(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @CurrentUser('userId') userId?: string,
  ) {
    return this.boardsService.getBoardImages(
      id,
      page || 1,
      pageSize || 12,
      userId,
    );
  }

  /**
   * Сохранение изображения на доску
   */
  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Сохранить изображение на доску' })
  @ApiParam({ name: 'id', description: 'ID доски' })
  @ApiResponse({ status: 201, description: 'Изображение сохранено' })
  @ApiResponse({ status: 400, description: 'Изображение уже на доске' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав' })
  @ApiResponse({ status: 404, description: 'Доска или изображение не найдены' })
  async addImage(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @Body() addImageDto: AddImageDto,
  ) {
    const result = await this.boardsService.addImageToBoard(
      id,
      addImageDto.imageId,
      userId,
    );
    return {
      message: 'Изображение сохранено на доску',
      boardId: id,
      imageId: addImageDto.imageId,
      savedAt: result.savedAt,
    };
  }

  /**
   * Удаление изображения с доски
   */
  @Delete(':id/images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить изображение с доски' })
  @ApiParam({ name: 'id', description: 'ID доски' })
  @ApiResponse({ status: 200, description: 'Изображение удалено' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав' })
  @ApiResponse({ status: 404, description: 'Доска или изображение не найдены' })
  async removeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @Body() addImageDto: AddImageDto,
  ) {
    await this.boardsService.removeImageFromBoard(id, addImageDto.imageId, userId);
    return { message: 'Изображение удалено с доски' };
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Форматирование доски для ответа
   */
  private formatBoard(board: any): BoardResponseDto {
    return {
      id: board.id,
      title: board.title,
      description: board.description,
      coverImage: board.coverImage,
      isPrivate: board.isPrivate,
      imagesCount: board.imagesCount || 0,
      user: board.user
        ? {
            id: board.user.id,
            username: board.user.username,
            avatar: board.user.avatar,
          }
        : null,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    };
  }
}
```

---

### boards.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { BoardImage } from './entities/board-image.entity';
import { Image } from '../images/entities/image.entity';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';

/**
 * Модуль досок
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Board, BoardImage, Image]),
  ],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}
```

---

## 🔧 Интеграция с UsersController

После создания BoardsService необходимо обновить `UsersController` для использования реального сервиса:

### users.controller.ts (обновление)

```typescript
// Добавить импорт
import { BoardsService } from '../boards/boards.service';

// Добавить в конструктор
constructor(
  private usersService: UsersService,
  private boardsService: BoardsService, // Добавить
) {}

// Обновить метод getBoards
@Get('boards')
@ApiOperation({ summary: 'Получить доски пользователя' })
@ApiQuery({ name: 'page', required: false, type: Number })
@ApiQuery({ name: 'pageSize', required: false, type: Number })
@ApiResponse({ status: 200, description: 'Список досок' })
async getBoards(
  @CurrentUser('userId') userId: string,
  @Query('page') page?: number,
  @Query('pageSize') pageSize?: number,
) {
  return this.boardsService.getUserBoards(userId, page || 1, pageSize || 12);
}
```

### users.module.ts (обновление)

```typescript
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { BoardsModule } from '../boards/boards.module'; // Добавить

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MulterModule.register({
      dest: './uploads/avatars',
    }),
    forwardRef(() => BoardsModule), // Добавить
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

---

## 🔧 Регистрация модуля в AppModule

### app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// ... другие импорты
import { BoardsModule } from './modules/boards/boards.module'; // Добавить

@Module({
  imports: [
    ConfigModule.forRoot({ /* ... */ }),
    TypeOrmModule.forRootAsync({ /* ... */ }),
    AuthModule,
    UsersModule,
    BoardsModule, // Добавить
    // ... другие модули
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

## 🧪 Тестирование

### Через Swagger UI

Откройте http://localhost:3001/api/docs

### Через curl

```bash
# ==================== BOARDS CRUD ====================

# Получение списка досок (публичные)
curl "http://localhost:3001/api/boards?page=1&pageSize=12"

# Получение списка досок (авторизованный)
curl "http://localhost:3001/api/boards?page=1&pageSize=12" \
  -b cookies.txt

# Поиск досок
curl "http://localhost:3001/api/boards?query=inspiration&sortBy=newest" \
  -b cookies.txt

# Создание доски
curl -X POST http://localhost:3001/api/boards \
  -H "Content-Type: application/json" \
  -d '{"title":"My Board","description":"Test board","isPrivate":false}' \
  -b cookies.txt

# Получение доски по ID
curl http://localhost:3001/api/boards/{board-id}

# Обновление доски
curl -X PUT http://localhost:3001/api/boards/{board-id} \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title","isPrivate":true}' \
  -b cookies.txt

# Удаление доски
curl -X DELETE http://localhost:3001/api/boards/{board-id} \
  -b cookies.txt

# ==================== BOARD IMAGES ====================

# Получение изображений доски
curl "http://localhost:3001/api/boards/{board-id}/images?page=1&pageSize=12"

# Сохранение изображения на доску
curl -X POST http://localhost:3001/api/boards/{board-id}/images \
  -H "Content-Type: application/json" \
  -d '{"imageId":"image-uuid"}' \
  -b cookies.txt

# Удаление изображения с доски
curl -X DELETE http://localhost:3001/api/boards/{board-id}/images \
  -H "Content-Type: application/json" \
  -d '{"imageId":"image-uuid"}' \
  -b cookies.txt

# ==================== PROFILE BOARDS ====================

# Доски текущего пользователя
curl "http://localhost:3001/api/profile/boards?page=1&pageSize=12" \
  -b cookies.txt
```

---

## 🔄 Схема работы досок

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         СОЗДАНИЕ ДОСКИ                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Frontend                          Backend                              │
│  ─────────                         ───────                              │
│                                                                         │
│  POST /api/boards ──────────────►  JwtAuthGuard                         │
│  { title, description, isPrivate } │                                    │
│  Cookie: access_token              ▼                                    │
│                                    Валидация DTO                        │
│                                    │                                    │
│                                    ▼                                    │
│                                    BoardsService.create()               │
│                                    │                                    │
│                                    ▼                                    │
│  ◄──────────────────────────────── { id, title, ... }                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    СОХРАНЕНИЕ ИЗОБРАЖЕНИЯ НА ДОСКУ                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Frontend                          Backend                              │
│  ─────────                         ───────                              │
│                                                                         │
│  POST /api/boards/:id/images ───►  JwtAuthGuard                         │
│  { imageId }                       │                                    │
│  Cookie: access_token              ▼                                    │
│                                    Проверка владельца доски             │
│                                    │                                    │
│                                    ▼                                    │
│                                    Проверка существования изображения   │
│                                    │                                    │
│                                    ▼                                    │
│                                    Проверка дубликата                   │
│                                    │                                    │
│                                    ▼                                    │
│                                    Создание связи BoardImage            │
│                                    │                                    │
│                                    ▼                                    │
│                                    Обновление обложки (если нужно)      │
│                                    │                                    │
│                                    ▼                                    │
│  ◄──────────────────────────────── { message, boardId, imageId }        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         ПОЛУЧЕНИЕ СПИСКА ДОСОК                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Frontend                          Backend                              │
│  ─────────                         ───────                              │
│                                                                         │
│  GET /api/boards?... ───────────►  Опциональная авторизация             │
│  Cookie: access_token (optional)   │                                    │
│                                    ▼                                    │
│                                    Фильтр по приватности:               │
│                                    - Гость: только публичные            │
│                                    - Авторизован: публичные + свои      │
│                                    │                                    │
│                                    ▼                                    │
│                                    Применение фильтров и сортировки     │
│                                    │                                    │
│                                    ▼                                    │
│                                    Пагинация                            │
│                                    │                                    │
│                                    ▼                                    │
│  ◄──────────────────────────────── { items, page, totalItems, ... }     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Важные замечания

### Приватность досок

1. **Публичные доски** — видны всем пользователям (включая неавторизованных)
2. **Приватные доски** — видны только владельцу
3. При запросе списка досок автоматически фильтруются по правам доступа

### Изображения на досках

1. **Собственные изображения** — загружены непосредственно на доску (image.boardId = board.id)
2. **Сохранённые изображения** — связаны через таблицу board_images
3. При удалении собственного изображения — файл удаляется
4. При удалении сохранённого изображения — удаляется только связь

### Обложка доски

1. **Автоматическая** — устанавливается из первого изображения
2. **Ручная** — можно задать через PUT /api/boards/:id
3. При удалении изображения-обложки — обложка обновляется автоматически

### Каскадное удаление

При удалении доски:
- Удаляются все собственные изображения (с файлами)
- Удаляются все связи с сохранёнными изображениями
- Сами сохранённые изображения остаются на оригинальных досках

---

## ✅ Чеклист

- [ ] DTO созданы
- [ ] BoardsService реализован
- [ ] BoardsController создан
- [ ] BoardsModule создан
- [ ] Модуль зарегистрирован в AppModule
- [ ] UsersController обновлён для /profile/boards
- [ ] Swagger документация
- [ ] Тестирование через curl/Swagger

---

## 📋 Зависимости от других этапов

| Функционал | Зависимость | Статус |
|------------|-------------|--------|
| Сохранение изображений | ImagesModule | Этап 6 |
| Загрузка изображений | UploadModule | Этап 7 |
| Удаление файлов | UploadService | Этап 7 |

> **Примечание:** Для полноценной работы с изображениями на досках необходимо реализовать Этап 6 (Images) и Этап 7 (Upload). До этого можно тестировать CRUD операции с досками.

---

## 🔗 Связанные endpoints

После реализации этого этапа будут работать:

| Endpoint | Описание |
|----------|----------|
| GET /api/boards | Список досок |
| POST /api/boards | Создание доски |
| GET /api/boards/:id | Получение доски |
| PUT /api/boards/:id | Обновление доски |
| DELETE /api/boards/:id | Удаление доски |
| GET /api/boards/:id/images | Изображения доски |
| POST /api/boards/:id/images | Сохранение изображения |
| DELETE /api/boards/:id/images | Удаление изображения |
| GET /api/profile/boards | Доски текущего пользователя |
