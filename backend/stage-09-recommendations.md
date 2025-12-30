# Этап 9: Рекомендательная система (Recommendations)

> **Статус:** В разработке
> 
> **Зависимости:** Этап 6 (Images) ✅, Этап 3 (Auth) ✅
> 
> **Сервер:** http://localhost:3001/api
> 
> **Swagger:** http://localhost:3001/api/docs

---

## 🎯 Цель этапа

Реализовать API для получения похожих изображений на основе совпадения тегов и слов из названия. Система ранжирования присваивает баллы за совпадения и возвращает топ-N наиболее релевантных изображений.

---

## 📚 Глоссарий (для frontend разработчиков)

### 🎯 Recommendations (Рекомендации)

**Recommendations** — список изображений, похожих на исходное. Похожесть определяется по совпадению тегов и слов из названия.

### 📊 Score (Оценка релевантности)

**Score** — числовой показатель похожести изображения на исходное:
- **+2 балла** за каждый совпадающий тег
- **+1 балл** за каждое совпадающее слово из названия (>2 символов)

### 🏷️ Matched Tags (Совпавшие теги)

**Matched Tags** — массив тегов, которые совпали между исходным и рекомендуемым изображением.

### 📱 Локальная vs Backend реализация

На frontend уже есть локальная реализация рекомендаций в `FullscreenModal.vue`. Backend API даёт доступ ко всей базе данных, а не только к загруженным изображениям.

---

## 📁 Структура файлов

```
backend/src/modules/images/
├── images.module.ts              # Модуль (уже существует)
├── images.controller.ts          # Контроллер (добавить endpoint)
├── images.service.ts             # Сервис (добавить метод)
└── dto/
    ├── index.ts                  # Экспорт всех DTO
    └── recommendations.dto.ts    # DTO для рекомендаций (новый)
```

> **Примечание:** Рекомендации реализуются как расширение ImagesModule, а не отдельный модуль.

---

## 📝 API Endpoints

### GET /api/images/:id/recommendations

Получение списка похожих изображений.

**Headers:** `Cookie: access_token=...` (опционально)

**Path параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| id | UUID | ID исходного изображения |

