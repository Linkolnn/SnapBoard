# Этап 4: Модуль пользователей (Profile) ✅

> **Статус:** Реализовано и протестировано
> 
> **Зависимости:** Этап 3 (Auth) ✅
> 
> **Сервер:** http://localhost:3001/api
> 
> **Swagger:** http://localhost:3001/api/docs

---

## 🎯 Цель этапа

Реализовать полноценный модуль управления профилем пользователя: получение и обновление данных профиля, смена пароля, загрузка аватара, удаление аккаунта и статистика.

---

## 📚 Глоссарий (для frontend разработчиков)

### 👤 Profile vs User

**User** — сущность в базе данных, содержит все данные пользователя включая пароль и токены.

**Profile** — публичное представление пользователя, без чувствительных данных (пароль, refresh token).

### 📊 Stats (Статистика)

**Stats** — агрегированные данные о контенте пользователя:
- Количество досок
- Количество изображений
- Количество избранного

### 🖼️ Avatar

**Avatar** — изображение профиля пользователя. Хранится как URL к файлу в папке uploads.

### 🔐 Password Change

При смене пароля требуется:
1. Текущий пароль (для подтверждения)
2. Новый пароль (минимум 6 символов)

### ⚠️ Account Deletion

Удаление аккаунта — необратимая операция. При удалении:
- Удаляются все доски пользователя
- Удаляются все изображения пользователя
- Удаляется избранное
- Очищаются cookies

---

## 📁 Структура файлов

```
backend/src/modules/users/
├── users.module.ts              # Модуль (обновить)
├── users.controller.ts          # Контроллер профиля (создать)
├── users.service.ts             # Сервис (расширить)
├── entities/
│   └── user.entity.ts           # Entity (уже есть)
└── dto/
    ├── index.ts                 # Экспорт всех DTO
    ├── update-profile.dto.ts    # DTO обновления профиля
    ├── change-password.dto.ts   # DTO смены пароля
    ├── profile-response.dto.ts  # DTO ответа профиля
    └── stats-response.dto.ts    # DTO статистики
```

---

## 📝 API Endpoints

### GET /api/profile

Получение профиля текущего пользователя.

**Headers:** `Cookie: access_token=...` или `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "johndoe",
  "name": "John Doe",
  "bio": "Frontend developer",
  "avatar": "/uploads/avatars/uuid.jpg",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### PUT /api/profile

Обновление профиля (имя, bio).

**Headers:** `Cookie: access_token=...`

**Request:**
```json
{
  "name": "John Smith",
  "bio": "Full-stack developer"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "johndoe",
  "name": "John Smith",
  "bio": "Full-stack developer",
  "avatar": "/uploads/avatars/uuid.jpg",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### PUT /api/profile/password

Смена пароля.

**Headers:** `Cookie: access_token=...`

**Request:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Response (200):**
```json
{
  "message": "Пароль успешно изменён"
}
```

**Errors:**
- `400` — Новый пароль слишком короткий
- `401` — Неверный текущий пароль

---

### POST /api/profile/avatar

Загрузка аватара.

**Headers:** `Cookie: access_token=...`

**Request:** `multipart/form-data`
- `file` — изображение (jpeg, png, webp, gif), макс. 5MB

**Response (200):**
```json
{
  "avatar": "/uploads/avatars/uuid-1704067200000.jpg",
  "message": "Аватар обновлён"
}
```

**Errors:**
- `400` — Неверный формат файла
- `400` — Файл слишком большой

---

### DELETE /api/profile/avatar

Удаление аватара.

**Headers:** `Cookie: access_token=...`

**Response (200):**
```json
{
  "message": "Аватар удалён"
}
```

---

### DELETE /api/profile

Удаление аккаунта.

**Headers:** `Cookie: access_token=...`

**Request:**
```json
{
  "password": "currentPassword123"
}
```

**Response (200):**
```json
{
  "message": "Аккаунт удалён"
}
```

**Cookies:** Очищаются `access_token` и `refresh_token`

**Errors:**
- `401` — Неверный пароль

---

### GET /api/profile/stats

Статистика пользователя.

**Headers:** `Cookie: access_token=...`

**Response (200):**
```json
{
  "boardsCount": 5,
  "imagesCount": 42,
  "favoritesCount": 18
}
```

---

### GET /api/profile/boards

Доски текущего пользователя (включая приватные).

**Headers:** `Cookie: access_token=...`

**Query параметры:**
- `page` — номер страницы (default: 1)
- `pageSize` — размер страницы (default: 12, max: 50)

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Inspiration",
      "description": "My design inspiration",
      "coverImage": "/uploads/images/cover.jpg",
      "isPrivate": false,
      "imagesCount": 15,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 12,
  "totalItems": 5,
  "totalPages": 1,
  "hasMore": false
}
```

---

### GET /api/profile/images

Изображения текущего пользователя.

**Headers:** `Cookie: access_token=...`

**Query параметры:**
- `page` — номер страницы (default: 1)
- `pageSize` — размер страницы (default: 12, max: 50)

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "url": "/uploads/images/image.jpg",
      "title": "Sunset",
      "description": "Beautiful sunset",
      "tags": ["nature", "sunset"],
      "width": 1920,
      "height": 1080,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 12,
  "totalItems": 42,
  "totalPages": 4,
  "hasMore": true
}
```

