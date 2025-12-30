# Этап 7: Модуль загрузки файлов (Upload)

> **Статус:** В разработке
> 
> **Зависимости:** Этап 6 (Images) ✅
> 
> **Сервер:** http://localhost:3001/api
> 
> **Swagger:** http://localhost:3001/api/docs

---

## 🎯 Цель этапа

Реализовать модуль загрузки и обработки изображений: загрузка файлов через форму, загрузка по URL, валидация, обработка с помощью Sharp (ресайз, thumbnails, оптимизация), хранение файлов.

---

## 📚 Глоссарий (для frontend разработчиков)

### 📤 Multer

**Multer** — middleware для Node.js для обработки `multipart/form-data`, используется для загрузки файлов. На frontend файлы отправляются через `FormData`.

### 🖼️ Sharp

**Sharp** — высокопроизводительная библиотека для обработки изображений. Используется для:
- Ресайза изображений
- Генерации thumbnails
- Оптимизации качества
- Конвертации форматов
- Извлечения метаданных (width, height)

### 📐 Thumbnails (Миниатюры)

**Thumbnails** — уменьшенные версии изображений для быстрой загрузки в списках и превью. Генерируются автоматически при загрузке.

### 🔗 Upload by URL

**Upload by URL** — загрузка изображения по внешней ссылке. Backend скачивает файл, обрабатывает и сохраняет локально.

### 📁 Storage (Хранилище)

**Storage** — место хранения загруженных файлов. В текущей реализации — локальная файловая система (`/uploads`). Опционально можно подключить S3.

---

## 📁 Структура файлов

```
backend/src/modules/upload/
├── upload.module.ts              # Модуль
├── upload.controller.ts          # Контроллер
├── upload.service.ts             # Сервис
├── dto/
│   ├── index.ts                  # Экспорт всех DTO
│   ├── upload-file.dto.ts        # DTO загрузки файла
│   ├── upload-url.dto.ts         # DTO загрузки по URL
│   └── upload-response.dto.ts    # DTO ответа
├── config/
│   └── upload.config.ts          # Конфигурация загрузки
└── pipes/
    └── file-validation.pipe.ts   # Валидация файлов

backend/uploads/
├── images/                       # Оригинальные изображения
└── thumbnails/                   # Миниатюры
    ├── small/                    # 150x150
    ├── medium/                   # 400x400
    └── large/                    # 800x800
```

---

## 📝 API Endpoints

### POST /api/upload/file

Загрузка файла изображения.

**Headers:** 
- `Cookie: access_token=...`
- `Content-Type: multipart/form-data`

**Request (FormData):**
| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| file | File | ✅ | Файл изображения |
| title | string | ❌ | Название изображения |
| description | string | ❌ | Описание |
| tags | string | ❌ | Теги через запятую |
| boardId | string (UUID) | ❌ | ID доски для привязки |