**Query параметры:**
| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| limit | number | 12 | Количество рекомендаций (max: 50) |

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "url": "/uploads/images/image.jpg",
      "title": "Similar Sunset",
      "description": "Another beautiful sunset",
      "tags": ["nature", "sunset", "sky"],
      "width": 1920,
      "height": 1080,
      "isFavorite": false,
      "favoritesCount": 15,
      "score": 5,
      "matchedTags": ["nature", "sunset"],
      "user": {
        "id": "uuid",
        "username": "johndoe",
        "avatar": "/uploads/avatars/avatar.jpg"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "sourceImage": {
    "id": "uuid",
    "title": "Original Sunset",
    "tags": ["nature", "sunset", "ocean"]
  },
  "totalMatches": 25
}
```

**Errors:**
- `404` — Изображение не найдено

---

## ⚙️ Алгоритм ранжирования

### Scoring система

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         АЛГОРИТМ SCORING                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Исходное изображение:                                                  │
│  ─────────────────────                                                  │
│  title: "Beautiful Ocean Sunset"                                        │
│  tags: ["nature", "sunset", "ocean", "sky"]                             │
│                                                                         │
│  Извлечение данных:                                                     │
│  ─────────────────                                                      │
│  sourceTags = ["nature", "sunset", "ocean", "sky"]                      │
│  titleWords = ["beautiful", "ocean", "sunset"]  (слова > 2 символов)    │
│                                                                         │
│  Кандидат A:                                                            │
│  ───────────                                                            │
│  title: "Mountain Sunset View"                                          │
│  tags: ["nature", "sunset", "mountain"]                                 │
│                                                                         │
│  Расчёт score:                                                          │
│  ─────────────                                                          │
│  Совпадающие теги: "nature" (+2), "sunset" (+2) = 4 балла               │
│  Совпадающие слова: "sunset" (+1) = 1 балл                              │
│  ИТОГО: 5 баллов                                                        │
│  matchedTags: ["nature", "sunset"]                                      │
│                                                                         │
│  Кандидат B:                                                            │
│  ───────────                                                            │
│  title: "City Night Lights"                                             │
│  tags: ["city", "night", "lights"]                                      │
│                                                                         │
│  Расчёт score:                                                          │
│  ─────────────                                                          │
│  Совпадающие теги: нет = 0 баллов                                       │
│  Совпадающие слова: нет = 0 баллов                                      │
│  ИТОГО: 0 баллов (не включается в результат)                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Правила фильтрации

1. **Исключение исходного изображения** — не показываем само себя
2. **Минимальный score** — изображения с score = 0 не включаются
3. **Сортировка** — по убыванию score, при равенстве — по дате (новые первые)
4. **Лимит** — максимум 50 результатов

---

## 💻 Реализация

### DTOs

#### dto/recommendations.dto.ts

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO для query параметров рекомендаций
 */
export class RecommendationsQueryDto {
  @ApiProperty({
    example: 12,
    description: 'Количество рекомендаций (max: 50)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 12;
}

/**
 * DTO пользователя (краткая информация)
 */
export class RecommendationUserDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: '/uploads/avatars/avatar.jpg', nullable: true })
  avatar: string | null;
}

/**
 * DTO рекомендуемого изображения
 */
export class RecommendedImageDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: '/uploads/images/image.jpg' })
  url: string;

  @ApiProperty({ example: 'Similar Sunset', nullable: true })
  title: string | null;

  @ApiProperty({ example: 'Another beautiful sunset', nullable: true })
  description: string | null;

  @ApiProperty({ example: ['nature', 'sunset'], nullable: true })
  tags: string[] | null;

  @ApiProperty({ example: 1920 })
  width: number;

  @ApiProperty({ example: 1080 })
  height: number;

  @ApiProperty({ example: false })
  isFavorite: boolean;

  @ApiProperty({ example: 15 })
  favoritesCount: number;

  @ApiProperty({ example: 5, description: 'Оценка релевантности' })
  score: number;

  @ApiProperty({ example: ['nature', 'sunset'], description: 'Совпавшие теги' })
  matchedTags: string[];

  @ApiProperty({ type: RecommendationUserDto })
  user: RecommendationUserDto;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}

/**
 * DTO исходного изображения (краткая информация)
 */
export class SourceImageDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Original Sunset', nullable: true })
  title: string | null;

  @ApiProperty({ example: ['nature', 'sunset', 'ocean'] })
  tags: string[];
}

/**
 * DTO ответа рекомендаций
 */
export class RecommendationsResponseDto {
  @ApiProperty({ type: [RecommendedImageDto] })
  items: RecommendedImageDto[];

  @ApiProperty({ type: SourceImageDto })
  sourceImage: SourceImageDto;

  @ApiProperty({ example: 25, description: 'Общее количество найденных совпадений' })
  totalMatches: number;
}
```

#### Обновить dto/index.ts

```typescript
export * from './image-query.dto';
export * from './update-image.dto';
export * from './image-response.dto';
export * from './recommendations.dto'; // Добавить
```

---

### images.service.ts (добавить метод)

```typescript
/**
 * Получение рекомендаций для изображения
 */
async getRecommendations(
  imageId: string,
  limit: number = 12,
  currentUserId?: string,
): Promise<{
  items: any[];
  sourceImage: { id: string; title: string | null; tags: string[] };
  totalMatches: number;
}> {
  // 1. Получаем исходное изображение
  const sourceImage = await this.imagesRepository.findOne({
    where: { id: imageId },
  });

  if (!sourceImage) {
    throw new NotFoundException('Изображение не найдено');
  }

  const sourceTags = sourceImage.tags || [];
  const sourceTitle = (sourceImage.title || '').toLowerCase();
  const titleWords = sourceTitle
    .split(/\s+/)
    .filter((w) => w.length > 2);

  // Если нет тегов и слов — возвращаем пустой результат
  if (sourceTags.length === 0 && titleWords.length === 0) {
    return {
      items: [],
      sourceImage: {
        id: sourceImage.id,
        title: sourceImage.title,
        tags: [],
      },
      totalMatches: 0,
    };
  }

  // 2. Строим запрос для поиска похожих
  const queryBuilder = this.imagesRepository
    .createQueryBuilder('image')
    .leftJoinAndSelect('image.user', 'user')
    .where('image.id != :imageId', { imageId });

  // Фильтр по тегам ИЛИ словам из названия
  const conditions: string[] = [];

  if (sourceTags.length > 0) {
    conditions.push('image.tags && :tags');
    queryBuilder.setParameter('tags', sourceTags);
  }

  if (titleWords.length > 0) {
    const wordConditions = titleWords.map((word, index) => {
      queryBuilder.setParameter(`word${index}`, `%${word}%`);
      return `LOWER(image.title) LIKE :word${index}`;
    });
    conditions.push(`(${wordConditions.join(' OR ')})`);
  }

  if (conditions.length > 0) {
    queryBuilder.andWhere(`(${conditions.join(' OR ')})`);
  }

  // 3. Получаем все подходящие изображения
  const candidates = await queryBuilder.getMany();

  // 4. Рассчитываем score для каждого
  const scored = candidates.map((img) => {
    const imgTags = img.tags || [];
    const imgTitle = (img.title || '').toLowerCase();

    let score = 0;
    const matchedTags: string[] = [];

    // +2 за каждый совпадающий тег
    sourceTags.forEach((tag) => {
      if (imgTags.includes(tag)) {
        score += 2;
        matchedTags.push(tag);
      }
    });

    // +1 за каждое совпадающее слово
    titleWords.forEach((word) => {
      if (imgTitle.includes(word)) {
        score += 1;
      }
    });

    return { image: img, score, matchedTags };
  });

  // 5. Фильтруем нулевые score и сортируем
  const filtered = scored.filter((item) => item.score > 0);

  const sorted = filtered
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (
        new Date(b.image.createdAt).getTime() -
        new Date(a.image.createdAt).getTime()
      );
    })
    .slice(0, limit);

  // 6. Форматируем ответ
  const items = await Promise.all(
    sorted.map(async ({ image, score, matchedTags }) => {
      const formatted = await this.formatImage(image, currentUserId);
      return {
        ...formatted,
        score,
        matchedTags,
      };
    }),
  );

  return {
    items,
    sourceImage: {
      id: sourceImage.id,
      title: sourceImage.title,
      tags: sourceImage.tags || [],
    },
    totalMatches: filtered.length,
  };
}
```