---

## 💻 Реализация


### DTOs

#### update-profile.dto.ts

```typescript
import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для обновления профиля
 */
export class UpdateProfileDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Отображаемое имя (2-100 символов)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Имя должно быть минимум 2 символа' })
  @MaxLength(100, { message: 'Имя должно быть максимум 100 символов' })
  name?: string;

  @ApiProperty({
    example: 'Frontend developer from Moscow',
    description: 'Описание профиля (до 500 символов)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Bio должно быть максимум 500 символов' })
  bio?: string;
}
```

#### change-password.dto.ts

```typescript
import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для смены пароля
 */
export class ChangePasswordDto {
  @ApiProperty({
    example: 'oldPassword123',
    description: 'Текущий пароль',
  })
  @IsString()
  @MinLength(1, { message: 'Текущий пароль обязателен' })
  currentPassword: string;

  @ApiProperty({
    example: 'newPassword456',
    description: 'Новый пароль (минимум 6 символов)',
  })
  @IsString()
  @MinLength(6, { message: 'Новый пароль должен быть минимум 6 символов' })
  @MaxLength(100, { message: 'Пароль слишком длинный' })
  newPassword: string;
}
```

#### delete-account.dto.ts

```typescript
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для удаления аккаунта
 */
export class DeleteAccountDto {
  @ApiProperty({
    example: 'currentPassword123',
    description: 'Текущий пароль для подтверждения',
  })
  @IsString()
  @MinLength(1, { message: 'Пароль обязателен' })
  password: string;
}
```

#### profile-response.dto.ts

```typescript
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO ответа профиля
 */
export class ProfileResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: 'John Doe', nullable: true })
  name: string | null;

  @ApiProperty({ example: 'Frontend developer', nullable: true })
  bio: string | null;

  @ApiProperty({ example: '/uploads/avatars/uuid.jpg', nullable: true })
  avatar: string | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}
```

#### stats-response.dto.ts

```typescript
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO статистики пользователя
 */
export class StatsResponseDto {
  @ApiProperty({ example: 5, description: 'Количество досок' })
  boardsCount: number;

  @ApiProperty({ example: 42, description: 'Количество изображений' })
  imagesCount: number;

  @ApiProperty({ example: 18, description: 'Количество избранного' })
  favoritesCount: number;
}
```

#### dto/index.ts

```typescript
export * from './update-profile.dto';
export * from './change-password.dto';
export * from './delete-account.dto';
export * from './profile-response.dto';
export * from './stats-response.dto';
```

---

### users.service.ts (расширенный)

```typescript
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

  // ==================== AUTH METHODS (уже есть) ====================

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

  // ==================== PROFILE METHODS (новые) ====================

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

    // Обновляем только переданные поля
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

    // Проверяем текущий пароль
    const isPasswordValid = await this.validatePassword(user, changePasswordDto.currentPassword);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный текущий пароль');
    }

    // Хешируем и сохраняем новый пароль
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

    // Удаляем старый аватар если есть
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

    // Проверяем пароль
    const isPasswordValid = await this.validatePassword(user, password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный пароль');
    }

    // Удаляем аватар если есть
    if (user.avatar) {
      await this.deleteAvatarFile(user.avatar);
    }

    // Удаляем пользователя (каскадно удалятся доски, изображения, избранное)
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

  /**
   * Удаление файла аватара
   */
  private async deleteAvatarFile(avatarPath: string): Promise<void> {
    try {
      // avatarPath: /uploads/avatars/filename.jpg
      const fullPath = path.join(process.cwd(), avatarPath);
      await fs.unlink(fullPath);
    } catch (error) {
      // Игнорируем ошибку если файл не существует
      console.warn(`Failed to delete avatar file: ${avatarPath}`);
    }
  }
}
```


---

### users.controller.ts

