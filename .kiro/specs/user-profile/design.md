# Design Document: User Profile

## Overview

Страница профиля пользователя в SnapBoard предоставляет полный функционал для управления аккаунтом: просмотр и редактирование данных, управление аватаром, просмотр контента пользователя (доски и изображения), смена пароля и удаление аккаунта. Дизайн следует принципам, установленным в этапе 10.4 - использование Base* компонентов из `common/`.

## Architecture

```
pages/
└── profile.vue                    # Главная страница профиля

components/
└── profile/
    ├── Header.vue                 # Шапка профиля (аватар, имя, статистика)
    ├── Avatar.vue                 # Компонент аватара с загрузкой
    ├── EditForm.vue               # Форма редактирования профиля
    ├── Stats.vue                  # Статистика пользователя
    ├── ContentTabs.vue            # Вкладки контента (доски/изображения)
    ├── PasswordModal.vue          # Модал смены пароля
    └── DeleteAccountModal.vue     # Модал удаления аккаунта

composables/
└── useProfile.ts                  # Логика работы с профилем

store/
└── auth.ts                        # Расширение для updateProfile

types/
└── user.ts                        # Расширение типов User
```

## Components and Interfaces

### ProfileHeader Component

```typescript
// components/profile/Header.vue
interface Props {
  user: User
  stats: UserStats
  isEditing: boolean
}

interface Emits {
  'edit': []
  'avatar-change': [file: File]
}

interface UserStats {
  boardsCount: number
  imagesCount: number
  joinedAt: string
}
```

### ProfileAvatar Component

```typescript
// components/profile/Avatar.vue
interface Props {
  src?: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  editable?: boolean
}

interface Emits {
  'change': [file: File]
  'error': [message: string]
}

// Валидация файла
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
```

### ProfileEditForm Component

```typescript
// components/profile/EditForm.vue
interface Props {
  user: User
  isSubmitting: boolean
}

interface Emits {
  'submit': [data: UpdateProfileDto]
  'cancel': []
}

interface UpdateProfileDto {
  name: string
  bio?: string
}

// Валидация
const nameRules = {
  required: true,
  minLength: 2,
  maxLength: 50
}
```

### ProfileContentTabs Component

```typescript
// components/profile/ContentTabs.vue
interface Props {
  activeTab: 'boards' | 'images'
  boards: Board[]
  images: Image[]
  isLoading: boolean
}

interface Emits {
  'tab-change': [tab: 'boards' | 'images']
  'board-click': [board: Board]
  'image-click': [image: Image]
}
```

### PasswordModal Component

```typescript
// components/profile/PasswordModal.vue
interface Props {
  isOpen: boolean
  isSubmitting: boolean
}

interface Emits {
  'close': []
  'submit': [data: ChangePasswordDto]
}

interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Валидация
const passwordRules = {
  minLength: 8,
  requireUppercase: false,
  requireNumber: false
}
```

### DeleteAccountModal Component

```typescript
// components/profile/DeleteAccountModal.vue
interface Props {
  isOpen: boolean
  isDeleting: boolean
}

interface Emits {
  'close': []
  'confirm': [password: string]
}
```

### useProfile Composable

```typescript
// composables/useProfile.ts
interface UseProfileReturn {
  // State
  isEditing: Ref<boolean>
  isSubmitting: Ref<boolean>
  stats: Ref<UserStats>
  userBoards: Ref<Board[]>
  userImages: Ref<Image[]>
  
  // Actions
  startEditing: () => void
  cancelEditing: () => void
  updateProfile: (data: UpdateProfileDto) => Promise<boolean>
  uploadAvatar: (file: File) => Promise<boolean>
  changePassword: (data: ChangePasswordDto) => Promise<boolean>
  deleteAccount: (password: string) => Promise<boolean>
  loadUserContent: () => Promise<void>
}
```

## Data Models

### Extended User Type

```typescript
// types/user.ts
export interface User {
  id: string
  email: string
  username: string
  name?: string
  bio?: string
  avatar?: string
  createdAt: string
  updatedAt?: string
}

export interface UserStats {
  boardsCount: number
  imagesCount: number
  favoritesCount: number
  joinedAt: string
}

export interface UpdateProfileDto {
  name?: string
  bio?: string
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}

export interface UploadAvatarResponse {
  avatarUrl: string
}
```

### API Endpoints

```typescript
// server/api/profile/
PUT  /api/profile          - updateProfile(UpdateProfileDto)
POST /api/profile/avatar   - uploadAvatar(FormData)
PUT  /api/profile/password - changePassword(ChangePasswordDto)
DELETE /api/profile        - deleteAccount(password)
GET  /api/profile/stats    - getUserStats()
GET  /api/profile/boards   - getUserBoards()
GET  /api/profile/images   - getUserImages()
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

