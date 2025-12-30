# Этап 8: Модуль избранного (Favorites)

> **Статус:** В разработке
> 
> **Зависимости:** Этап 6 (Images) ✅, Этап 3 (Auth) ✅
> 
> **Сервер:** http://localhost:3001/api
> 
> **Swagger:** http://localhost:3001/api/docs

---

## 🎯 Цель этапа

Реализовать модуль управления избранными изображениями: добавление/удаление из избранного, получение списка избранного с пагинацией, batch-проверка статуса избранного для нескольких изображений.

---

## 📚 Глоссарий (для frontend разработчиков)

### ❤️ Favorites (Избранное)

**Favorites** — функционал, позволяющий пользователям сохранять понравившиеся изображения в персональный список. Связь "многие-ко-многим" между пользователями и изображениями.

### 🔄 Toggle (Переключение)

**Toggle** — паттерн, при котором одно действие добавляет в избранное, если изображение не в избранном, или удаляет, если уже добавлено. В нашем API используются отдельные endpoints для добавления и удаления.

### 📦 Batch Check (Пакетная проверка)

**Batch Check** — проверка статуса избранного для нескольких изображений одним запросом. Оптимизирует количество запросов при отображении списка изображений.

### 📊 Favorites Count

**Favorites Count** — количество пользователей, добавивших изображение в избранное. Показатель популярности изображения.

---

## 📁 Структура файлов

```
backend/src/modules/favorites/
├── favorites.module.ts           # Модуль
├── favorites.controller.ts       # Контроллер
├── favorites.service.ts          # Сервис
├── entities/
│   ├── index.ts                  # Экспорт entities
│   └── favorite.entity.ts        # Entity (уже существует)
└── dto/
    ├── index.ts                  # Экспорт всех DTO
    ├── favorite-check.dto.ts     # DTO для batch проверки
    └── favorite-response.dto.ts  # DTO ответа
```

---

## 📝 API Endpoints

### GET /api/favorites

Получение списка избранных изображений текущего пользователя.

**Headers:** `Cookie: access_token=...`

**Query параметры:**
| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| page | number | 1 | Номер страницы |
| pageSize | number | 12 | Количество на странице (max: 50) |

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "url": "/uploads/images/image.jpg",
      "title": "Beautiful Sunset",
      "description": "Sunset over the ocean",
      "tags": ["nature", "sunset"],
      "width": 1920,
      "height": 1080,
      "isFavorite": true,
      "favoritesCount": 42,
      "user": {
        "id": "uuid",
        "username": "johndoe",
        "avatar": "/uploads/avatars/avatar.jpg"
      },
      "addedAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 12,
  "totalItems": 25,
  "totalPages": 3,
  "hasMore": true
}
```

**Errors:**
- `401` — Не авторизован

---

### POST /api/favorites/:imageId

Добавление изображения в избранное.

**Headers:** `Cookie: access_token=...`

**Path параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| imageId | UUID | ID изображения |

**Response (201):**
```json
{
  "message": "Добавлено в избранное",
  "imageId": "uuid",
  "favoritesCount": 43
}
```

**Errors:**
- `400` — Изображение уже в избранном
- `401` — Не авторизован
- `404` — Изображение не найдено

---

### DELETE /api/favorites/:imageId

Удаление изображения из избранного.

**Headers:** `Cookie: access_token=...`

**Path параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| imageId | UUID | ID изображения |

**Response (200):**
```json
{
  "message": "Удалено из избранного",
  "imageId": "uuid",
  "favoritesCount": 42
}
```

**Errors:**
- `400` — Изображение не в избранном
- `401` — Не авторизован
- `404` — Изображение не найдено

---

### GET /api/favorites/check

Пакетная проверка статуса избранного для нескольких изображений.

**Headers:** `Cookie: access_token=...`

**Query параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| imageIds | string | ID изображений через запятую (max: 50) |

**Response (200):**
```json
{
  "results": {
    "uuid-1": true,
    "uuid-2": false,
    "uuid-3": true
  }
}
```

**Errors:**
- `400` — Не указаны imageIds или превышен лимит
- `401` — Не авторизован

---

## 💻 Реализация

### DTOs

#### dto/favorite-check.dto.ts

```typescript
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для batch проверки избранного
 */
