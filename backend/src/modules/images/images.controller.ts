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
  RecommendationsQueryDto,
  RecommendationsResponseDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Контроллер изображений
 * 
 * API Endpoints:
 * GET    /api/images                     — список изображений
 * GET    /api/images/:id/recommendations — рекомендации для изображения
 * GET    /api/images/:id                 — получить изображение
 * PUT    /api/images/:id                 — обновить изображение
 * DELETE /api/images/:id                 — удалить изображение
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
   * Получение рекомендаций для изображения
   * ВАЖНО: Этот endpoint должен быть ПЕРЕД @Get(':id')
   */
  @Get(':id/recommendations')
  @Public()
  @ApiOperation({ summary: 'Получить похожие изображения' })
  @ApiParam({ name: 'id', description: 'ID изображения' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество (max: 50)' })
  @ApiResponse({ status: 200, description: 'Список рекомендаций', type: RecommendationsResponseDto })
  @ApiResponse({ status: 404, description: 'Изображение не найдено' })
  async getRecommendations(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: RecommendationsQueryDto,
    @CurrentUser('userId') userId?: string,
  ) {
    return this.imagesService.getRecommendations(id, query.limit, userId);
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