---

### images.controller.ts (добавить endpoint)

```typescript
import { RecommendationsQueryDto, RecommendationsResponseDto } from './dto';

// ... существующие endpoints ...

/**
 * Получение рекомендаций для изображения
 */
@Get(':id/recommendations')
@Public() // Доступно без авторизации
@ApiOperation({ summary: 'Получить похожие изображения' })
@ApiParam({ name: 'id', description: 'ID изображения' })
@ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество (max: 50)' })
@ApiResponse({ status: 200, description: 'Список рекомендаций', type: RecommendationsResponseDto })
@ApiResponse({ status: 404, description: 'Изображение не найдено' })
async getRecommendations(
  @Param('id', ParseUUIDPipe) id: string,
  @Query() query: RecommendationsQueryDto,
  @CurrentUser('userId') userId?: string,
) {
  return this.imagesService.getRecommendations(id, query.limit, userId);
}
```

> **Важно:** Endpoint должен быть размещён ПЕРЕД `@Get(':id')`, чтобы не конфликтовать с ним.

---

## 🔧 Порядок endpoints в контроллере

```typescript
@Controller('images')
export class ImagesController {
  // 1. Сначала статические пути
  @Get()
  async findAll() { ... }

  // 2. Затем динамические с подпутями
  @Get(':id/recommendations')  // /api/images/:id/recommendations
  async getRecommendations() { ... }

  // 3. В конце простые динамические
  @Get(':id')                   // /api/images/:id
  async findOne() { ... }

  @Put(':id')
  async update() { ... }

  @Delete(':id')
  async remove() { ... }
}
```

---

## 🧪 Тестирование

### Через Swagger UI

Откройте http://localhost:3001/api/docs

### Через curl

```bash
# ==================== ПОЛУЧЕНИЕ РЕКОМЕНДАЦИЙ ====================

# Получить рекомендации для изображения (по умолчанию 12 штук)
curl -X GET "http://localhost:3001/api/images/{image-uuid}/recommendations"

# Получить рекомендации с указанием лимита
curl -X GET "http://localhost:3001/api/images/{image-uuid}/recommendations?limit=20"

# Получить рекомендации с авторизацией (для isFavorite)
curl -X GET "http://localhost:3001/api/images/{image-uuid}/recommendations?limit=12" \
  -b cookies.txt

# ==================== ПРИМЕРЫ ОТВЕТОВ ====================

# Успешный ответ (200)
# {
#   "items": [
#     {
#       "id": "uuid-1",
#       "url": "/uploads/images/sunset.jpg",
#       "title": "Mountain Sunset",
#       "tags": ["nature", "sunset"],
#       "score": 5,
#       "matchedTags": ["nature", "sunset"],
#       "isFavorite": false,
#       "favoritesCount": 10,
#       ...
#     }
#   ],
#   "sourceImage": {
#     "id": "uuid-source",
#     "title": "Ocean Sunset",
#     "tags": ["nature", "sunset", "ocean"]
#   },
#   "totalMatches": 25
# }

# Изображение не найдено (404)
# {
#   "statusCode": 404,
#   "message": "Изображение не найдено"
# }

# Нет рекомендаций (200, пустой массив)
# {
#   "items": [],
#   "sourceImage": { "id": "uuid", "title": "Unique Image", "tags": [] },
#   "totalMatches": 0
# }
```