**Response (201):**
```json
{
  "id": "uuid",
  "url": "/uploads/images/1704067200000-abc123.jpg",
  "thumbnails": {
    "small": "/uploads/thumbnails/small/1704067200000-abc123.jpg",
    "medium": "/uploads/thumbnails/medium/1704067200000-abc123.jpg",
    "large": "/uploads/thumbnails/large/1704067200000-abc123.jpg"
  },
  "title": "My Image",
  "description": "Image description",
  "tags": ["nature", "sunset"],
  "width": 1920,
  "height": 1080,
  "size": 245760,
  "mimeType": "image/jpeg",
  "user": {
    "id": "uuid",
    "username": "johndoe"
  },
  "board": {
    "id": "uuid",
    "title": "Nature Collection"
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:**
- `400` — Невалидный файл (тип, размер)
- `401` — Не авторизован
- `404` — Доска не найдена (если указан boardId)
- `413` — Файл слишком большой

---

### POST /api/upload/url

Загрузка изображения по URL.

**Headers:** `Cookie: access_token=...`

**Request:**
```json
{
  "url": "https://example.com/image.jpg",
  "title": "Downloaded Image",
  "description": "Image from external source",
  "tags": ["external", "download"],
  "boardId": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "url": "/uploads/images/1704067200000-abc123.jpg",
  "thumbnails": {
    "small": "/uploads/thumbnails/small/1704067200000-abc123.jpg",
    "medium": "/uploads/thumbnails/medium/1704067200000-abc123.jpg",
    "large": "/uploads/thumbnails/large/1704067200000-abc123.jpg"
  },
  "title": "Downloaded Image",
  "description": "Image from external source",
  "tags": ["external", "download"],
  "width": 1920,
  "height": 1080,
  "size": 245760,
  "mimeType": "image/jpeg",
  "originalUrl": "https://example.com/image.jpg",
  "user": {
    "id": "uuid",
    "username": "johndoe"
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:**
- `400` — Невалидный URL или недоступное изображение
- `400` — Неподдерживаемый формат изображения
- `401` — Не авторизован
- `413` — Изображение слишком большое

---

### DELETE /api/upload/:filename

Удаление загруженного файла.

**Headers:** `Cookie: access_token=...`

**Response (200):**
```json
{
  "message": "Файл удалён"
}
```

**Errors:**
- `401` — Не авторизован
- `403` — Нет прав на удаление
- `404` — Файл не найден

> **Примечание:** Обычно удаление файлов происходит через `DELETE /api/images/:id`, который автоматически удаляет файл. Этот endpoint для прямого удаления файла без удаления записи из БД (например, при ошибке создания записи).

---

## ⚙️ Конфигурация

### upload.config.ts

```typescript
/**
 * Конфигурация загрузки файлов
 */
export const uploadConfig = {
  // Максимальный размер файла (10MB)
  maxFileSize: 10 * 1024 * 1024,
  
  // Максимальное количество файлов за раз
  maxFiles: 10,
  
  // Разрешённые MIME типы
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ],
  
  // Разрешённые расширения
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  
  // Размеры thumbnails
  thumbnailSizes: {
    small: { width: 150, height: 150 },
    medium: { width: 400, height: 400 },
    large: { width: 800, height: 800 },
  },
  
  // Максимальный размер оригинала (ресайз если больше)
  maxImageDimension: 2560,
  
  // Качество JPEG/WebP (1-100)
  quality: 85,
  
  // Папки для хранения
  paths: {
    images: './uploads/images',
    thumbnails: './uploads/thumbnails',
  },
};

/**
 * Получение конфигурации из переменных окружения
 */
export const getUploadConfig = () => ({
  ...uploadConfig,
  maxFileSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10),
  quality: parseInt(process.env.UPLOAD_QUALITY || '85', 10),
});
```

---

## 💻 Реализация

### DTOs

#### upload-file.dto.ts

```typescript
import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для загрузки файла
 */
export class UploadFileDto {
  @ApiProperty({
    example: 'Beautiful Sunset',
    description: 'Название изображения',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Название должно быть максимум 200 символов' })
  title?: string;

  @ApiProperty({
    example: 'Sunset over the ocean',
    description: 'Описание изображения',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Описание должно быть максимум 2000 символов' })
  description?: string;

  @ApiProperty({
    example: 'nature,sunset,ocean',
    description: 'Теги через запятую',
    required: false,
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({
    example: 'uuid',
    description: 'ID доски для привязки',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Некорректный ID доски' })
  boardId?: string;
}
```

#### upload-url.dto.ts

```typescript
import { IsString, IsOptional, IsUUID, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для загрузки по URL
 */
export class UploadUrlDto {
  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL изображения для загрузки',
  })
  @IsUrl({}, { message: 'Некорректный URL' })
  url: string;

  @ApiProperty({
    example: 'Downloaded Image',
    description: 'Название изображения',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Название должно быть максимум 200 символов' })
  title?: string;

  @ApiProperty({
    example: 'Image from external source',
    description: 'Описание изображения',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Описание должно быть максимум 2000 символов' })
  description?: string;

  @ApiProperty({
    example: 'external,download',
    description: 'Теги через запятую',
    required: false,
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({
    example: 'uuid',
    description: 'ID доски для привязки',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Некорректный ID доски' })
  boardId?: string;
}
```

#### upload-response.dto.ts

```typescript
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO thumbnails
 */
export class ThumbnailsDto {
  @ApiProperty({ example: '/uploads/thumbnails/small/image.jpg' })
  small: string;

  @ApiProperty({ example: '/uploads/thumbnails/medium/image.jpg' })
  medium: string;

  @ApiProperty({ example: '/uploads/thumbnails/large/image.jpg' })
  large: string;
}

/**
 * DTO владельца (краткая информация)
 */
export class UploadUserDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;
}

/**
 * DTO доски (краткая информация)
 */
export class UploadBoardDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Nature Collection' })
  title: string;
}

/**
 * DTO ответа загрузки
 */
export class UploadResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: '/uploads/images/1704067200000-abc123.jpg' })
  url: string;

  @ApiProperty({ type: ThumbnailsDto })
  thumbnails: ThumbnailsDto;

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

  @ApiProperty({ example: 245760 })
  size: number;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', nullable: true })
  originalUrl?: string | null;

  @ApiProperty({ type: UploadUserDto })
  user: UploadUserDto;

  @ApiProperty({ type: UploadBoardDto, nullable: true })
  board: UploadBoardDto | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}
```

#### dto/index.ts

```typescript
export * from './upload-file.dto';
export * from './upload-url.dto';
export * from './upload-response.dto';
```

---

### File Validation Pipe

#### pipes/file-validation.pipe.ts

```typescript
import {
  PipeTransform,
  Injectable,
  BadRequestException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { uploadConfig } from '../config/upload.config';

/**
 * Pipe для валидации загружаемых файлов
 */
@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    // Проверка MIME типа
    if (!uploadConfig.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Неподдерживаемый формат файла. Разрешены: ${uploadConfig.allowedMimeTypes.join(', ')}`,
      );
    }

    // Проверка размера
    if (file.size > uploadConfig.maxFileSize) {
      throw new PayloadTooLargeException(
        `Файл слишком большой. Максимальный размер: ${uploadConfig.maxFileSize / 1024 / 1024}MB`,
      );
    }

    // Проверка расширения
    const ext = '.' + file.originalname.split('.').pop()?.toLowerCase();
    if (!uploadConfig.allowedExtensions.includes(ext)) {
      throw new BadRequestException(
        `Неподдерживаемое расширение файла. Разрешены: ${uploadConfig.allowedExtensions.join(', ')}`,
      );
    }

    return file;
  }
}
```

---

### upload.service.ts

```typescript
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import axios from 'axios';
import { Image } from '../images/entities/image.entity';
import { Board } from '../boards/entities/board.entity';
import { UploadFileDto, UploadUrlDto } from './dto';
import { uploadConfig } from './config/upload.config';

