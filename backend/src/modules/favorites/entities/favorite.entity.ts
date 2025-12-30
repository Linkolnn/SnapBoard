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
import { User } from '../../users/entities/user.entity';
import { Image } from '../../images/entities/image.entity';

/**
 * Entity избранного
 * Связь многие-ко-многим между пользователями и изображениями
 */
@Entity('favorites')
@Unique(['userId', 'imageId']) // Уникальная пара user-image
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index('idx_favorites_user_id')
  userId: string;

  @Column({ name: 'image_id' })
  imageId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // ==================== RELATIONS ====================

  /**
   * Пользователь, добавивший в избранное
   */
  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * Изображение в избранном
   */
  @ManyToOne(() => Image, (image) => image.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'image_id' })
  image: Image;
}
