import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Board } from './board.entity';
import { Image } from '../../images/entities/image.entity';

/**
 * Entity для сохранения изображений на доски
 * Позволяет сохранять чужие изображения на свои доски
 */
@Entity('board_images')
@Unique(['boardId', 'imageId']) // Уникальная пара board-image
export class BoardImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'board_id' })
  @Index('idx_board_images_board_id')
  boardId: string;

  @Column({ name: 'image_id' })
  imageId: string;

  @CreateDateColumn({ name: 'saved_at' })
  savedAt: Date;

  // ==================== RELATIONS ====================

  /**
   * Доска, на которую сохранено изображение
   */
  @ManyToOne(() => Board, (board) => board.savedImages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'board_id' })
  board: Board;

  /**
   * Сохранённое изображение
   */
  @ManyToOne(() => Image, (image) => image.boardImages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'image_id' })
  image: Image;
}