### Тестирование с JavaScript (Frontend)

```javascript
// Получение рекомендаций для изображения
const getRecommendations = async (imageId, limit = 12) => {
  const response = await fetch(
    `/api/images/${imageId}/recommendations?limit=${limit}`,
    { credentials: 'include' }
  );
  return response.json();
};

// Пример использования в компоненте
const loadRecommendations = async () => {
  const { items, sourceImage, totalMatches } = await getRecommendations(currentImageId);
  
  console.log(`Найдено ${totalMatches} похожих изображений`);
  console.log(`Исходное изображение: ${sourceImage.title}`);
  console.log(`Теги: ${sourceImage.tags.join(', ')}`);
  
  // Отображаем рекомендации
  recommendations.value = items;
};

// Гибридный подход: локальные + API рекомендации
const loadRecommendationsHybrid = async (image, allImages) => {
  // 1. Сначала показываем локальные (мгновенно)
  recommendations.value = getLocalRecommendations(image, allImages);
  
  // 2. Затем загружаем из API (асинхронно)
  try {
    const { items } = await getRecommendations(image.id);
    if (items.length > 0) {
      recommendations.value = items;
    }
  } catch (error) {
    // Fallback: оставляем локальные рекомендации
    console.warn('API recommendations failed, using local fallback');
  }
};

// Локальная функция для fallback
const getLocalRecommendations = (image, allImages) => {
  const currentTags = image.tags || [];
  const titleWords = (image.title || '').toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  return allImages
    .filter(img => img.id !== image.id)
    .map(img => {
      let score = 0;
      const matchedTags = [];
      
      currentTags.forEach(tag => {
        if (img.tags?.includes(tag)) {
          score += 2;
          matchedTags.push(tag);
        }
      });
      
      titleWords.forEach(word => {
        if (img.title?.toLowerCase().includes(word)) score += 1;
      });
      
      return { ...img, score, matchedTags };
    })
    .filter(img => img.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
};
```

---

