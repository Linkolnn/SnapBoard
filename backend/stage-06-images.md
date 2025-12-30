# Этап 6: Модуль изображений (Images)

> **Статус:** В разработке
> 
> **Зависимости:** Этап 5 (Boards) ✅
> 
> **Сервер:** http://localhost:3001/api
> 
> **Swagger:** http://localhost:3001/api/docs

---

## 🎯 Цель этапа

Реализовать модуль управления изображениями: получение списка с пагинацией, поиск, фильтрация по тегам, получение одного изображения, обновление метаданных и удаление.

> **Примечание:** Загрузка изображений реализуется в Этапе 7 (Upload). Данный этап фокусируется на CRUD операциях с уже загруженными изображениями.

---

## 📚 Глоссарий (для frontend разработчиков)

### 🖼️ Image (Изображение)

**Image** — загруженное изображение с метаданными. Каждое изображение принадлежит пользователю и может быть привязано к доске.

### 🏷️ Tags (Теги)

**Tags** — массив строк для категоризации изображений. Используются для поиска и фильтрации.

### 📐 Dimensions (Размеры)

**Dimensions** — ширина (width) и высота (height) изображения в пикселях. Используются для правильного отображения в masonry grid.

### 💾 isFavorite

**isFavorite** — флаг, указывающий добавлено ли изображение в избранное текущим пользователем.

### 📌 isSaved

**isSaved** — флаг, указывающий сохранено ли изображение на какую-либо доску текущего пользователя.

---

## 📁 Структура файлов

```
backend/src/modules/images/
├── images.module.ts              # Модуль
├── images.controller.ts          # Контроллер
├── images.service.ts             # Сервис
├── entities/
│   ├── index.ts                  # Экспорт entities
│   └── image.entity.ts           # Entity изображения (уже есть)
└── dto/
    ├── index.ts                  # Экспорт всех DTO
    ├── update-image.dto.ts       # DTO обновления изображения
    ├── image-response.dto.ts     # DTO ответа изображения
    └── image-query.dto.ts        # DTO query параметров
```

---

## 📝 API Endpoints

### GET /api/images

Получение списка изображений с пагинацией, поиском и фильтрацией.

**Доступ:** Публичный

