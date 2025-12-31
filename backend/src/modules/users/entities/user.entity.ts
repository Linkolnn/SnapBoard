import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Board } from '../../boards/entities/board.entity';
import { Image } from '../../images/entities/image.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';

/**
 * Entity пользователя
 * Хранит данные аккаунта, профиля и связи с контентом
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ name: 'password_hash', length: 255 })
  @Exclude() // Исключаем из ответов API
  passwordHash: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string | null;

  @Column({ name: 'refresh_token', type: 'varchar', length: 500, nullable: true })
  @Exclude() // Исключаем из ответов API
  refreshToken: string | null;

  @Column({ name: 'reset_token', type: 'varchar', length: 255, nullable: true })
  @Exclude() // Исключаем из ответов API
  resetToken: string | null;

  @Column({ name: 'reset_token_expires', type: 'timestamp', nullable: true })
  @Exclude() // Исключаем из ответов API
  resetTokenExpires: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ==================== RELATIONS ====================

  /**
   * Доски пользователя
   * Связь один-ко-многим: один пользователь может иметь много досок
   */
  @OneToMany(() => Board, (board) => board.user)
  boards: Board[];

  /**
   * Изображения пользователя
   * Связь один-ко-многим: один пользователь может загрузить много изображений
   */
  @OneToMany(() => Image, (image) => image.user)
  images: Image[];

  /**
   * Избранное пользователя
   * Связь один-ко-многим: один пользователь может добавить много изображений в избранное
   */
  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];
}