```typescript
import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  UpdateProfileDto,
  ChangePasswordDto,
  DeleteAccountDto,
  ProfileResponseDto,
  StatsResponseDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

/**
 * Контроллер профиля пользователя
 * 
 * API Endpoints:
 * GET    /api/profile           — получить профиль
 * PUT    /api/profile           — обновить профиль
 * PUT    /api/profile/password  — сменить пароль
 * POST   /api/profile/avatar    — загрузить аватар
 * DELETE /api/profile/avatar    — удалить аватар
 * DELETE /api/profile           — удалить аккаунт
 * GET    /api/profile/stats     — статистика
 * GET    /api/profile/boards    — доски пользователя
 * GET    /api/profile/images    — изображения пользователя
 */
@ApiTags('Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * Получение профиля текущего пользователя
   */
  @Get()
  @ApiOperation({ summary: 'Получить профиль' })
  @ApiResponse({ status: 200, description: 'Профиль пользователя', type: ProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getProfile(@CurrentUser('userId') userId: string) {
    const user = await this.usersService.getProfile(userId);
    return this.sanitizeUser(user);
  }

  /**
   * Обновление профиля
   */
  @Put()
  @ApiOperation({ summary: 'Обновить профиль' })
  @ApiResponse({ status: 200, description: 'Профиль обновлён', type: ProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() updateDto: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateProfile(userId, updateDto);
    return this.sanitizeUser(user);
  }

  /**
   * Смена пароля
   */
  @Put('password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Сменить пароль' })
  @ApiResponse({ status: 200, description: 'Пароль изменён' })
  @ApiResponse({ status: 401, description: 'Неверный текущий пароль' })
  async changePassword(
    @CurrentUser('userId') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(userId, changePasswordDto);
    return { message: 'Пароль успешно изменён' };
  }

  /**
   * Загрузка аватара
   */
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Загрузить аватар' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Изображение (jpeg, png, webp, gif), макс. 5MB',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Аватар загружен' })
  @ApiResponse({ status: 400, description: 'Неверный формат файла' })
  async uploadAvatar(
    @CurrentUser('userId') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const avatarPath = `/uploads/avatars/${file.filename}`;
    await this.usersService.updateAvatar(userId, avatarPath);
    return {
      avatar: avatarPath,
      message: 'Аватар обновлён',
    };
  }

  /**
   * Удаление аватара
   */
  @Delete('avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить аватар' })
  @ApiResponse({ status: 200, description: 'Аватар удалён' })
  async removeAvatar(@CurrentUser('userId') userId: string) {
    await this.usersService.removeAvatar(userId);
    return { message: 'Аватар удалён' };
  }

  /**
   * Удаление аккаунта
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить аккаунт' })
  @ApiResponse({ status: 200, description: 'Аккаунт удалён' })
  @ApiResponse({ status: 401, description: 'Неверный пароль' })
  async deleteAccount(
    @CurrentUser('userId') userId: string,
    @Body() deleteAccountDto: DeleteAccountDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.usersService.deleteAccount(userId, deleteAccountDto.password);
    
    // Очищаем cookies
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    
    return { message: 'Аккаунт удалён' };
  }

  /**
   * Статистика пользователя
   */
  @Get('stats')
  @ApiOperation({ summary: 'Получить статистику' })
  @ApiResponse({ status: 200, description: 'Статистика', type: StatsResponseDto })
  async getStats(@CurrentUser('userId') userId: string) {
    return this.usersService.getStats(userId);
  }

  /**
   * Доски пользователя
   * Примечание: Полная реализация будет в BoardsController
   */
  @Get('boards')
  @ApiOperation({ summary: 'Получить доски пользователя' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Список досок' })
  async getBoards(
    @CurrentUser('userId') userId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    // TODO: Реализовать в BoardsService
    return {
      items: [],
      page: page || 1,
      pageSize: pageSize || 12,
      totalItems: 0,
      totalPages: 0,
      hasMore: false,
    };
  }

  /**
   * Изображения пользователя
   * Примечание: Полная реализация будет в ImagesController
   */
  @Get('images')
  @ApiOperation({ summary: 'Получить изображения пользователя' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Список изображений' })
  async getImages(
    @CurrentUser('userId') userId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    // TODO: Реализовать в ImagesService
    return {
      items: [],
      page: page || 1,
      pageSize: pageSize || 12,
      totalItems: 0,
      totalPages: 0,
      hasMore: false,
    };
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Удаление чувствительных данных из объекта пользователя
   */
  private sanitizeUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  }
}
```

---

### users.module.ts (обновлённый)

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

