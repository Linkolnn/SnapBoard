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
