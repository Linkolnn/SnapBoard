import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs/promises';
import * as path from 'path';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateProfileDto, ChangePasswordDto } from './dto';

/**
 * Сервис для работы с пользователями
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // ==================== AUTH METHODS ====================

  /**
   * Создание нового пользователя
   */
  async create(registerDto: RegisterDto): Promise<User> {
    const existingByEmail = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });
    
    if (existingByEmail) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const existingByUsername = await this.usersRepository.findOne({
      where: { username: registerDto.username },
    });
    
    if (existingByUsername) {
      throw new ConflictException('Пользователь с таким username уже существует');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = this.usersRepository.create({
      email: registerDto.email,
      username: registerDto.username,
      passwordHash,
      name: registerDto.name ?? null,
    });

    return await this.usersRepository.save(user);
  }


  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken: refreshToken ?? undefined });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  // ==================== PROFILE METHODS ====================

  /**
   * Получение профиля пользователя
   */
  async getProfile(userId: string): Promise<User> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  /**
   * Обновление профиля
   */
  async updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (updateDto.name !== undefined) {
      user.name = updateDto.name || null;
    }
    if (updateDto.bio !== undefined) {
      user.bio = updateDto.bio || null;
    }

    return await this.usersRepository.save(user);
  }

  /**
   * Смена пароля
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isPasswordValid = await this.validatePassword(user, changePasswordDto.currentPassword);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный текущий пароль');
    }

    user.passwordHash = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.usersRepository.save(user);
  }

  /**
   * Обновление аватара
   */
  async updateAvatar(userId: string, avatarPath: string): Promise<User> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user.avatar) {
      await this.deleteAvatarFile(user.avatar);
    }

    user.avatar = avatarPath;
    return await this.usersRepository.save(user);
  }

  /**
   * Удаление аватара
   */
  async removeAvatar(userId: string): Promise<void> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user.avatar) {
      await this.deleteAvatarFile(user.avatar);
      user.avatar = null;
      await this.usersRepository.save(user);
    }
  }

  /**
   * Удаление аккаунта
   */
  async deleteAccount(userId: string, password: string): Promise<void> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isPasswordValid = await this.validatePassword(user, password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный пароль');
    }

    if (user.avatar) {
      await this.deleteAvatarFile(user.avatar);
    }

    await this.usersRepository.remove(user);
  }

  /**
   * Получение статистики пользователя
   */
  async getStats(userId: string): Promise<{ boardsCount: number; imagesCount: number; favoritesCount: number }> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['boards', 'images', 'favorites'],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return {
      boardsCount: user.boards?.length || 0,
      imagesCount: user.images?.length || 0,
      favoritesCount: user.favorites?.length || 0,
    };
  }

  // ==================== PRIVATE METHODS ====================

  private async deleteAvatarFile(avatarPath: string): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), avatarPath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.warn(`Failed to delete avatar file: ${avatarPath}`);
    }
  }
}