/**
 * Модуль пользователей
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MulterModule.register({
      dest: './uploads/avatars',
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```


---

## 🔧 Дополнительная настройка

### Создание папки для аватаров

```bash
mkdir -p uploads/avatars
```

### Установка uuid (если не установлен)

```bash
npm install uuid
npm install -D @types/uuid
```

### Настройка статических файлов в main.ts

```typescript
// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
// ... остальные импорты

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // ... существующая конфигурация
  
  // Статические файлы (uploads)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  // ... остальная конфигурация
}
```

---

## 🧪 Тестирование

### Через Swagger UI

Откройте http://localhost:3001/api/docs

### Через curl

```bash
# Получение профиля
curl http://localhost:3001/api/profile \
  -b cookies.txt

# Обновление профиля
curl -X PUT http://localhost:3001/api/profile \
  -H "Content-Type: application/json" \
  -d '{"name":"John Smith","bio":"Full-stack developer"}' \
  -b cookies.txt

# Смена пароля
curl -X PUT http://localhost:3001/api/profile/password \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"password123","newPassword":"newPassword456"}' \
  -b cookies.txt

# Загрузка аватара
curl -X POST http://localhost:3001/api/profile/avatar \
  -F "file=@/path/to/avatar.jpg" \
  -b cookies.txt

# Удаление аватара
curl -X DELETE http://localhost:3001/api/profile/avatar \
  -b cookies.txt

# Статистика
curl http://localhost:3001/api/profile/stats \
  -b cookies.txt

# Доски пользователя
curl "http://localhost:3001/api/profile/boards?page=1&pageSize=12" \
  -b cookies.txt

# Изображения пользователя
curl "http://localhost:3001/api/profile/images?page=1&pageSize=12" \
  -b cookies.txt

# Удаление аккаунта
curl -X DELETE http://localhost:3001/api/profile \
  -H "Content-Type: application/json" \
  -d '{"password":"password123"}' \
  -b cookies.txt
```

---

## 🔄 Схема работы профиля

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ПОЛУЧЕНИЕ ПРОФИЛЯ                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Frontend                          Backend                              │
│  ─────────                         ───────                              │
│                                                                         │
│  GET /api/profile ──────────────►  JwtAuthGuard                         │
│  Cookie: access_token              │                                    │
│                                    ▼                                    │
│                                    UsersService.getProfile()            │
│                                    │                                    │
│                                    ▼                                    │
│  ◄──────────────────────────────── { id, email, username, ... }         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         ЗАГРУЗКА АВАТАРА                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Frontend                          Backend                              │
│  ─────────                         ───────                              │
│                                                                         │
│  POST /api/profile/avatar ──────►  JwtAuthGuard                         │
│  multipart/form-data               │                                    │
│  Cookie: access_token              ▼                                    │
│                                    FileInterceptor (Multer)             │
│                                    │                                    │
│                                    ▼                                    │
│                                    Валидация (размер, тип)              │
│                                    │                                    │
│                                    ▼                                    │
│                                    Сохранение в /uploads/avatars/       │
│                                    │                                    │
│                                    ▼                                    │
│                                    UsersService.updateAvatar()          │
│                                    │                                    │
│                                    ▼                                    │
│  ◄──────────────────────────────── { avatar: "/uploads/avatars/..." }   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         УДАЛЕНИЕ АККАУНТА                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Frontend                          Backend                              │
│  ─────────                         ───────                              │
│                                                                         │
│  DELETE /api/profile ───────────►  JwtAuthGuard                         │
│  { password: "..." }               │                                    │
│  Cookie: access_token              ▼                                    │
│                                    Проверка пароля                      │
│                                    │                                    │
│                                    ▼                                    │
│                                    Удаление аватара (файл)              │
│                                    │                                    │
│                                    ▼                                    │
│                                    Удаление пользователя (каскад)       │
│                                    │                                    │
│                                    ▼                                    │
│  ◄──────────────────────────────── Clear-Cookie: access_token           │
│  { message: "Аккаунт удалён" }     Clear-Cookie: refresh_token          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Важные замечания

### Загрузка файлов

1. **Multer** — используется для обработки multipart/form-data
2. **Валидация** — проверка размера (5MB) и типа файла
3. **Уникальные имена** — UUID для предотвращения конфликтов
4. **Удаление старого** — при загрузке нового аватара старый удаляется

### Безопасность

1. **Подтверждение пароля** — для смены пароля и удаления аккаунта
2. **Каскадное удаление** — при удалении пользователя удаляются все связанные данные
3. **Очистка cookies** — при удалении аккаунта

### Статические файлы

Для доступа к загруженным файлам необходимо настроить `useStaticAssets` в `main.ts`.

---

## ✅ Чеклист

- [x] DTO созданы
- [x] UsersService расширен
- [x] UsersController создан
- [x] UsersModule обновлён
- [x] Папка uploads/avatars создана
- [x] Статические файлы настроены
- [x] Swagger документация
- [x] Тестирование через curl/Swagger

---

## 📋 Зависимости от других этапов

| Endpoint | Зависимость | Статус |
|----------|-------------|--------|
| GET /api/profile/boards | BoardsService | Этап 5 |
| GET /api/profile/images | ImagesService | Этап 6 |
| GET /api/profile/stats | Все сервисы | Частично |

> **Примечание:** Endpoints `/profile/boards` и `/profile/images` будут полностью реализованы после создания соответствующих модулей (Этапы 5 и 6). Сейчас они возвращают пустые списки.
