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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить доску по ID' })
  @ApiParam({ name: 'id', description: 'ID доски' })
  @ApiResponse({ status: 200, description: 'Доска', type: BoardResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещён' })
  @ApiResponse({ status: 404, description: 'Доска не найдена' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
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