/**
 * Интерфейс метаданных изображения
 */
interface ImageMetadata {
  width: number;
  height: number;
  size: number;
  mimeType: string;
}

/**
 * Интерфейс результата обработки
 */
interface ProcessedImage {
  filename: string;
  url: string;
  thumbnails: {
    small: string;
    medium: string;
    large: string;
  };
  metadata: ImageMetadata;
}

/**
 * Сервис загрузки и обработки изображений
 */
@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Image)
    private imagesRepository: Repository<Image>,
    @InjectRepository(Board)
    private boardsRepository: Repository<Board>,
  ) {
    // Создаём папки для хранения при инициализации
    this.ensureDirectories();
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * Загрузка файла
   */
  async uploadFile(
    file: Express.Multer.File,
    dto: UploadFileDto,
    userId: string,
  ): Promise<any> {
    // Проверяем доску, если указана
    let board: Board | null = null;
    if (dto.boardId) {
      board = await this.validateBoard(dto.boardId, userId);
    }

    // Обрабатываем изображение
    const processed = await this.processImage(file.buffer, file.originalname);

    // Создаём запись в БД
    const image = await this.createImageRecord(
      processed,
      dto,
      userId,
      board?.id,
    );

    return this.formatResponse(image, processed.thumbnails, board);
  }

  /**
   * Загрузка по URL
   */
  async uploadFromUrl(dto: UploadUrlDto, userId: string): Promise<any> {
    // Проверяем доску, если указана
    let board: Board | null = null;
    if (dto.boardId) {
      board = await this.validateBoard(dto.boardId, userId);
    }

    // Скачиваем изображение
    const { buffer, mimeType, originalName } = await this.downloadImage(dto.url);

    // Проверяем MIME тип
    if (!uploadConfig.allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException(
        `Неподдерживаемый формат изображения. Разрешены: ${uploadConfig.allowedMimeTypes.join(', ')}`,
      );
    }

    // Обрабатываем изображение
    const processed = await this.processImage(buffer, originalName);

    // Создаём запись в БД
    const image = await this.createImageRecord(
      processed,
      { ...dto, tags: dto.tags },
      userId,
      board?.id,
    );

    return {
      ...this.formatResponse(image, processed.thumbnails, board),
      originalUrl: dto.url,
    };
  }

  /**
   * Удаление файла
   */
  async deleteFile(filename: string, userId: string): Promise<void> {
    // Находим изображение по URL
    const url = `/uploads/images/${filename}`;
    const image = await this.imagesRepository.findOne({
      where: { url },
    });

    if (!image) {
      throw new NotFoundException('Файл не найден');
    }

    if (image.userId !== userId) {
      throw new ForbiddenException('Нет прав на удаление этого файла');
    }

    // Удаляем файлы
    await this.deleteImageFiles(filename);

    // Удаляем запись из БД
    await this.imagesRepository.remove(image);
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Создание необходимых директорий
   */
  private ensureDirectories(): void {
    const dirs = [
      uploadConfig.paths.images,
      path.join(uploadConfig.paths.thumbnails, 'small'),
      path.join(uploadConfig.paths.thumbnails, 'medium'),
      path.join(uploadConfig.paths.thumbnails, 'large'),
    ];

    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Валидация доски
   */
  private async validateBoard(boardId: string, userId: string): Promise<Board> {
    const board = await this.boardsRepository.findOne({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException('Доска не найдена');
    }

    if (board.userId !== userId) {
      throw new ForbiddenException('Нет прав на добавление изображений на эту доску');
    }

    return board;
  }

  /**
   * Скачивание изображения по URL
   */
  private async downloadImage(url: string): Promise<{
    buffer: Buffer;
    mimeType: string;
    originalName: string;
  }> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 секунд
        maxContentLength: uploadConfig.maxFileSize,
        headers: {
          'User-Agent': 'SnapBoard/1.0',
        },
      });

      const buffer = Buffer.from(response.data);
      const mimeType = response.headers['content-type']?.split(';')[0] || 'image/jpeg';
      
      // Извлекаем имя файла из URL
      const urlPath = new URL(url).pathname;
      const originalName = path.basename(urlPath) || 'downloaded-image.jpg';

      // Проверяем размер
      if (buffer.length > uploadConfig.maxFileSize) {
        throw new BadRequestException(
          `Изображение слишком большое. Максимальный размер: ${uploadConfig.maxFileSize / 1024 / 1024}MB`,
        );
      }

      return { buffer, mimeType, originalName };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Не удалось загрузить изображение по указанному URL');
    }
  }

  /**
   * Обработка изображения с Sharp
   */
  private async processImage(
    buffer: Buffer,
    originalName: string,
  ): Promise<ProcessedImage> {
    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const hash = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(originalName).toLowerCase() || '.jpg';
    const filename = `${timestamp}-${hash}${ext}`;

    // Получаем метаданные оригинала
    const metadata = await sharp(buffer).metadata();
    
    let processedBuffer = buffer;
    let width = metadata.width || 0;
    let height = metadata.height || 0;

    // Ресайз если изображение слишком большое
    if (width > uploadConfig.maxImageDimension || height > uploadConfig.maxImageDimension) {
      const resized = await sharp(buffer)
        .resize(uploadConfig.maxImageDimension, uploadConfig.maxImageDimension, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: uploadConfig.quality })
        .toBuffer({ resolveWithObject: true });

      processedBuffer = resized.data;
      width = resized.info.width;
      height = resized.info.height;
    }

    // Сохраняем оригинал (или ресайзнутый)
    const imagePath = path.join(uploadConfig.paths.images, filename);
    await sharp(processedBuffer)
      .jpeg({ quality: uploadConfig.quality })
      .toFile(imagePath);

    // Генерируем thumbnails
    const thumbnails = await this.generateThumbnails(processedBuffer, filename);

    // Получаем финальный размер файла
    const stats = fs.statSync(imagePath);

    return {
      filename,
      url: `/uploads/images/${filename}`,
      thumbnails,
      metadata: {
        width,
        height,
        size: stats.size,
        mimeType: `image/${ext.replace('.', '')}`,
      },
    };
  }

  /**
   * Генерация thumbnails
   */
  private async generateThumbnails(
    buffer: Buffer,
    filename: string,
  ): Promise<{ small: string; medium: string; large: string }> {
    const thumbnails: { small: string; medium: string; large: string } = {
      small: '',
      medium: '',
      large: '',
    };

    const sizes = uploadConfig.thumbnailSizes;

    // Small thumbnail
    const smallPath = path.join(uploadConfig.paths.thumbnails, 'small', filename);
    await sharp(buffer)
      .resize(sizes.small.width, sizes.small.height, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toFile(smallPath);
    thumbnails.small = `/uploads/thumbnails/small/${filename}`;

    // Medium thumbnail
    const mediumPath = path.join(uploadConfig.paths.thumbnails, 'medium', filename);
    await sharp(buffer)
      .resize(sizes.medium.width, sizes.medium.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toFile(mediumPath);
    thumbnails.medium = `/uploads/thumbnails/medium/${filename}`;

    // Large thumbnail
    const largePath = path.join(uploadConfig.paths.thumbnails, 'large', filename);
    await sharp(buffer)
      .resize(sizes.large.width, sizes.large.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toFile(largePath);
    thumbnails.large = `/uploads/thumbnails/large/${filename}`;

    return thumbnails;
  }

  /**
   * Создание записи в БД
   */
  private async createImageRecord(
    processed: ProcessedImage,
    dto: UploadFileDto | UploadUrlDto,
    userId: string,
    boardId?: string,
  ): Promise<Image> {
    // Парсим теги
    const tags = dto.tags
      ? dto.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
      : null;

    const image = this.imagesRepository.create({
      url: processed.url,
      title: dto.title || null,
      description: dto.description || null,
      tags,
      width: processed.metadata.width,
      height: processed.metadata.height,
      size: processed.metadata.size,
      mimeType: processed.metadata.mimeType,
      userId,
      boardId: boardId || null,
    });

    return this.imagesRepository.save(image);
  }

  /**
   * Удаление файлов изображения
   */
  private async deleteImageFiles(filename: string): Promise<void> {
    const paths = [
      path.join(uploadConfig.paths.images, filename),
      path.join(uploadConfig.paths.thumbnails, 'small', filename),
      path.join(uploadConfig.paths.thumbnails, 'medium', filename),
      path.join(uploadConfig.paths.thumbnails, 'large', filename),
    ];

    for (const filePath of paths) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error(`Ошибка удаления файла ${filePath}:`, error);
      }
    }
  }

  /**
   * Форматирование ответа
   */
  private formatResponse(
    image: Image,
    thumbnails: { small: string; medium: string; large: string },
    board: Board | null,
  ): any {
    return {
      id: image.id,
      url: image.url,
      thumbnails,
      title: image.title,
      description: image.description,
      tags: image.tags,
      width: image.width,
      height: image.height,
      size: image.size,
      mimeType: image.mimeType,
      user: {
        id: image.userId,
        username: '', // Будет заполнено при загрузке связей
      },
      board: board
        ? {
            id: board.id,
            title: board.title,
          }
        : null,
      createdAt: image.createdAt,
    };
  }
}
```

---

### upload.controller.ts

```typescript
import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { UploadFileDto, UploadUrlDto, UploadResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FileValidationPipe } from './pipes/file-validation.pipe';
import { uploadConfig } from './config/upload.config';

