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
