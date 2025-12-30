import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Board } from '../../boards/entities/board.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';
import { BoardImage } from '../../boards/entities/board-image.entity';

/**
 * Entity изображения
 * Хранит метаданные загруженного изображения
 */
@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  url: string;

  @Column({ length: 200, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'board_id', nullable: true })
  @Index('idx_images_board_id')
  boardId: string;

  @Column({ name: 'user_id' })
  @Index('idx_images_user_id')
  userId: string;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[];

  @Column({ type: 'int', nullable: true })
  width: number;

  @Column({ type: 'int', nullable: true })
  height: number;

  @Column({ type: 'int', nullable: true })
  size: number;

  @Column({ name: 'mime_type', length: 50, nullable: true })
  mimeType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // ==================== RELATIONS ====================

  /**
   * Доска, на которую загружено изображение
   * Связь многие-к-одному: много изображений на одной доске
   */
  @ManyToOne(() => Board, (board) => board.images, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'board_id' })
  board: Board;

  /**
   * Владелец изображения
   * Связь многие-к-одному: много изображений у одного пользователя
   */
  @ManyToOne(() => User, (user) => user.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * Записи избранного для этого изображения
   * Связь один-ко-многим
   */
  @OneToMany(() => Favorite, (favorite) => favorite.image)
  favorites: Favorite[];

  /**
   * Сохранения на другие доски
   * Связь через промежуточную таблицу board_images
   */
  @OneToMany(() => BoardImage, (boardImage) => boardImage.image)
  boardImages: BoardImage[];
}