## 🔄 Схема работы рекомендаций

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ПОЛУЧЕНИЕ РЕКОМЕНДАЦИЙ                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Frontend                          Backend                              │
│  ─────────                         ───────                              │
│                                                                         │
│  GET /api/images/:id/recommendations ──► ImagesController               │
│  ?limit=12                              │                               │
│  Cookie: access_token (опционально)     ▼                               │
│                                         ImagesService.getRecommendations│
│                                         │                               │
│                                         ▼                               │
│                                         1. Получить исходное изображение│
│                                         │                               │
│                                         ├── Не найдено ──► 404 Not Found│
│                                         │                               │
│                                         ▼ Найдено                       │
│                                         2. Извлечь теги и слова         │
│                                         │                               │
│                                         ├── Нет тегов и слов ──► []     │
│                                         │                               │
│                                         ▼                               │
│                                         3. Найти кандидатов             │
│                                         (tags && :tags OR title LIKE)   │
│                                         │                               │
│                                         ▼                               │
│                                         4. Рассчитать score             │
│                                         +2 за тег, +1 за слово          │
│                                         │                               │
│                                         ▼                               │
│                                         5. Отфильтровать score = 0      │
│                                         │                               │
│                                         ▼                               │
│                                         6. Сортировать по score DESC    │
│                                         │                               │
│                                         ▼                               │
│                                         7. Ограничить по limit          │
│                                         │                               │
│                                         ▼                               │
│                                         8. Форматировать ответ          │
│                                         (добавить isFavorite, user)     │
│                                         │                               │
│                                         ▼                               │
│  ◄────────────────────────────────────  { items, sourceImage, total }   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    АЛГОРИТМ SCORING (детально)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Исходное изображение:                                                  │
│  ─────────────────────                                                  │
│  id: "source-uuid"                                                      │
│  title: "Beautiful Ocean Sunset Photography"                            │
│  tags: ["nature", "sunset", "ocean", "photography"]                     │
│                                                                         │
│  Извлечение:                                                            │
│  ───────────                                                            │
│  sourceTags = ["nature", "sunset", "ocean", "photography"]              │
│  titleWords = ["beautiful", "ocean", "sunset", "photography"]           │
│               (слова > 2 символов)                                      │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Кандидат A                                                      │    │
│  │ title: "Mountain Sunset View"                                   │    │
│  │ tags: ["nature", "sunset", "mountain"]                          │    │
│  │                                                                 │    │
│  │ Совпадающие теги:                                               │    │
│  │   "nature" ✓ (+2)                                               │    │
│  │   "sunset" ✓ (+2)                                               │    │
│  │   "ocean" ✗                                                     │    │
│  │   "photography" ✗                                               │    │
│  │                                                                 │    │
│  │ Совпадающие слова в title:                                      │    │
│  │   "beautiful" ✗                                                 │    │
│  │   "ocean" ✗                                                     │    │
│  │   "sunset" ✓ (+1)                                               │    │
│  │   "photography" ✗                                               │    │
│  │                                                                 │    │
│  │ ИТОГО: 4 + 1 = 5 баллов                                         │    │
│  │ matchedTags: ["nature", "sunset"]                               │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Кандидат B                                                      │    │
│  │ title: "Ocean Waves"                                            │    │
│  │ tags: ["ocean", "water", "waves"]                               │    │
│  │                                                                 │    │
│  │ Совпадающие теги:                                               │    │
│  │   "nature" ✗                                                    │    │
│  │   "sunset" ✗                                                    │    │
│  │   "ocean" ✓ (+2)                                                │    │
│  │   "photography" ✗                                               │    │
│  │                                                                 │    │
│  │ Совпадающие слова в title:                                      │    │
│  │   "beautiful" ✗                                                 │    │
│  │   "ocean" ✓ (+1)                                                │    │
│  │   "sunset" ✗                                                    │    │
│  │   "photography" ✗                                               │    │
│  │                                                                 │    │
│  │ ИТОГО: 2 + 1 = 3 балла                                          │    │
│  │ matchedTags: ["ocean"]                                          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Кандидат C                                                      │    │
│  │ title: "City Night Lights"                                      │    │
│  │ tags: ["city", "night", "lights"]                               │    │
│  │                                                                 │    │
│  │ Совпадающие теги: нет                                           │    │
│  │ Совпадающие слова: нет                                          │    │
│  │                                                                 │    │
│  │ ИТОГО: 0 баллов (НЕ ВКЛЮЧАЕТСЯ В РЕЗУЛЬТАТ)                     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  Результат сортировки:                                                  │
│  ─────────────────────                                                  │
│  1. Кандидат A (score: 5)                                               │
│  2. Кандидат B (score: 3)                                               │
│  (Кандидат C исключён — score: 0)                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Интеграция с Frontend

### Миграция с локальной реализации

На frontend уже есть локальная реализация рекомендаций в `FullscreenModal.vue`. После реализации backend API рекомендуется:

1. **Заменить локальную логику на API вызов** — для доступа ко всей БД
2. **Оставить локальную версию как fallback** — для offline-режима

### Composable для работы с рекомендациями

```typescript
// frontend/composables/useRecommendations.ts
export const useRecommendations = () => {
  const recommendations = ref<Image[]>([])
  const isLoading = ref(false)
  const sourceImage = ref<{ id: string; title: string; tags: string[] } | null>(null)
  const totalMatches = ref(0)

  /**
   * Загрузка рекомендаций из API
   */
  const loadRecommendations = async (imageId: string, limit = 12) => {
    isLoading.value = true
    try {
      const { data } = await useFetch(`/api/images/${imageId}/recommendations`, {
        query: { limit }
      })
      
      if (data.value) {
        recommendations.value = data.value.items || []
        sourceImage.value = data.value.sourceImage
        totalMatches.value = data.value.totalMatches
      }
      
      return data.value
    } catch (error) {
      console.error('Failed to load recommendations:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Локальные рекомендации (fallback)
   */
  const getLocalRecommendations = (image: Image, allImages: Image[], limit = 12) => {
    const currentTags = image.tags || []
    const titleWords = (image.title || '')
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 2)

    const scored = allImages
      .filter(img => img.id !== image.id)
      .map(img => {
        let score = 0
        const matchedTags: string[] = []

        currentTags.forEach(tag => {
          if (img.tags?.includes(tag)) {
            score += 2
            matchedTags.push(tag)
          }
        })

        titleWords.forEach(word => {
          if (img.title?.toLowerCase().includes(word)) {
            score += 1
          }
        })

        return { ...img, score, matchedTags }
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return scored
  }

  /**
   * Гибридный подход: сначала локальные, потом API
   */
  const loadRecommendationsHybrid = async (
    image: Image,
    allImages: Image[],
    limit = 12
  ) => {
    // 1. Мгновенно показываем локальные
    recommendations.value = getLocalRecommendations(image, allImages, limit)

    // 2. Асинхронно загружаем из API
    const apiResult = await loadRecommendations(image.id, limit)
    
    if (apiResult?.items?.length) {
      recommendations.value = apiResult.items
    }
  }

  return {
    recommendations,
    isLoading,
    sourceImage,
    totalMatches,
    loadRecommendations,
    getLocalRecommendations,
    loadRecommendationsHybrid,
  }
}
```

