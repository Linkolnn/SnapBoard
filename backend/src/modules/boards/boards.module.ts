import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { BoardImage } from './entities/board-image.entity';
import { Image } from '../images/entities/image.entity';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';

/**
 * Модуль досок
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Board, BoardImage, Image]),
  ],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}
