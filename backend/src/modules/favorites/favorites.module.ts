import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { Image } from '../images/entities/image.entity';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';

/**
 * Модуль избранного
 */
@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Image])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