/**
 * Контроллер загрузки файлов
 * 
 * API Endpoints:
 * POST   /api/upload/file      — загрузка файла
 * POST   /api/upload/url       — загрузка по URL
 * DELETE /api/upload/:filename — удаление файла
 */
@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private uploadService: UploadService) {}

  /**
   * Загрузка файла
   */
  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: uploadConfig.maxFileSize,
      },
    }),
  )
  @ApiOperation({ summary: 'Загрузить файл изображения' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Файл изображения',
        },
        title: {
          type: 'string',
          description: 'Название изображения',
        },
        description: {
          type: 'string',
          description: 'Описание изображения',
        },
        tags: {
          type: 'string',
          description: 'Теги через запятую',
        },
        boardId: {
          type: 'string',
          format: 'uuid',
          description: 'ID доски для привязки',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Файл загружен', type: UploadResponseDto })
  @ApiResponse({ status: 400, description: 'Невалидный файл' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 413, description: 'Файл слишком большой' })
  async uploadFile(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.uploadService.uploadFile(file, dto, userId);
  }

  /**
   * Загрузка по URL
   */
  @Post('url')
  @ApiOperation({ summary: 'Загрузить изображение по URL' })
  @ApiResponse({ status: 201, description: 'Изображение загружено', type: UploadResponseDto })
  @ApiResponse({ status: 400, description: 'Невалидный URL или недоступное изображение' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 413, description: 'Изображение слишком большое' })
  async uploadFromUrl(
    @Body() dto: UploadUrlDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.uploadService.uploadFromUrl(dto, userId);
  }

  /**
   * Удаление файла
   */
  @Delete(':filename')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить файл' })
  @ApiParam({ name: 'filename', description: 'Имя файла' })
  @ApiResponse({ status: 200, description: 'Файл удалён' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав' })
  @ApiResponse({ status: 404, description: 'Файл не найден' })
  async deleteFile(
    @Param('filename') filename: string,
    @CurrentUser('userId') userId: string,
  ) {
    await this.uploadService.deleteFile(filename, userId);
    return { message: 'Файл удалён' };
  }
}
```

---

### upload.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Image } from '../images/entities/image.entity';
import { Board } from '../boards/entities/board.entity';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';

/**
 * Модуль загрузки файлов
 * 
 * Использует memory storage для Multer, чтобы получить buffer
 * для обработки через Sharp перед сохранением на диск.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Image, Board]),
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
```

---

## 🔧 Регистрация модуля в AppModule

### app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
// ... другие импорты
import { UploadModule } from './modules/upload/upload.module'; // Добавить

@Module({
  imports: [
    ConfigModule.forRoot({ /* ... */ }),
    TypeOrmModule.forRootAsync({ /* ... */ }),
    
    // Статические файлы (uploads)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    
    AuthModule,
    UsersModule,
    BoardsModule,
    ImagesModule,
    UploadModule, // Добавить
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
# ==================== ЗАГРУЗКА ФАЙЛА ====================

# Загрузка изображения
curl -X POST http://localhost:3001/api/upload/file \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/image.jpg" \
  -F "title=My Beautiful Image" \
  -F "description=A sunset over the ocean" \
  -F "tags=nature,sunset,ocean" \
  -b cookies.txt

# Загрузка с привязкой к доске
curl -X POST http://localhost:3001/api/upload/file \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/image.jpg" \
  -F "title=Board Image" \
  -F "boardId={board-uuid}" \
  -b cookies.txt

# ==================== ЗАГРУЗКА ПО URL ====================

# Загрузка изображения по URL
curl -X POST http://localhost:3001/api/upload/url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/beautiful-image.jpg",
    "title": "Downloaded Image",
    "description": "Image from external source",
    "tags": "external,download"
  }' \
  -b cookies.txt

# Загрузка по URL с привязкой к доске
curl -X POST http://localhost:3001/api/upload/url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/image.jpg",
    "boardId": "{board-uuid}"
  }' \
  -b cookies.txt

# ==================== УДАЛЕНИЕ ФАЙЛА ====================

# Удаление файла
curl -X DELETE http://localhost:3001/api/upload/1704067200000-abc123.jpg \
  -b cookies.txt
```

### Тестирование с JavaScript (Frontend)

```javascript
// Загрузка файла через FormData
const uploadFile = async (file, metadata) => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (metadata.title) formData.append('title', metadata.title);
  if (metadata.description) formData.append('description', metadata.description);
  if (metadata.tags) formData.append('tags', metadata.tags.join(','));
  if (metadata.boardId) formData.append('boardId', metadata.boardId);
  
  const response = await fetch('/api/upload/file', {
    method: 'POST',
    body: formData,
    credentials: 'include', // для cookies
  });
  
  return response.json();
};

// Загрузка по URL
const uploadFromUrl = async (url, metadata) => {
  const response = await fetch('/api/upload/url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      ...metadata,
      tags: metadata.tags?.join(','),
    }),
    credentials: 'include',
  });
  
  return response.json();
};
```

---

## 🔄 Схема работы загрузки

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ЗАГРУЗКА ФАЙЛА                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Frontend                          Backend                              │
│  ─────────                         ───────                              │
│                                                                         │
│  POST /api/upload/file ─────────►  JwtAuthGuard                         │
│  FormData: file, title, ...        │                                    │
│  Cookie: access_token              ▼                                    │
│                                    FileValidationPipe                   │
│                                    - Проверка MIME типа                 │
│                                    - Проверка размера                   │
│                                    - Проверка расширения                │
│                                    │                                    │
│                                    ▼                                    │
│                                    UploadService.uploadFile()           │
│                                    │                                    │
│                                    ▼                                    │
│                                    Валидация доски (если указана)       │
│                                    │                                    │
│                                    ▼                                    │
│                                    Sharp: обработка изображения         │
│                                    - Ресайз (если > 2560px)             │
│                                    - Оптимизация качества               │
│                                    │                                    │
│                                    ▼                                    │
│                                    Генерация thumbnails                 │
│                                    - small (150x150)                    │
│                                    - medium (400x400)                   │
│                                    - large (800x800)                    │
│                                    │                                    │
│                                    ▼                                    │
│                                    Сохранение файлов на диск            │
│                                    │                                    │
│                                    ▼                                    │
│                                    Создание записи в БД                 │
│                                    │                                    │
│                                    ▼                                    │
│  ◄──────────────────────────────── { id, url, thumbnails, ... }         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         ЗАГРУЗКА ПО URL                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Frontend                          Backend                              │
│  ─────────                         ───────                              │
│                                                                         │
│  POST /api/upload/url ──────────►  JwtAuthGuard                         │
│  { url, title, ... }               │                                    │
│  Cookie: access_token              ▼                                    │
│                                    UploadService.uploadFromUrl()        │
│                                    │                                    │
│                                    ▼                                    │
│                                    Скачивание изображения (axios)       │
│                                    - Timeout: 30 сек                    │
│                                    - Max size: 10MB                     │
│                                    │                                    │
│                                    ▼                                    │
│                                    Проверка MIME типа                   │
│                                    │                                    │
│                                    ▼                                    │
│                                    Sharp: обработка изображения         │
│                                    │                                    │
│                                    ▼                                    │
│                                    Генерация thumbnails                 │
│                                    │                                    │
│                                    ▼                                    │
│                                    Сохранение файлов на диск            │
│                                    │                                    │
│                                    ▼                                    │
│                                    Создание записи в БД                 │
│                                    │                                    │
│                                    ▼                                    │
│  ◄──────────────────────────────── { id, url, thumbnails, originalUrl } │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Важные замечания

### Обработка изображений (Sharp)

1. **Ресайз** — изображения больше 2560px автоматически уменьшаются
2. **Качество** — JPEG сохраняется с качеством 85% (настраивается)
3. **Thumbnails** — генерируются три размера для разных сценариев использования
4. **Memory storage** — Multer использует память для буфера, чтобы Sharp мог обработать до сохранения

### Безопасность

1. **Валидация MIME типа** — проверяется на уровне pipe
2. **Валидация расширения** — дополнительная проверка
3. **Ограничение размера** — 10MB по умолчанию
4. **Уникальные имена** — timestamp + random hash предотвращают коллизии
5. **Проверка прав** — только владелец может удалить файл

### Хранение файлов

1. **Локальное хранение** — файлы в папке `uploads/`
2. **Структура папок**:
   - `uploads/images/` — оригиналы
   - `uploads/thumbnails/small/` — 150x150
   - `uploads/thumbnails/medium/` — 400x400
   - `uploads/thumbnails/large/` — 800x800
3. **Статические файлы** — раздаются через `ServeStaticModule`

### Загрузка по URL

1. **Timeout** — 30 секунд на скачивание
2. **User-Agent** — отправляется для совместимости с CDN
3. **Проверка размера** — до и после скачивания
4. **Обработка ошибок** — graceful handling недоступных URL

---

## ✅ Чеклист

- [ ] Конфигурация загрузки создана
- [ ] DTOs созданы
- [ ] FileValidationPipe реализован
- [ ] UploadService реализован
- [ ] UploadController создан
- [ ] UploadModule создан
- [ ] Модуль зарегистрирован в AppModule
- [ ] ServeStaticModule настроен для uploads
- [ ] Папки uploads созданы
- [ ] Swagger документация
- [ ] Тестирование через curl/Swagger

---

## 📋 Зависимости от других этапов

| Функционал | Зависимость | Статус |
|------------|-------------|--------|
| Сохранение в БД | ImagesModule | ✅ Этап 6 |
| Привязка к доске | BoardsModule | ✅ Этап 5 |
| Авторизация | AuthModule | ✅ Этап 3 |

---

## 🔗 Связанные endpoints

После реализации этого этапа будут работать:

| Endpoint | Описание |
|----------|----------|
| POST /api/upload/file | Загрузка файла |
| POST /api/upload/url | Загрузка по URL |
| DELETE /api/upload/:filename | Удаление файла |

---

## 🔧 Дополнительные настройки

### Переменные окружения

```env
# Upload configuration
UPLOAD_MAX_SIZE=10485760        # 10MB в байтах
UPLOAD_QUALITY=85               # Качество JPEG (1-100)
UPLOAD_MAX_DIMENSION=2560       # Максимальный размер стороны
```

### Расширение для S3 (опционально)

Для production рекомендуется использовать S3 или аналогичное облачное хранилище:

```typescript
// storage/s3.storage.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export class S3Storage {
  private s3: S3Client;
  private bucket: string;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucket = process.env.AWS_S3_BUCKET;
  }

  async upload(buffer: Buffer, key: string, mimeType: string): Promise<string> {
    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }));
    
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
  }
}
```
