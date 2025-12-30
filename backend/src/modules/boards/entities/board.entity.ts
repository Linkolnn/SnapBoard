import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Image } from '../../images/entities/image.entity';
import { BoardImage } from './board-image.entity';

/**
 * Entity доски (коллекции)
 * Доска - это тематическая коллекция изображений
 */
@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'user_id' })
  @Index('idx_boards_user_id')
  userId: string;

  @Column({ name: 'cover_image', length: 500, nullable: true })
  coverImage: string;

  @Column({ name: 'is_private', default: false })
  isPrivate: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ==================== RELATIONS ====================

  /**
   * Владелец доски
   * Связь многие-к-одному: много досок принадлежат одному пользователю
   */
  @ManyToOne(() => User, (user) => user.boards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * Изображения, загруженные на эту доску
   * Связь один-ко-многим: одна доска может содержать много изображений
   */
  @OneToMany(() => Image, (image) => image.board)
  images: Image[];

  /**
   * Сохранённые изображения с других досок
   * Связь через промежуточную таблицу board_images
   */
  @OneToMany(() => BoardImage, (boardImage) => boardImage.board)
  savedImages: BoardImage[];
}