**Query параметры:**
| Параметр | Тип | Default | Описание |
|----------|-----|---------|----------|
| page | number | 1 | Номер страницы |
| pageSize | number | 12 | Размер страницы (max: 50) |
| boardId | string | - | Фильтр по доске |
| userId | string | - | Фильтр по владельцу |
| query | string | - | Поиск по названию/описанию |
| tags | string | - | Фильтр по тегам (через запятую) |
| sortBy | string | newest | Сортировка: newest, oldest, title_asc, title_desc |

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "url": "/uploads/images/image.jpg",
      "title": "Beautiful Sunset",
      "description": "Sunset over the ocean",
      "tags": ["nature", "sunset", "ocean"],
      "width": 1920,
      "height": 1080,
      "size": 245760,
      "mimeType": "image/jpeg",
      "isFavorite": false,
      "isSaved": true,
      "favoritesCount": 42,
      "user": {
        "id": "uuid",
        "username": "johndoe",
        "avatar": "/uploads/avatars/avatar.jpg"
      },
      "board": {
        "id": "uuid",
        "title": "Nature Collection"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 12,
  "totalItems": 150,
  "totalPages": 13,
  "hasMore": true
}
```

---

### GET /api/images/:id

Получение одного изображения по ID.

**Доступ:** Публичный

**Response (200):**
```json
{
  "id": "uuid",
  "url": "/uploads/images/image.jpg",
  "title": "Beautiful Sunset",
  "description": "Sunset over the ocean with vibrant colors",
  "tags": ["nature", "sunset", "ocean"],
  "width": 1920,
  "height": 1080,
  "size": 245760,
  "mimeType": "image/jpeg",
  "isFavorite": true,
  "isSaved": false,
  "favoritesCount": 42,
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "avatar": "/uploads/avatars/avatar.jpg"
  },
  "board": {
    "id": "uuid",
    "title": "Nature Collection"
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:**
- `404` — Изображение не найдено

---

### PUT /api/images/:id

Обновление метаданных изображения.

**Headers:** `Cookie: access_token=...`

**Request:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["nature", "landscape", "mountains"]
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "url": "/uploads/images/image.jpg",
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["nature", "landscape", "mountains"],
  "width": 1920,
  "height": 1080,
  "size": 245760,
  "mimeType": "image/jpeg",
  "isFavorite": false,
  "isSaved": true,
  "favoritesCount": 42,
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "avatar": "/uploads/avatars/avatar.jpg"
  },
  "board": {
    "id": "uuid",
    "title": "Nature Collection"
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:**
- `400` — Невалидные данные
- `401` — Не авторизован
- `403` — Нет прав на редактирование
- `404` — Изображение не найдено

---

### DELETE /api/images/:id

Удаление изображения.

**Headers:** `Cookie: access_token=...`

**Response (200):**
```json
{
  "message": "Изображение удалено"
}
```

**Errors:**
- `401` — Не авторизован
- `403` — Нет прав на удаление
- `404` — Изображение не найдено

> **Важно:** При удалении изображения также удаляется файл с диска и все связи с досками (board_images).

---

## 💻 Реализация

### DTOs

#### image-query.dto.ts

```typescript
import { IsOptional, IsString, IsInt, Min, Max, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum ImageSortBy {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  TITLE_ASC = 'title_asc',
  TITLE_DESC = 'title_desc',
}

/**
 * DTO для query параметров списка изображений
 */
export class ImageQueryDto {
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

  @ApiProperty({ example: 'uuid', required: false, description: 'Фильтр по доске' })
  @IsOptional()
  @IsUUID('4', { message: 'Некорректный ID доски' })
  boardId?: string;

  @ApiProperty({ example: 'uuid', required: false, description: 'Фильтр по владельцу' })
  @IsOptional()
  @IsUUID('4', { message: 'Некорректный ID пользователя' })
  userId?: string;

  @ApiProperty({ example: 'sunset', required: false, description: 'Поиск по названию/описанию' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ example: 'nature,sunset', required: false, description: 'Фильтр по тегам (через запятую)' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({ 
    enum: ImageSortBy, 
    required: false, 
    default: ImageSortBy.NEWEST,
    description: 'Сортировка' 
  })
  @IsOptional()
  @IsEnum(ImageSortBy)
  sortBy?: ImageSortBy = ImageSortBy.NEWEST;
}
```

#### update-image.dto.ts

```typescript
import { IsString, IsOptional, IsArray, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для обновления изображения
 */
export class UpdateImageDto {
  @ApiProperty({
    example: 'Beautiful Sunset',
    description: 'Название изображения (до 200 символов)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Название должно быть максимум 200 символов' })
  title?: string;

  @ApiProperty({
    example: 'Sunset over the ocean with vibrant colors',
    description: 'Описание изображения',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Описание должно быть максимум 2000 символов' })
  description?: string;

  @ApiProperty({
    example: ['nature', 'sunset', 'ocean'],
    description: 'Теги изображения',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
```

#### image-response.dto.ts

```typescript
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO владельца изображения (краткая информация)
 */
export class ImageUserDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: '/uploads/avatars/avatar.jpg', nullable: true })
  avatar: string | null;
}

/**
 * DTO доски изображения (краткая информация)
 */
export class ImageBoardDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Nature Collection' })
  title: string;
}

/**
 * DTO ответа изображения
 */
export class ImageResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: '/uploads/images/image.jpg' })
  url: string;

  @ApiProperty({ example: 'Beautiful Sunset', nullable: true })
  title: string | null;

  @ApiProperty({ example: 'Sunset over the ocean', nullable: true })
  description: string | null;

  @ApiProperty({ example: ['nature', 'sunset'], nullable: true })
  tags: string[] | null;

  @ApiProperty({ example: 1920, nullable: true })
  width: number | null;

  @ApiProperty({ example: 1080, nullable: true })
  height: number | null;

  @ApiProperty({ example: 245760, nullable: true })
  size: number | null;

  @ApiProperty({ example: 'image/jpeg', nullable: true })
  mimeType: string | null;

  @ApiProperty({ example: false })
  isFavorite: boolean;

  @ApiProperty({ example: true })
  isSaved: boolean;

  @ApiProperty({ example: 42 })
  favoritesCount: number;

  @ApiProperty({ type: ImageUserDto })
  user: ImageUserDto;

  @ApiProperty({ type: ImageBoardDto, nullable: true })
  board: ImageBoardDto | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}

/**
 * DTO пагинированного ответа изображений
 */
export class PaginatedImagesResponseDto {
  @ApiProperty({ type: [ImageResponseDto] })
  items: ImageResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 12 })
  pageSize: number;

  @ApiProperty({ example: 150 })
  totalItems: number;

  @ApiProperty({ example: 13 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasMore: boolean;
}
```

#### dto/index.ts

```typescript
export * from './image-query.dto';
export * from './update-image.dto';
export * from './image-response.dto';
```

---

### images.service.ts

```typescript
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Image } from './entities/image.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { BoardImage } from '../boards/entities/board-image.entity';
import { UpdateImageDto, ImageQueryDto, ImageSortBy } from './dto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Сервис для работы с изображениями
 */
@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private imagesRepository: Repository<Image>,
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
    @InjectRepository(BoardImage)
    private boardImagesRepository: Repository<BoardImage>,
  ) {}

  // ==================== CRUD OPERATIONS ====================

  /**
   * Получение списка изображений с пагинацией
   */
  async findAll(
    queryDto: ImageQueryDto,
    currentUserId?: string,
  ): Promise<{
    items: any[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasMore: boolean;
  }> {
    const { 
      page = 1, 
      pageSize = 12, 
      boardId, 
      userId, 
      query, 
      tags, 
      sortBy = ImageSortBy.NEWEST 
    } = queryDto;

    const queryBuilder = this.imagesRepository
      .createQueryBuilder('image')
      .leftJoinAndSelect('image.user', 'user')
      .leftJoinAndSelect('image.board', 'board');

    // Фильтр по доске
    if (boardId) {
      queryBuilder.andWhere('image.boardId = :boardId', { boardId });
    }

    // Фильтр по владельцу
    if (userId) {
      queryBuilder.andWhere('image.userId = :userId', { userId });
    }

    // Поиск по названию/описанию
    if (query) {
      queryBuilder.andWhere(
        '(LOWER(image.title) LIKE LOWER(:query) OR LOWER(image.description) LIKE LOWER(:query))',
        { query: `%${query}%` },
      );
    }

    // Фильтр по тегам
    if (tags) {
      const tagsArray = tags.split(',').map(t => t.trim().toLowerCase());
      queryBuilder.andWhere('image.tags && :tags', { tags: tagsArray });
    }

    // Сортировка
    this.applySorting(queryBuilder, sortBy);

    // Пагинация
    const totalItems = await queryBuilder.getCount();
    const totalPages = Math.ceil(totalItems / pageSize);

    const images = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    // Добавляем дополнительные поля
    const items = await Promise.all(
      images.map(async (image) => this.formatImage(image, currentUserId)),
    );

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
   * Получение одного изображения по ID
   */
  async findOne(id: string, currentUserId?: string): Promise<any> {
    const image = await this.imagesRepository.findOne({
      where: { id },
      relations: ['user', 'board'],
    });

    if (!image) {
      throw new NotFoundException('Изображение не найдено');
    }

    return this.formatImage(image, currentUserId);
  }

  /**
   * Обновление изображения
   */
  async update(id: string, userId: string, updateDto: UpdateImageDto): Promise<any> {
    const image = await this.findOneForOwner(id, userId);

    // Обновляем только переданные поля
    if (updateDto.title !== undefined) {
      image.title = updateDto.title;
    }
    if (updateDto.description !== undefined) {
      image.description = updateDto.description;
    }
    if (updateDto.tags !== undefined) {
      image.tags = updateDto.tags.map(t => t.toLowerCase().trim());
    }

    const saved = await this.imagesRepository.save(image);
    
    // Загружаем связи для ответа
    const updated = await this.imagesRepository.findOne({
      where: { id: saved.id },
      relations: ['user', 'board'],
    });

    return this.formatImage(updated!, userId);
  }

  /**
   * Удаление изображения
   */
  async remove(id: string, userId: string): Promise<void> {
    const image = await this.findOneForOwner(id, userId);

    // Удаляем файл с диска
    await this.deleteImageFile(image.url);

    // Удаляем запись из БД (связи удалятся каскадно)
    await this.imagesRepository.remove(image);
  }

  // ==================== USER IMAGES (для profile) ====================

  /**
   * Получение изображений пользователя (для /api/profile/images)
   */
  async getUserImages(
    userId: string,
    page: number = 1,
    pageSize: number = 12,
  ): Promise<{
    items: any[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasMore: boolean;
  }> {
    const queryBuilder = this.imagesRepository
      .createQueryBuilder('image')
      .leftJoinAndSelect('image.user', 'user')
      .leftJoinAndSelect('image.board', 'board')
      .where('image.userId = :userId', { userId })
      .orderBy('image.createdAt', 'DESC');

    const totalItems = await queryBuilder.getCount();
    const totalPages = Math.ceil(totalItems / pageSize);

    const images = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    const items = await Promise.all(
      images.map(async (image) => this.formatImage(image, userId)),
    );

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
   * Получение изображения с проверкой владельца
   */
  private async findOneForOwner(id: string, userId: string): Promise<Image> {
    const image = await this.imagesRepository.findOne({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Изображение не найдено');
    }

    if (image.userId !== userId) {
      throw new ForbiddenException('Нет прав на это изображение');
    }

    return image;
  }

  /**
   * Форматирование изображения для ответа
   */
  private async formatImage(image: Image, currentUserId?: string): Promise<any> {
    // Проверяем, добавлено ли в избранное
    let isFavorite = false;
    if (currentUserId) {
      const favorite = await this.favoritesRepository.findOne({
        where: { userId: currentUserId, imageId: image.id },
      });
      isFavorite = !!favorite;
    }

    // Проверяем, сохранено ли на доску пользователя
    let isSaved = false;
    if (currentUserId) {
      const saved = await this.boardImagesRepository
        .createQueryBuilder('bi')
        .innerJoin('bi.board', 'board')
        .where('bi.imageId = :imageId', { imageId: image.id })
        .andWhere('board.userId = :userId', { userId: currentUserId })
        .getOne();
      isSaved = !!saved;
    }

    // Подсчёт избранного
    const favoritesCount = await this.favoritesRepository.count({
      where: { imageId: image.id },
    });

    return {
      id: image.id,
      url: image.url,
      title: image.title,
      description: image.description,
      tags: image.tags,
      width: image.width,
      height: image.height,
      size: image.size,
      mimeType: image.mimeType,
      isFavorite,
      isSaved,
      favoritesCount,
      user: image.user
        ? {
            id: image.user.id,
            username: image.user.username,
            avatar: image.user.avatar,
          }
        : null,
      board: image.board
        ? {
            id: image.board.id,
            title: image.board.title,
          }
        : null,
      createdAt: image.createdAt,
    };
  }

  /**
   * Удаление файла изображения с диска
   */
  private async deleteImageFile(url: string): Promise<void> {
    try {
      // url имеет формат /uploads/images/filename.jpg
      const filePath = path.join(process.cwd(), url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      // Логируем ошибку, но не прерываем удаление из БД
      console.error('Ошибка удаления файла:', error);
    }
  }

  /**
   * Применение сортировки
   */
  private applySorting(
    queryBuilder: SelectQueryBuilder<Image>,
    sortBy: ImageSortBy,
  ): void {
    switch (sortBy) {
      case ImageSortBy.OLDEST:
        queryBuilder.orderBy('image.createdAt', 'ASC');
        break;
      case ImageSortBy.TITLE_ASC:
        queryBuilder.orderBy('image.title', 'ASC');
        break;
      case ImageSortBy.TITLE_DESC:
        queryBuilder.orderBy('image.title', 'DESC');
        break;
      case ImageSortBy.NEWEST:
      default:
        queryBuilder.orderBy('image.createdAt', 'DESC');
        break;
    }
  }
}
```

---

### images.controller.ts

```typescript
import {
  Controller,
  Get,
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
import { ImagesService } from './images.service';
import {
  UpdateImageDto,
  ImageQueryDto,
  ImageResponseDto,
  PaginatedImagesResponseDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Контроллер изображений
 * 
 * API Endpoints:
 * GET    /api/images      — список изображений
 * GET    /api/images/:id  — получить изображение
 * PUT    /api/images/:id  — обновить изображение
 * DELETE /api/images/:id  — удалить изображение
 */
@ApiTags('Images')
@Controller('images')
export class ImagesController {
  constructor(private imagesService: ImagesService) {}

  /**
   * Получение списка изображений
   */
  @Get()
  @Public()
  @ApiOperation({ summary: 'Получить список изображений' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'boardId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'query', required: false, type: String })
  @ApiQuery({ name: 'tags', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['newest', 'oldest', 'title_asc', 'title_desc'] })
  @ApiResponse({ status: 200, description: 'Список изображений', type: PaginatedImagesResponseDto })
  async findAll(
    @Query() queryDto: ImageQueryDto,
    @CurrentUser('userId') userId?: string,
  ) {
    return this.imagesService.findAll(queryDto, userId);
  }

  /**
   * Получение одного изображения
   */
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Получить изображение по ID' })
  @ApiParam({ name: 'id', description: 'ID изображения' })
  @ApiResponse({ status: 200, description: 'Изображение', type: ImageResponseDto })
  @ApiResponse({ status: 404, description: 'Изображение не найдено' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId?: string,
  ) {
    return this.imagesService.findOne(id, userId);
  }

  /**
   * Обновление изображения
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить изображение' })
  @ApiParam({ name: 'id', description: 'ID изображения' })
  @ApiResponse({ status: 200, description: 'Изображение обновлено', type: ImageResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав' })
  @ApiResponse({ status: 404, description: 'Изображение не найдено' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @Body() updateDto: UpdateImageDto,
  ) {
    return this.imagesService.update(id, userId, updateDto);
  }

  /**
   * Удаление изображения
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить изображение' })
  @ApiParam({ name: 'id', description: 'ID изображения' })
  @ApiResponse({ status: 200, description: 'Изображение удалено' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав' })
  @ApiResponse({ status: 404, description: 'Изображение не найдено' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
  ) {
    await this.imagesService.remove(id, userId);
    return { message: 'Изображение удалено' };
  }
}
```

---

### images.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { BoardImage } from '../boards/entities/board-image.entity';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';

/**
 * Модуль изображений
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Image, Favorite, BoardImage]),
  ],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
```

---

### entities/index.ts

```typescript
export * from './image.entity';
```

---

## 🔧 Интеграция с UsersController

После создания ImagesService необходимо обновить `UsersController` для использования реального сервиса:

### users.controller.ts (обновление)

```typescript
// Добавить импорт
import { ImagesService } from '../images/images.service';

// Обновить конструктор
constructor(
  private usersService: UsersService,
  private boardsService: BoardsService,
  private imagesService: ImagesService, // Добавить
) {}

// Обновить метод getImages
@Get('images')
@ApiOperation({ summary: 'Получить изображения пользователя' })
@ApiQuery({ name: 'page', required: false, type: Number })
@ApiQuery({ name: 'pageSize', required: false, type: Number })
@ApiResponse({ status: 200, description: 'Список изображений' })
async getImages(
  @CurrentUser('userId') userId: string,
  @Query('page') page?: number,
  @Query('pageSize') pageSize?: number,
) {
  return this.imagesService.getUserImages(userId, page || 1, pageSize || 12);
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
import { BoardsModule } from '../boards/boards.module';
import { ImagesModule } from '../images/images.module'; // Добавить

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MulterModule.register({
      dest: './uploads/avatars',
    }),
    forwardRef(() => BoardsModule),
    forwardRef(() => ImagesModule), // Добавить
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
import { ImagesModule } from './modules/images/images.module'; // Добавить

@Module({
  imports: [
    ConfigModule.forRoot({ /* ... */ }),
    TypeOrmModule.forRootAsync({ /* ... */ }),
    AuthModule,
    UsersModule,
    BoardsModule,
    ImagesModule, // Добавить
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
# ==================== IMAGES CRUD ====================

