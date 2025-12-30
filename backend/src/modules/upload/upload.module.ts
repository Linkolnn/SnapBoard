import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Image } from '../images/entities/image.entity';
import { Board } from '../boards/entities/board.entity';
import { User } from '../users/entities/user.entity';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';

/**
 * Модуль загрузки файлов
 *
 * Использует memory storage для Multer, чтобы получить buffer
 * для обработки через Sharp перед сохранением на диск.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Image, Board, User]),
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
