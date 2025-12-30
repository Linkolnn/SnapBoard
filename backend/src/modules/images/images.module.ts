import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { BoardImage } from '../boards/entities/board-image.entity';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';

/**
 * Модуль изображений
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Image, Favorite, BoardImage]),
  ],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