# Получение списка изображений
curl "http://localhost:3001/api/images?page=1&pageSize=12"

# Получение с фильтрами
curl "http://localhost:3001/api/images?query=sunset&tags=nature,landscape&sortBy=newest"

# Получение изображений доски
curl "http://localhost:3001/api/images?boardId={board-uuid}"

# Получение изображений пользователя
curl "http://localhost:3001/api/images?userId={user-uuid}"

# Получение одного изображения
curl http://localhost:3001/api/images/{image-id}

# Обновление изображения
curl -X PUT http://localhost:3001/api/images/{image-id} \
  -H "Content-Type: application/json" \
  -d '{"title":"New Title","description":"New description","tags":["nature","updated"]}' \
  -b cookies.txt

# Удаление изображения
curl -X DELETE http://localhost:3001/api/images/{image-id} \
  -b cookies.txt

# ==================== PROFILE IMAGES ====================

# Изображения текущего пользователя
curl "http://localhost:3001/api/profile/images?page=1&pageSize=12" \
  -b cookies.txt
```

---

## 🔄 Схема работы изображений

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ПОЛУЧЕНИЕ СПИСКА ИЗОБРАЖЕНИЙ                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Frontend                          Backend                              │
│  ─────────                         ───────                              │
│                                                                         │
│  GET /api/images?... ───────────►  Опциональная авторизация             │
│  Cookie: access_token (optional)   │                                    │
│                                    ▼                                    │
│                                    Применение фильтров:                 │
│                                    - boardId                            │
│                                    - userId                             │
│                                    - query (поиск)                      │
│                                    - tags                               │
│                                    │                                    │
│                                    ▼                                    │
│                                    Сортировка                           │
│                                    │                                    │
│                                    ▼                                    │
│                                    Пагинация                            │
│                                    │                                    │
│                                    ▼                                    │
│                                    Добавление полей:                    │
│                                    - isFavorite                         │
│                                    - isSaved                            │
│                                    - favoritesCount                     │
│                                    │                                    │
│                                    ▼                                    │
│  ◄──────────────────────────────── { items, page, totalItems, ... }     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        УДАЛЕНИЕ ИЗОБРАЖЕНИЯ                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Frontend                          Backend                              │
│  ─────────                         ───────                              │
│                                                                         │
│  DELETE /api/images/:id ────────►  JwtAuthGuard                         │
│  Cookie: access_token              │                                    │
│                                    ▼                                    │
│                                    Проверка владельца                   │
│                                    │                                    │
│                                    ▼                                    │
│                                    Удаление файла с диска               │
│                                    │                                    │
│                                    ▼                                    │
│                                    Удаление из БД                       │
│                                    (каскадно: favorites, board_images)  │
│                                    │                                    │
│                                    ▼                                    │
│  ◄──────────────────────────────── { message: "Изображение удалено" }   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Важные замечания

### Поиск и фильтрация

1. **Поиск по query** — ищет в title и description (регистронезависимый)
2. **Фильтр по tags** — использует PostgreSQL оператор `&&` для массивов
3. **Теги** — хранятся в нижнем регистре, при поиске также приводятся к нижнему регистру

### Дополнительные поля

1. **isFavorite** — вычисляется для текущего пользователя (если авторизован)
2. **isSaved** — проверяет, сохранено ли изображение на любую доску пользователя
3. **favoritesCount** — общее количество добавлений в избранное

### Удаление изображения

При удалении изображения:
- Удаляется файл с диска
- Удаляется запись из таблицы images
- Каскадно удаляются записи из favorites
- Каскадно удаляются записи из board_images

### Права доступа

1. **Просмотр** — доступен всем (публичный)
2. **Редактирование** — только владелец
3. **Удаление** — только владелец

---

## ✅ Чеклист

- [ ] DTO созданы
- [ ] ImagesService реализован
- [ ] ImagesController создан
- [ ] ImagesModule создан
- [ ] Модуль зарегистрирован в AppModule
- [ ] UsersController обновлён для /profile/images
- [ ] Swagger документация
- [ ] Тестирование через curl/Swagger

---

## 📋 Зависимости от других этапов

| Функционал | Зависимость | Статус |
|------------|-------------|--------|
| Загрузка изображений | UploadModule | Этап 7 |
| Избранное | FavoritesModule | Этап 8 |
| Доски | BoardsModule | ✅ Этап 5 |

> **Примечание:** Для полноценной работы необходимо реализовать Этап 7 (Upload) для загрузки изображений и Этап 8 (Favorites) для работы с избранным. До этого можно тестировать получение и обновление изображений, созданных через seed данные.

---

## 🔗 Связанные endpoints

После реализации этого этапа будут работать:

| Endpoint | Описание |
|----------|----------|
| GET /api/images | Список изображений |
| GET /api/images/:id | Получение изображения |
| PUT /api/images/:id | Обновление изображения |
| DELETE /api/images/:id | Удаление изображения |
| GET /api/profile/images | Изображения текущего пользователя |
