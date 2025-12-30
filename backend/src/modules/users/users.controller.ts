import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { BoardsService } from '../boards/boards.service';
import {
  UpdateProfileDto,
  ChangePasswordDto,
  DeleteAccountDto,
  ProfileResponseDto,
  StatsResponseDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

/**
 * Контроллер профиля пользователя
 */
@ApiTags('Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private boardsService: BoardsService,
  ) {}

  /**
   * Получение профиля текущего пользователя
   */
  @Get()
  @ApiOperation({ summary: 'Получить профиль' })
  @ApiResponse({ status: 200, description: 'Профиль пользователя', type: ProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getProfile(@CurrentUser('userId') userId: string) {
    const user = await this.usersService.getProfile(userId);
    return this.sanitizeUser(user);
  }


  /**
   * Обновление профиля
   */
  @Put()
  @ApiOperation({ summary: 'Обновить профиль' })
  @ApiResponse({ status: 200, description: 'Профиль обновлён', type: ProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() updateDto: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateProfile(userId, updateDto);
    return this.sanitizeUser(user);
  }

  /**
   * Смена пароля
   */
  @Put('password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Сменить пароль' })
  @ApiResponse({ status: 200, description: 'Пароль изменён' })
  @ApiResponse({ status: 401, description: 'Неверный текущий пароль' })
  async changePassword(
    @CurrentUser('userId') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(userId, changePasswordDto);
    return { message: 'Пароль успешно изменён' };
  }

  /**
   * Загрузка аватара
   */
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Загрузить аватар' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Изображение (jpeg, png, webp, gif), макс. 5MB',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Аватар загружен' })
  @ApiResponse({ status: 400, description: 'Неверный формат файла' })
  async uploadAvatar(
    @CurrentUser('userId') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const avatarPath = `/uploads/avatars/${file.filename}`;
    await this.usersService.updateAvatar(userId, avatarPath);
    return {
      avatar: avatarPath,
      message: 'Аватар обновлён',
    };
  }

  /**
   * Удаление аватара
   */
  @Delete('avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить аватар' })
  @ApiResponse({ status: 200, description: 'Аватар удалён' })
  async removeAvatar(@CurrentUser('userId') userId: string) {
    await this.usersService.removeAvatar(userId);
    return { message: 'Аватар удалён' };
  }

  /**
   * Удаление аккаунта
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить аккаунт' })
  @ApiResponse({ status: 200, description: 'Аккаунт удалён' })
  @ApiResponse({ status: 401, description: 'Неверный пароль' })
  async deleteAccount(
    @CurrentUser('userId') userId: string,
    @Body() deleteAccountDto: DeleteAccountDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.usersService.deleteAccount(userId, deleteAccountDto.password);
    
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    
    return { message: 'Аккаунт удалён' };
  }

  /**
   * Статистика пользователя
   */
  @Get('stats')
  @ApiOperation({ summary: 'Получить статистику' })
  @ApiResponse({ status: 200, description: 'Статистика', type: StatsResponseDto })
  async getStats(@CurrentUser('userId') userId: string) {
    return this.usersService.getStats(userId);
  }

  /**
   * Доски пользователя
   */
  @Get('boards')
  @ApiOperation({ summary: 'Получить доски пользователя' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Список досок' })
  async getBoards(
    @CurrentUser('userId') userId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.boardsService.getUserBoards(userId, page || 1, pageSize || 12);
  }

  /**
   * Изображения пользователя
   */
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
    // TODO: Реализовать в ImagesService (Этап 6)
    return {
      items: [],
      page: page || 1,
      pageSize: pageSize || 12,
      totalItems: 0,
      totalPages: 0,
      hasMore: false,
    };
  }

  // ==================== PRIVATE METHODS ====================

  private sanitizeUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  }
}
