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
