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

    // Проверка доступа: только владелец может видеть свою доску
    // Доски являются личными и не доступны другим пользователям
    if (board.userId !== currentUserId) {
      throw new ForbiddenException('Доступ к доске запрещён');
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
    // Проверяем существование доски
    const board = await this.boardsRepository.findOne({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException('Доска не найдена');
    }

    // Проверка доступа: только владелец может видеть изображения своей доски
    if (board.userId !== currentUserId) {
      throw new ForbiddenException('Доступ к доске запрещён');
    }

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
