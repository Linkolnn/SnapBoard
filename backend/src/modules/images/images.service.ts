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

  // ==================== RECOMMENDATIONS ====================

  /**
   * Получение рекомендаций для изображения
   */
  async getRecommendations(
    imageId: string,
    limit: number = 12,
    currentUserId?: string,
  ): Promise<{
    items: any[];
    sourceImage: { id: string; title: string | null; tags: string[] };
    totalMatches: number;
  }> {
    // 1. Получаем исходное изображение
    const sourceImage = await this.imagesRepository.findOne({
      where: { id: imageId },
    });

    if (!sourceImage) {
      throw new NotFoundException('Изображение не найдено');
    }

    const sourceTags = sourceImage.tags || [];
    const sourceTitle = (sourceImage.title || '').toLowerCase();
    const titleWords = sourceTitle
      .split(/\s+/)
      .filter((w) => w.length > 2);

    // Если нет тегов и слов — возвращаем пустой результат
    if (sourceTags.length === 0 && titleWords.length === 0) {
      return {
        items: [],
        sourceImage: {
          id: sourceImage.id,
          title: sourceImage.title,
          tags: [],
        },
        totalMatches: 0,
      };
    }

    // 2. Строим запрос для поиска похожих
    const queryBuilder = this.imagesRepository
      .createQueryBuilder('image')
      .leftJoinAndSelect('image.user', 'user')
      .where('image.id != :imageId', { imageId });

    // Фильтр по тегам ИЛИ словам из названия
    const conditions: string[] = [];

    if (sourceTags.length > 0) {
      conditions.push('image.tags && :tags');
      queryBuilder.setParameter('tags', sourceTags);
    }

    if (titleWords.length > 0) {
      const wordConditions = titleWords.map((word, index) => {
        queryBuilder.setParameter(`word${index}`, `%${word}%`);
        return `LOWER(image.title) LIKE :word${index}`;
      });
      conditions.push(`(${wordConditions.join(' OR ')})`);
    }

    if (conditions.length > 0) {
      queryBuilder.andWhere(`(${conditions.join(' OR ')})`);
    }

    // 3. Получаем все подходящие изображения
    const candidates = await queryBuilder.getMany();

    // 4. Рассчитываем score для каждого
    const scored = candidates.map((img) => {
      const imgTags = img.tags || [];
      const imgTitle = (img.title || '').toLowerCase();

      let score = 0;
      const matchedTags: string[] = [];

      // +2 за каждый совпадающий тег
      sourceTags.forEach((tag) => {
        if (imgTags.includes(tag)) {
          score += 2;
          matchedTags.push(tag);
        }
      });

      // +1 за каждое совпадающее слово
      titleWords.forEach((word) => {
        if (imgTitle.includes(word)) {
          score += 1;
        }
      });

      return { image: img, score, matchedTags };
    });

    // 5. Фильтруем нулевые score и сортируем
    const filtered = scored.filter((item) => item.score > 0);

    const sorted = filtered
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (
          new Date(b.image.createdAt).getTime() -
          new Date(a.image.createdAt).getTime()
        );
      })
      .slice(0, limit);

    // 6. Форматируем ответ
    const items = await Promise.all(
      sorted.map(async ({ image, score, matchedTags }) => {
        const formatted = await this.formatImage(image, currentUserId);
        return {
          ...formatted,
          score,
          matchedTags,
        };
      }),
    );

    return {
      items,
      sourceImage: {
        id: sourceImage.id,
        title: sourceImage.title,
        tags: sourceImage.tags || [],
      },
      totalMatches: filtered.length,
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
