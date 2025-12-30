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