### Обновление FullscreenModal.vue

```vue
<!-- frontend/components/image/FullscreenModal.vue -->
<script setup lang="ts">
const { recommendations, isLoading, loadRecommendations } = useRecommendations()

// Заменяем локальную логику на API вызов
watch(() => props.image, async (newImage) => {
  if (newImage) {
    await loadRecommendations(newImage.id, 12)
  }
}, { immediate: true })
</script>

<template>
  <!-- Секция рекомендаций -->
  <div class="recommendations-section">
    <h3>Похожие изображения</h3>
    
    <div v-if="isLoading" class="loading">
      Загрузка рекомендаций...
    </div>
    
    <div v-else-if="recommendations.length" class="recommendations-grid">
      <ImageCard
        v-for="rec in recommendations"
        :key="rec.id"
        :image="rec"
        @click="selectImage(rec)"
      />
    </div>
    
    <div v-else class="no-recommendations">
      Похожих изображений не найдено
    </div>
  </div>
</template>
```

---

## ⚠️ Важные замечания

### Порядок endpoints в контроллере

```typescript
// ВАЖНО: /:id/recommendations должен быть ДО /:id
@Get(':id/recommendations')  // GET /api/images/:id/recommendations
async getRecommendations() { ... }

@Get(':id')                   // GET /api/images/:id
async findOne() { ... }
```

Если поменять порядок, "recommendations" будет интерпретирован как UUID и вызовет ошибку.

### Оптимизация производительности

1. **Индексы** — убедитесь, что есть GIN индекс на поле `tags`:
   ```sql
   CREATE INDEX idx_images_tags ON images USING GIN(tags);
   ```

2. **Кэширование** — для популярных изображений можно кэшировать рекомендации

3. **Лимит** — максимум 50 результатов для предотвращения перегрузки

### Публичный доступ

Endpoint доступен без авторизации (`@Public()`), но если пользователь авторизован, в ответе будет корректное значение `isFavorite`.

### Пустые результаты

Если у исходного изображения нет тегов и слов в названии (>2 символов), возвращается пустой массив без ошибки.

---

## ✅ Чеклист

- [ ] DTO создан (`recommendations.dto.ts`)
- [ ] Метод `getRecommendations` добавлен в ImagesService
- [ ] Endpoint добавлен в ImagesController
- [ ] Экспорт DTO обновлён в `dto/index.ts`
- [ ] Порядок endpoints корректный
- [ ] Swagger документация
- [ ] Тестирование через curl/Swagger
- [ ] Frontend интеграция (опционально)

---

## 📋 Зависимости от других этапов

| Функционал | Зависимость | Статус |
|------------|-------------|--------|
| Изображения | ImagesModule | ✅ Этап 6 |
| Авторизация (опционально) | AuthModule | ✅ Этап 3 |
| Избранное (для isFavorite) | FavoritesModule | ✅ Этап 8 |

---

## 🔗 Связанные endpoints

После реализации этого этапа будут работать:

| Endpoint | Описание |
|----------|----------|
| GET /api/images/:id/recommendations | Получить похожие изображения |

---

## 🎯 Преимущества Backend API над локальной реализацией

| Аспект | Локальная версия | Backend API |
|--------|------------------|-------------|
| Доступ к данным | Только загруженные изображения | Вся база данных |
| Точность | Ограничена клиентскими данными | Полный scoring |
| Производительность | Зависит от клиента | Оптимизирован на сервере |
| Кэширование | Нет | Возможно на сервере |
| Персонализация | Нет | Возможна (учёт избранного) |
| Offline | Работает | Не работает |

**Рекомендация:** Использовать гибридный подход — сначала показывать локальные рекомендации для мгновенного отклика, затем обновлять из A