export class FavoriteCheckDto {
  @ApiProperty({
    example: 'uuid-1,uuid-2,uuid-3',
    description: 'ID изображений через запятую (max: 50)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Укажите imageIds' })
  imageIds: string;
}
```

#### dto/favorite-response.dto.ts

```typescript
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO пользователя (краткая информация)
 */
export class FavoriteUserDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: '/uploads/avatars/avatar.jpg', nullable: true })
  avatar: string | null;
}

/**
 * DTO изображения в избранном
 */
export class FavoriteImageDto {
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

  @ApiProperty({ example: 1920 })
  width: number;

  @ApiProperty({ example: 1080 })
  height: number;

  @ApiProperty({ example: true })
  isFavorite: boolean;

  @ApiProperty({ example: 42 })
  favoritesCount: number;

  @ApiProperty({ type: FavoriteUserDto })
  user: FavoriteUserDto;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  addedAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}

/**
 * DTO ответа списка избранного
 */
export class FavoritesListResponseDto {
  @ApiProperty({ type: [FavoriteImageDto] })
  items: FavoriteImageDto[];

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

/**
 * DTO ответа добавления/удаления
 */
export class FavoriteActionResponseDto {
  @ApiProperty({ example: 'Добавлено в избранное' })
  message: string;

  @ApiProperty({ example: 'uuid' })
  imageId: string;

