import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import axios from 'axios';
import { Image } from '../images/entities/image.entity';
import { Board } from '../boards/entities/board.entity';
import { User } from '../users/entities/user.entity';
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
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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
    // Получаем пользователя
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

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

    return this.formatResponse(image, processed.thumbnails, user, board);
  }


  /**
   * Загрузка по URL
   */
  async uploadFromUrl(dto: UploadUrlDto, userId: string): Promise<any> {
    // Получаем пользователя
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

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
      ...this.formatResponse(image, processed.thumbnails, user, board),
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
      : [];

    const image = new Image();
    image.url = processed.url;
    image.title = dto.title || '';
    image.description = dto.description || '';
    image.tags = tags;
    image.width = processed.metadata.width;
    image.height = processed.metadata.height;
    image.size = processed.metadata.size;
    image.mimeType = processed.metadata.mimeType;
    image.userId = userId;
    image.boardId = boardId || '';

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
    user: User,
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
        id: user.id,
        username: user.username,
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