  @ApiProperty({ example: 43 })
  favoritesCount: number;
}

/**
 * DTO ответа batch проверки
 */
export class FavoriteCheckResponseDto {
  @ApiProperty({
    example: { 'uuid-1': true, 'uuid-2': false },
    description: 'Объект с ID изображений и их статусом избранного',
  })
  results: Record<string, boolean>;
}
```

#### dto/index.ts

```typescript
export * from './favorite-check.dto';
export * from './favorite-response.dto';
```

---

### favorites.service.ts

```typescript
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { Image } from '../images/entities/image.entity';

/**
 * Сервис для работы с избранным
 */
@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
    @InjectRepository(Image)
    private imagesRepository: Repository<Image>,
  ) {}

  // ==================== PUBLIC METHODS ====================

  /**
   * Получение списка избранного пользователя
   */
  async getFavorites(
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
    // Ограничиваем pageSize
    pageSize = Math.min(pageSize, 50);

    const queryBuilder = this.favoritesRepository
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.image', 'image')
      .leftJoinAndSelect('image.user', 'user')
      .where('favorite.userId = :userId', { userId })
      .orderBy('favorite.createdAt', 'DESC');

    const totalItems = await queryBuilder.getCount();
    const totalPages = Math.ceil(totalItems / pageSize);

    const favorites = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    // Форматируем ответ
    const items = await Promise.all(
      favorites.map(async (fav) => this.formatFavoriteImage(fav, userId)),
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
   * Добавление в избранное
   */
  async addToFavorites(
    userId: string,
    imageId: string,
  ): Promise<{ message: string; imageId: string; favoritesCount: number }> {
    // Проверяем существование изображения
    const image = await this.imagesRepository.findOne({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Изображение не найдено');
    }

    // Проверяем, не добавлено ли уже
    const existing = await this.favoritesRepository.findOne({
      where: { userId, imageId },
    });

    if (existing) {
      throw new BadRequestException('Изображение уже в избранном');
    }

    // Создаём запись
    const favorite = this.favoritesRepository.create({
      userId,
      imageId,
    });

    await this.favoritesRepository.save(favorite);

    // Получаем обновлённый счётчик
    const favoritesCount = await this.getFavoritesCount(imageId);

    return {
      message: 'Добавлено в избранное',
      imageId,
      favoritesCount,
    };
  }

  /**
   * Удаление из избранного
   */
  async removeFromFavorites(
    userId: string,
    imageId: string,
  ): Promise<{ message: string; imageId: string; favoritesCount: number }> {
    // Проверяем существование изображения
    const image = await this.imagesRepository.findOne({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Изображение не найдено');
    }

    // Проверяем, есть ли в избранном
    const favorite = await this.favoritesRepository.findOne({
      where: { userId, imageId },
    });

    if (!favorite) {
      throw new BadRequestException('Изображение не в избранном');
    }

    // Удаляем запись
    await this.favoritesRepository.remove(favorite);

    // Получаем обновлённый счётчик
    const favoritesCount = await this.getFavoritesCount(imageId);

    return {
      message: 'Удалено из избранного',
      imageId,
      favoritesCount,
    };
  }

  /**
   * Batch проверка статуса избранного
   */
  async checkFavorites(
    userId: string,
    imageIds: string[],
  ): Promise<Record<string, boolean>> {
    // Ограничиваем количество
    if (imageIds.length > 50) {
      throw new BadRequestException('Максимум 50 изображений за раз');
    }

    // Получаем все избранные из списка
    const favorites = await this.favoritesRepository.find({
      where: {
        userId,
        imageId: In(imageIds),
      },
      select: ['imageId'],
    });

    // Формируем результат
    const favoriteIds = new Set(favorites.map((f) => f.imageId));
    const results: Record<string, boolean> = {};

    imageIds.forEach((id) => {
      results[id] = favoriteIds.has(id);
    });

    return results;
  }

  // ==================== HELPER METHODS ====================

  /**
   * Получение количества избранного для изображения
   */
  async getFavoritesCount(imageId: string): Promise<number> {
    return this.favoritesRepository.count({
      where: { imageId },
    });
  }

  /**
   * Проверка, добавлено ли изображение в избранное
   */
  async isFavorite(userId: string, imageId: string): Promise<boolean> {
    const favorite = await this.favoritesRepository.findOne({
      where: { userId, imageId },
    });
    return !!favorite;
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Форматирование изображения из избранного
   */
  private async formatFavoriteImage(
    favorite: Favorite,
    currentUserId: string,
  ): Promise<any> {
    const image = favorite.image;
    const favoritesCount = await this.getFavoritesCount(image.id);

    return {
      id: image.id,
      url: image.url,
      title: image.title,
      description: image.description,
      tags: image.tags,
      width: image.width,
      height: image.height,
      isFavorite: true, // Всегда true, т.к. это список избранного
      favoritesCount,
      user: image.user
        ? {
            id: image.user.id,
            username: image.user.username,
            avatar: image.user.avatar,
          }
        : null,
      addedAt: favorite.createdAt,
      createdAt: image.createdAt,
    };
  }
}
```


---

### favorites.controller.ts

```typescript
import {
  Controller,
  Get,
  Post,
  Delete,
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
import { FavoritesService } from './favorites.service';
import {
  FavoritesListResponseDto,
  FavoriteActionResponseDto,
  FavoriteCheckResponseDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

/**
 * Контроллер избранного
 * 
 * API Endpoints:
 * GET    /api/favorites           — список избранного
 * POST   /api/favorites/:imageId  — добавить в избранное
 * DELETE /api/favorites/:imageId  — удалить из избранного
 * GET    /api/favorites/check     — batch проверка статуса
 */
@ApiTags('Favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  /**
   * Получение списка избранного
   */
  @Get()
  @ApiOperation({ summary: 'Получить список избранного' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Список избранного', type: FavoritesListResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getFavorites(
    @CurrentUser('userId') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.favoritesService.getFavorites(
      userId,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 12,
    );
  }

  /**
   * Batch проверка статуса избранного
   * ВАЖНО: Этот endpoint должен быть ДО /:imageId, иначе "check" будет интерпретирован как UUID
   */
  @Get('check')
  @ApiOperation({ summary: 'Проверить статус избранного для нескольких изображений' })
  @ApiQuery({ name: 'imageIds', required: true, description: 'ID изображений через запятую' })
  @ApiResponse({ status: 200, description: 'Статусы избранного', type: FavoriteCheckResponseDto })
  @ApiResponse({ status: 400, description: 'Не указаны imageIds или превышен лимит' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async checkFavorites(
    @CurrentUser('userId') userId: string,
    @Query('imageIds') imageIds: string,
  ) {
    if (!imageIds || !imageIds.trim()) {
      return { results: {} };
    }

    const ids = imageIds.split(',').map((id) => id.trim()).filter(Boolean);
    const results = await this.favoritesService.checkFavorites(userId, ids);

    return { results };
  }

  /**
   * Добавление в избранное
   */
  @Post(':imageId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Добавить изображение в избранное' })
  @ApiParam({ name: 'imageId', description: 'ID изображения' })
  @ApiResponse({ status: 201, description: 'Добавлено в избранное', type: FavoriteActionResponseDto })
  @ApiResponse({ status: 400, description: 'Уже в избранном' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Изображение не найдено' })
  async addToFavorites(
    @CurrentUser('userId') userId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.favoritesService.addToFavorites(userId, imageId);
  }

  /**
   * Удаление из избранного
   */
  @Delete(':imageId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить изображение из избранного' })
  @ApiParam({ name: 'imageId', description: 'ID изображения' })
  @ApiResponse({ status: 200, description: 'Удалено из избранного', type: FavoriteActionResponseDto })
  @ApiResponse({ status: 400, description: 'Не в избранном' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Изображение не найдено' })
  async removeFromFavorites(
    @CurrentUser('userId') userId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.favoritesService.removeFromFavorites(userId, imageId);
  }
}
```

---

### favorites.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { Image } from '../images/entities/image.entity';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';

/**
 * Модуль избранного
 */
@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Image])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
```

---

## 🔧 Регистрация модуля в AppModule

### app.module.ts

```typescript
import { Module } from '@nestjs/common';
// ... другие импорты
import { FavoritesModule } from './modules/favorites/favorites.module'; // Добавить

@Module({
  imports: [
    // ... другие модули
    AuthModule,
    UsersModule,
    BoardsModule,
    ImagesModule,
    UploadModule,
    FavoritesModule, // Добавить
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
# ==================== ПОЛУЧЕНИЕ СПИСКА ИЗБРАННОГО ====================

# Получить избранное (первая страница)
curl -X GET "http://localhost:3001/api/favorites" \
  -b cookies.txt

# Получить избранное с пагинацией
curl -X GET "http://localhost:3001/api/favorites?page=2&pageSize=20" \
  -b cookies.txt

# ==================== ДОБАВЛЕНИЕ В ИЗБРАННОЕ ====================

# Добавить изображение в избранное
curl -X POST "http://localhost:3001/api/favorites/{image-uuid}" \
  -b cookies.txt

# ==================== УДАЛЕНИЕ ИЗ ИЗБРАННОГО ====================

# Удалить изображение из избранного
curl -X DELETE "http://localhost:3001/api/favorites/{image-uuid}" \
  -b cookies.txt

# ==================== BATCH ПРОВЕРКА СТАТУСА ====================

# Проверить статус для нескольких изображений
curl -X GET "http://localhost:3001/api/favorites/check?imageIds=uuid-1,uuid-2,uuid-3" \
  -b cookies.txt
```

### Тестирование с JavaScript (Frontend)

```javascript
// Получение списка избранного
const getFavorites = async (page = 1, pageSize = 12) => {
  const response = await fetch(`/api/favorites?page=${page}&pageSize=${pageSize}`, {
    credentials: 'include',
  });
  return response.json();
};

// Добавление в избранное
const addToFavorites = async (imageId) => {
  const response = await fetch(`/api/favorites/${imageId}`, {
    method: 'POST',
    credentials: 'include',
  });
  return response.json();
};

// Удаление из избранного
const removeFromFavorites = async (imageId) => {
  const response = await fetch(`/api/favorites/${imageId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return response.json();
};

// Batch проверка статуса
const checkFavorites = async (imageIds) => {
  const ids = imageIds.join(',');
  const response = await fetch(`/api/favorites/check?imageIds=${ids}`, {
    credentials: 'include',
  });
  return response.json();
};

// Пример использования batch проверки при загрузке списка изображений
const loadImagesWithFavoriteStatus = async () => {
  // 1. Загружаем изображения
  const { items: images } = await fetch('/api/images').then(r => r.json());
  
  // 2. Проверяем статус избранного для всех
  const imageIds = images.map(img => img.id);
  const { results } = await checkFavorites(imageIds);
  
  // 3. Обновляем статус в изображениях
  return images.map(img => ({
    ...img,
    isFavorite: results[img.id] || false,
  }));
};
```


---

## 🔄 Схема работы избранного

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ДОБАВЛЕНИЕ В ИЗБРАННОЕ                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Frontend                          Backend                              │
│  ─────────                         ───────                              │
│                                                                         │
│  POST /api/favorites/:imageId ──►  JwtAuthGuard                         │
│  Cookie: access_token              │                                    │
│                                    ▼                                    │
│                                    FavoritesService.addToFavorites()    │
│                                    │                                    │
│                                    ▼                                    │
│                                    Проверка существования изображения   │
│                                    │                                    │
│                                    ▼                                    │
│                                    Проверка: уже в избранном?           │
│                                    │                                    │
│                                    ├── Да ──► 400 Bad Request           │
│                                    │                                    │
│                                    ▼ Нет                                │
│                                    Создание записи в favorites          │
│                                    │                                    │
│                                    ▼                                    │
│                                    Подсчёт favoritesCount               │
│                                    │                                    │
│                                    ▼                                    │
│  ◄──────────────────────────────── { message, imageId, favoritesCount } │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    УДАЛЕНИЕ ИЗ ИЗБРАННОГО                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Frontend                          Backend                              │
│  ─────────                         ───────                              │
│                                                                         │
│  DELETE /api/favorites/:imageId ─► JwtAuthGuard                         │
│  Cookie: access_token              │                                    │
│                                    ▼                                    │
│                                    FavoritesService.removeFromFavorites │
│                                    │                                    │
│                                    ▼                                    │
│                                    Проверка существования изображения   │
│                                    │                                    │
│                                    ▼                                    │
│                                    Проверка: есть в избранном?          │
│                                    │                                    │
│                                    ├── Нет ──► 400 Bad Request          │
│                                    │                                    │
│                                    ▼ Да                                 │
│                                    Удаление записи из favorites         │
│                                    │                                    │
│                                    ▼                                    │
│                                    Подсчёт favoritesCount               │
│                                    │                                    │
│                                    ▼                                    │
│  ◄──────────────────────────────── { message, imageId, favoritesCount } │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    BATCH ПРОВЕРКА СТАТУСА                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Frontend                          Backend                              │
│  ─────────                         ───────                              │
│                                                                         │
│  GET /api/favorites/check ──────►  JwtAuthGuard                         │
│  ?imageIds=id1,id2,id3             │                                    │
│  Cookie: access_token              ▼                                    │
│                                    FavoritesService.checkFavorites()    │
│                                    │                                    │
│                                    ▼                                    │
│                                    Парсинг imageIds (split by comma)    │
│                                    │                                    │
│                                    ▼                                    │
│                                    Проверка лимита (max 50)             │
│                                    │                                    │
│                                    ▼                                    │
│                                    SELECT * FROM favorites              │
│                                    WHERE userId = :userId               │
│                                    AND imageId IN (:imageIds)           │
│                                    │                                    │
│                                    ▼                                    │
│                                    Формирование результата              │
│                                    { id1: true, id2: false, ... }       │
│                                    │                                    │
│                                    ▼                                    │
│  ◄──────────────────────────────── { results: { ... } }                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Интеграция с ImagesService

Модуль Favorites уже интегрирован с ImagesService. При получении изображений автоматически добавляются поля:

- `isFavorite` — добавлено ли в избранное текущим пользователем
- `favoritesCount` — общее количество добавлений в избранное

```typescript
// images.service.ts (уже реализовано)
private async formatImage(image: Image, currentUserId?: string): Promise<any> {
  // Проверяем, добавлено ли в избранное
  let isFavorite = false;
  if (currentUserId) {
    const favorite = await this.favoritesRepository.findOne({
      where: { userId: currentUserId, imageId: image.id },
    });
    isFavorite = !!favorite;
  }

  // Подсчёт избранного
  const favoritesCount = await this.favoritesRepository.count({
    where: { imageId: image.id },
  });

  return {
    // ... другие поля
    isFavorite,
    favoritesCount,
  };
}
```

---

## ⚠️ Важные замечания

### Порядок endpoints в контроллере

```typescript
// ВАЖНО: /check должен быть ДО /:imageId
@Get('check')        // GET /api/favorites/check
async checkFavorites() { ... }

@Post(':imageId')    // POST /api/favorites/:imageId
async addToFavorites() { ... }
```

Если поменять порядок, "check" будет интерпретирован как UUID и вызовет ошибку валидации.

### Оптимизация запросов

1. **Batch проверка** — используйте `GET /api/favorites/check` вместо множества отдельных запросов
2. **Лимит 50** — максимум 50 изображений за один batch запрос
3. **Кэширование** — на frontend можно кэшировать статус избранного

### Каскадное удаление

При удалении изображения или пользователя записи в favorites удаляются автоматически благодаря `onDelete: 'CASCADE'` в entity.

### Уникальность

Пара `(userId, imageId)` уникальна — нельзя добавить одно изображение в избранное дважды.

---

## ✅ Чеклист

- [ ] DTOs созданы
- [ ] FavoritesService реализован
- [ ] FavoritesController создан
- [ ] FavoritesModule создан
- [ ] Модуль зарегистрирован в AppModule
- [ ] Swagger документация
- [ ] Тестирование через curl/Swagger
- [ ] Интеграция с ImagesService работает

---

## 📋 Зависимости от других этапов

| Функционал | Зависимость | Статус |
|------------|-------------|--------|
| Изображения | ImagesModule | ✅ Этап 6 |
| Авторизация | AuthModule | ✅ Этап 3 |
| Entity Favorite | Этап 2 (Database) | ✅ Этап 2 |

---

## 🔗 Связанные endpoints

После реализации этого этапа будут работать:

| Endpoint | Описание |
|----------|----------|
| GET /api/favorites | Список избранного |
| POST /api/favorites/:imageId | Добавить в избранное |
| DELETE /api/favorites/:imageId | Удалить из избранного |
| GET /api/favorites/check | Batch проверка статуса |

---

## 🎯 Использование на Frontend

### Composable для работы с избранным

```typescript
// frontend/composables/useFavorites.ts
export const useFavorites = () => {
  const favorites = ref<Image[]>([])
  const isLoading = ref(false)
  const favoriteStatus = ref<Record<string, boolean>>({})

  // Загрузка списка избранного
  const loadFavorites = async (page = 1, pageSize = 12) => {
    isLoading.value = true
    try {
      const { data } = await useFetch('/api/favorites', {
        query: { page, pageSize }
      })
      favorites.value = data.value?.items || []
      return data.value
    } finally {
      isLoading.value = false
    }
  }

  // Toggle избранного
  const toggleFavorite = async (imageId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await $fetch(`/api/favorites/${imageId}`, { method: 'DELETE' })
      } else {
        await $fetch(`/api/favorites/${imageId}`, { method: 'POST' })
      }
      favoriteStatus.value[imageId] = !currentStatus
      return !currentStatus
    } catch (error) {
      console.error('Toggle favorite error:', error)
      throw error
    }
  }

  // Batch проверка статуса
  const checkFavoriteStatus = async (imageIds: string[]) => {
    if (!imageIds.length) return {}
    
    const { data } = await useFetch('/api/favorites/check', {
      query: { imageIds: imageIds.join(',') }
    })
    
    if (data.value?.results) {
      Object.assign(favoriteStatus.value, data.value.results)
    }
    
    return data.value?.results || {}
  }

  return {
    favorites,
    isLoading,
    favoriteStatus,
    loadFavorites,
    toggleFavorite,
    checkFavoriteStatus,
  }
}
```

### Компонент кнопки избранного

```vue
<!-- frontend/components/image/FavoriteButton.vue -->
<template>
  <button 
    @click="handleClick" 
    :class="['favorite-btn', { active: isFavorite }]"
    :disabled="isLoading"
  >
    <Icon :name="isFavorite ? 'heart-filled' : 'heart'" />
    <span v-if="showCount">{{ favoritesCount }}</span>
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  imageId: string
  isFavorite: boolean
  favoritesCount: number
  showCount?: boolean
}>()

const emit = defineEmits<{
  toggle: [newStatus: boolean, newCount: number]
}>()

const { toggleFavorite } = useFavorites()
const isLoading = ref(false)

const handleClick = async () => {
  isLoading.value = true
  try {
    const newStatus = await toggleFavorite(props.imageId, props.isFavorite)
    const newCount = props.favoritesCount + (newStatus ? 1 : -1)
    emit('toggle', newStatus, newCount)
  } finally {
    isLoading.value = false
  }
}
</script>
```