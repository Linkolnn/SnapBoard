# Этап 5: Masonry Grid для изображений SnapBoard

## 🎯 Цель этапа
Создать красивую Masonry Grid (как в Pinterest) для отображения изображений разных размеров. Компонент будет адаптивным, с lazy loading и skeleton loader'ами для плавной загрузки контента.

---

## 📋 Чеклист этапа
- [ ] Компонент Masonry Grid
- [ ] Lazy loading изображений
- [ ] Skeleton loader для изображений
- [ ] Компонент карточки изображения
- [ ] Адаптивность под разные экраны
- [ ] Composable для работы с изображениями

---

## 🎨 Что такое Masonry Grid?

**Masonry Grid** - это layout где элементы располагаются как кирпичная кладка:
- Изображения разной высоты
- Компактное заполнение пространства
- Нет больших пустых промежутков
- Адаптивное количество колонок

```
┌─────┐ ┌─────┐ ┌─────┐
│     │ │     │ │     │
│  1  │ └─────┘ │  3  │
│     │ ┌─────┐ │     │
└─────┘ │     │ └─────┘
┌─────┐ │  2  │ ┌─────┐
│  4  │ │     │ │  5  │
└─────┘ └─────┘ └─────┘
```

---

## 1️⃣ Composable для расчёта Masonry Layout

### Файл: `composables/useMasonryLayout.ts`

```typescript
import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Интерфейс для элемента в Masonry Grid
 */
interface MasonryItem {
  id: string
  height: number  // высота элемента в пикселях
  column: number  // в какую колонку поместить элемент
  top: number     // позиция сверху в пикселях
}

/**
 * Composable для расчёта Masonry Layout
 * Автоматически распределяет элементы по колонкам
 * 
 * @param columnWidth - ширина одной колонки в пикселях
 * @param gap - отступ между элементами в пикселях
 * @returns объект с методами и данными для layout
 */
export const useMasonryLayout = (columnWidth = 280, gap = 16) => {
  /**
   * Массив элементов с рассчитанными позициями
   */
  const items = ref<MasonryItem[]>([])
  
  /**
   * Количество колонок на текущем экране
   */
  const columnCount = ref(0)
  
  /**
   * Высота каждой колонки (для равномерного распределения)
   */
  const columnHeights = ref<number[]>([])
  
  /**
   * Общая высота контейнера Masonry Grid
   */
  const containerHeight = ref(0)
  
  /**
   * Расчёт количества колонок в зависимости от ширины экрана
   */
  const calculateColumnCount = (): number => {
    if (!process.client) return 4
    
    const containerWidth = window.innerWidth
    
    // Вычитаем padding контейнера (24px * 2)
    const availableWidth = containerWidth - 48
    
    // Рассчитываем сколько колонок влезет
    const cols = Math.floor((availableWidth + gap) / (columnWidth + gap))
    
    // Минимум 1 колонка, максимум 6
    return Math.max(1, Math.min(cols, 6))
  }
  
  /**
   * Найти колонку с минимальной высотой
   * Это нужно чтобы элементы распределялись равномерно
   */
  const getShortestColumn = (): number => {
    let shortestColumn = 0
    let minHeight = columnHeights.value[0] || 0
    
    for (let i = 1; i < columnHeights.value.length; i++) {
      if (columnHeights.value[i] < minHeight) {
        minHeight = columnHeights.value[i]
        shortestColumn = i
      }
    }
    
    return shortestColumn
  }
  
  /**
   * Расчёт позиций всех элементов
   * @param itemHeights - массив высот элементов
   */
  const calculateLayout = (itemHeights: number[]) => {
    // Инициализируем колонки
    columnCount.value = calculateColumnCount()
    columnHeights.value = new Array(columnCount.value).fill(0)
    
    // Массив для рассчитанных элементов
    const calculatedItems: MasonryItem[] = []
    
    // Проходим по каждому элементу
    itemHeights.forEach((height, index) => {
      // Находим самую короткую колонку
      const column = getShortestColumn()
      
      // Вычисляем позицию элемента
      const item: MasonryItem = {
        id: `item-${index}`,
        height: height,
        column: column,
        top: columnHeights.value[column]
      }
      
      calculatedItems.push(item)
      
      // Увеличиваем высоту колонки (высота элемента + gap)
      columnHeights.value[column] += height + gap
    })
    
    // Обновляем items
    items.value = calculatedItems
    
    // Общая высота = высота самой длинной колонки
    containerHeight.value = Math.max(...columnHeights.value)
  }
  
  /**
   * Пересчёт layout при изменении размера окна
   */
  const handleResize = () => {
    // Получаем текущие высоты элементов
    const heights = items.value.map(item => item.height)
    if (heights.length > 0) {
      calculateLayout(heights)
    }
  }
  
  /**
   * Инициализация при монтировании компонента
   */
  onMounted(() => {
    if (process.client) {
      window.addEventListener('resize', handleResize)
    }
  })
  
  /**
   * Очистка при размонтировании
   */
  onUnmounted(() => {
    if (process.client) {
      window.removeEventListener('resize', handleResize)
    }
  })
  
  return {
    items,
    columnCount,
    columnWidth,
    gap,
    containerHeight,
    calculateLayout,
    handleResize
  }
}
```

---

## 2️⃣ Компонент Skeleton Loader

### Файл: `components/image/ImageSkeleton.vue`

```vue
<template>
  <!-- 
    Skeleton loader для изображения
    Показывается пока изображение загружается
    Анимация пульсации создаёт эффект загрузки
  -->
  <article class="image-skeleton" :style="{ height: height + 'px' }">
    <div class="image-skeleton__shimmer"></div>
  </article>
</template>

<script setup lang="ts">
/**
 * Пропсы компонента
 */
interface Props {
  height?: number  // высота skeleton в пикселях
}

withDefaults(defineProps<Props>(), {
  height: 300
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.image-skeleton
  position: relative
  width: 100%
  background: $gray-200
  border-radius: $radius
  overflow: hidden
  
  // Shimmer эффект - движущийся градиент
  &__shimmer
    position: absolute
    top: 0
    left: -100%
    width: 100%
    height: 100%
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)
    // Анимация движения градиента слева направо
    animation: shimmer 1.5s infinite
    
// Анимация пульсации
@keyframes shimmer
  0%
    left: -100%
  100%
    left: 100%
</style>
```

---

## 3️⃣ Компонент карточки изображения

### Файл: `components/image/ImageCard.vue`

```vue
<template>
  <!-- 
    Карточка изображения для Masonry Grid
    - Lazy loading (загружается только когда в зоне видимости)
    - Skeleton loader пока загружается
    - Hover эффекты
    - Клик для открытия детального просмотра
  -->
  <article 
    ref="cardRef"
    class="image-card"
    :class="{ 'image-card--loaded': isLoaded }"
    @click="handleClick"
  >
    <!-- Skeleton loader пока изображение загружается -->
    <ImageImageSkeleton 
      v-if="!isLoaded"
      :height="estimatedHeight"
    />
    
    <!-- Само изображение -->
    <img
      v-show="isLoaded"
      :src="image.url"
      :alt="image.title || 'Image'"
      class="image-card__img"
      loading="lazy"
      @load="handleImageLoad"
      @error="handleImageError"
    />
    
    <!-- Overlay с информацией (показывается при hover) -->
    <div v-if="isLoaded" class="image-card__overlay">
      <div class="image-card__info">
        <h3 v-if="image.title" class="image-card__title">
          {{ image.title }}
        </h3>
        <p v-if="image.description" class="image-card__desc">
          {{ image.description }}
        </p>
        
        <!-- Теги -->
        <div v-if="image.tags && image.tags.length > 0" class="image-card__tags">
          <span 
            v-for="tag in image.tags.slice(0, 3)" 
            :key="tag"
            class="image-card__tag"
          >
            #{{ tag }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Image } from '~/types'

/**
 * Пропсы компонента
 */
interface Props {
  image: Image           // данные изображения
  estimatedHeight?: number  // примерная высота для skeleton
}

const props = withDefaults(defineProps<Props>(), {
  estimatedHeight: 300
})

/**
 * Эмиты компонента
 */
const emit = defineEmits<{
  click: [image: Image]      // клик по карточке
  load: [height: number]     // изображение загрузилось
}>()

/**
 * Ссылка на DOM элемент карточки
 */
const cardRef = ref<HTMLElement | null>(null)

/**
 * Состояние загрузки изображения
 */
const isLoaded = ref(false)

/**
 * Высота загруженного изображения
 */
const imageHeight = ref(0)

/**
 * Обработчик загрузки изображения
 * Вычисляем высоту и сообщаем родителю
 */
const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  
  // Получаем реальную высоту изображения
  imageHeight.value = img.naturalHeight
  isLoaded.value = true
  
  // Сообщаем родителю высоту для Masonry layout
  emit('load', img.offsetHeight)
}

/**
 * Обработчик ошибки загрузки изображения
 */
const handleImageError = (event: Event) => {
  console.error('Failed to load image:', props.image.url)
  // Можно показать placeholder вместо изображения
  isLoaded.value = true
}

/**
 * Обработчик клика по карточке
 */
const handleClick = () => {
  if (isLoaded.value) {
    emit('click', props.image)
  }
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.image-card
  position: relative
  width: 100%
  border-radius: $radius
  overflow: hidden
  cursor: pointer
  background: $gray-200
  // Плавный переход для всех изменений
  transition: all $transition-normal
  
  // При наведении поднимаем карточку
  &:hover
    transform: translateY(-4px)
    box-shadow: $shadow-lg
    
    // Показываем overlay при hover
    .image-card__overlay
      opacity: 1
  
  // Изображение
  &__img
    width: 100%
    height: auto
    display: block
    // Плавное появление изображения
    animation: fadeIn 0.3s ease-in
  
  // Overlay с информацией
  &__overlay
    position: absolute
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.7) 100%)
    display: flex
    align-items: flex-end
    padding: 16px
    // Скрыт по умолчанию
    opacity: 0
    transition: opacity $transition-normal
  
  &__info
    width: 100%
    color: white
  
  &__title
    font-size: 16px
    font-weight: 600
    margin-bottom: 4px
    // Ограничиваем 2 строками
    display: -webkit-box
    -webkit-line-clamp: 2
    -webkit-box-orient: vertical
    overflow: hidden
  
  &__desc
    font-size: 14px
    margin-bottom: 8px
    opacity: 0.9
    // Ограничиваем 2 строками
    display: -webkit-box
    -webkit-line-clamp: 2
    -webkit-box-orient: vertical
    overflow: hidden
  
  &__tags
    display: flex
    gap: 8px
    flex-wrap: wrap
  
  &__tag
    font-size: 12px
    padding: 4px 8px
    background: rgba(255, 255, 255, 0.2)
    border-radius: $radius-sm
    backdrop-filter: blur(4px)

// Анимация появления изображения
@keyframes fadeIn
  from
    opacity: 0
  to
    opacity: 1
</style>
```

---

## 4️⃣ Компонент Masonry Grid

### Файл: `components/image/MasonryGrid.vue`

```vue
<template>
  <!-- 
    Masonry Grid для отображения изображений
    - Автоматический расчёт колонок в зависимости от ширины экрана
    - Lazy loading изображений
    - Skeleton loaders
    - Адаптивный layout
  -->
  <section class="masonry-grid">
    <!-- Контейнер с рассчитанной высотой -->
    <div 
      class="masonry-grid__container"
      :style="{ height: containerHeight + 'px' }"
    >
      <!-- Отображаем skeleton пока изображения загружаются -->
      <template v-if="isLoading">
        <div
          v-for="i in skeletonCount"
          :key="`skeleton-${i}`"
          class="masonry-grid__item"
          :style="getSkeletonStyle(i - 1)"
        >
          <ImageImageSkeleton :height="getRandomHeight()" />
        </div>
      </template>
      
      <!-- Отображаем реальные изображения -->
      <template v-else>
        <div
          v-for="(item, index) in layoutItems"
          :key="images[index]?.id || `item-${index}`"
          class="masonry-grid__item"
          :style="getItemStyle(item)"
        >
          <ImageImageCard
            :image="images[index]"
            :estimated-height="item.height"
            @load="(height) => handleImageLoad(index, height)"
            @click="handleImageClick"
          />
        </div>
      </template>
    </div>
    
    <!-- Сообщение если нет изображений -->
    <div v-if="!isLoading && images.length === 0" class="masonry-grid__empty">
      <p>Изображений пока нет</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useMasonryLayout } from '~/composables/useMasonryLayout'
import type { Image } from '~/types'

/**
 * Пропсы компонента
 */
interface Props {
  images: Image[]        // массив изображений для отображения
  isLoading?: boolean    // состояние загрузки
  columnWidth?: number   // ширина колонки в пикселях
  gap?: number          // отступ между элементами
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  columnWidth: 280,
  gap: 16
})

/**
 * Эмиты компонента
 */
const emit = defineEmits<{
  imageClick: [image: Image]  // клик по изображению
}>()

/**
 * Используем composable для расчёта layout
 */
const {
  items: layoutItems,
  columnCount,
  columnWidth,
  gap,
  containerHeight,
  calculateLayout
} = useMasonryLayout(props.columnWidth, props.gap)

/**
 * Количество skeleton элементов для показа
 */
const skeletonCount = ref(12)

/**
 * Массив высот загруженных изображений
 */
const imageHeights = ref<number[]>([])

/**
 * Получить случайную высоту для skeleton
 * Создаёт визуальное разнообразие пока изображения грузятся
 */
const getRandomHeight = (): number => {
  // Случайная высота от 200 до 400 пикселей
  return Math.floor(Math.random() * (400 - 200 + 1)) + 200
}

/**
 * Получить стили для skeleton элемента
 * Временные позиции пока не рассчитан настоящий layout
 */
const getSkeletonStyle = (index: number) => {
  const column = index % columnCount.value
  const row = Math.floor(index / columnCount.value)
  
  return {
    position: 'absolute',
    left: `${column * (columnWidth + gap)}px`,
    top: `${row * 320}px`,  // примерная высота
    width: `${columnWidth}px`
  }
}

/**
 * Получить стили для элемента Masonry Grid
 */
const getItemStyle = (item: any) => {
  return {
    position: 'absolute',
    left: `${item.column * (columnWidth + gap)}px`,
    top: `${item.top}px`,
    width: `${columnWidth}px`
  }
}

/**
 * Обработчик загрузки изображения
 * Сохраняем высоту и пересчитываем layout
 */
const handleImageLoad = (index: number, height: number) => {
  imageHeights.value[index] = height
  
  // Пересчитываем layout с новыми высотами
  if (imageHeights.value.filter(h => h > 0).length === props.images.length) {
    calculateLayout(imageHeights.value)
  }
}

/**
 * Обработчик клика по изображению
 */
const handleImageClick = (image: Image) => {
  emit('imageClick', image)
}

/**
 * Инициализация layout при изменении массива изображений
 */
watch(() => props.images, (newImages) => {
  if (newImages.length > 0) {
    // Инициализируем массив высот примерными значениями
    imageHeights.value = new Array(newImages.length).fill(300)
    
    // Рассчитываем начальный layout
    calculateLayout(imageHeights.value)
  }
}, { immediate: true })

/**
 * Инициализация при монтировании
 */
onMounted(() => {
  if (props.images.length > 0) {
    imageHeights.value = new Array(props.images.length).fill(300)
    calculateLayout(imageHeights.value)
  }
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.masonry-grid
  width: 100%
  
  // Контейнер с относительным позиционированием
  &__container
    position: relative
    width: 100%
    transition: height 0.3s ease
  
  // Элемент сетки (абсолютное позиционирование)
  &__item
    position: absolute
    transition: all 0.3s ease
  
  // Пустое состояние
  &__empty
    padding: 64px 24px
    text-align: center
    
    p
      font-size: 18px
      color: $gray-400
</style>
```

---

## 5️⃣ Пример использования Masonry Grid

### Файл: `pages/index.vue`

```vue
<template>
  <div class="home-page">
    <section class="home-page__hero">
      <h1>Добро пожаловать в SnapBoard</h1>
      <p>Ваша визуальная доска вдохновения</p>
    </section>
    
    <section class="home-page__gallery">
      <h2>Популярные изображения</h2>
      
      <!-- Masonry Grid с изображениями -->
      <ImageMasonryGrid
        :images="mockImages"
        :is-loading="isLoading"
        @image-click="handleImageClick"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Image } from '~/types'

/**
 * Состояние загрузки
 */
const isLoading = ref(true)

/**
 * Mock данные изображений для демонстрации
 * В реальном приложении будут загружаться с API
 */
const mockImages = ref<Image[]>([
  {
    id: '1',
    url: 'https://picsum.photos/400/600',
    title: 'Красивый пейзаж',
    description: 'Удивительный вид на горы',
    boardId: '1',
    userId: '1',
    tags: ['природа', 'горы', 'пейзаж'],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    url: 'https://picsum.photos/400/300',
    title: 'Архитектура',
    description: 'Современное здание',
    boardId: '1',
    userId: '1',
    tags: ['архитектура', 'дизайн'],
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    url: 'https://picsum.photos/400/500',
    title: 'Интерьер',
    boardId: '1',
    userId: '1',
    tags: ['интерьер', 'дизайн', 'уют'],
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    url: 'https://picsum.photos/400/400',
    title: 'Еда',
    description: 'Вкусная еда',
    boardId: '1',
    userId: '1',
    tags: ['еда', 'рецепты'],
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    url: 'https://picsum.photos/400/550',
    title: 'Мода',
    boardId: '1',
    userId: '1',
    tags: ['мода', 'стиль'],
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    url: 'https://picsum.photos/400/350',
    title: 'Искусство',
    boardId: '1',
    userId: '1',
    tags: ['искусство'],
    createdAt: new Date().toISOString()
  }
])

/**
 * Обработчик клика по изображению
 * Здесь можно открыть модальное окно с деталями
 */
const handleImageClick = (image: Image) => {
  console.log('Image clicked:', image)
  // В следующем этапе откроем модальное окно
}

/**
 * Имитация загрузки данных
 */
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.home-page
  padding: 32px 0
  
  &__hero
    text-align: center
    margin-bottom: 48px
    
    h1
      font-size: 42px
      font-weight: 700
      color: $text-light
      margin-bottom: 16px
    
    p
      font-size: 18px
      color: $gray-500
  
  &__gallery
    h2
      font-size: 28px
      font-weight: 700
      color: $text-light
      margin-bottom: 32px
</style>
```

---

## ✅ Результат этапа

После завершения этапа у вас будут:

1. ✅ Composable `useMasonryLayout` для расчёта позиций
2. ✅ Компонент `ImageSkeleton` для загрузки
3. ✅ Компонент `ImageCard` с hover эффектами
4. ✅ Компонент `MasonryGrid` - основной контейнер
5. ✅ Lazy loading изображений
6. ✅ Адаптивность под все экраны
7. ✅ Плавные анимации и transitions

---

## 🎯 Следующий этап

**Этап 6: Детальный просмотр изображений (Modal)**

В следующем этапе создадим:
- Модальное окно для просмотра изображения
- Добавление/редактирование описания
- Система тегов
- Действия: редактировать, удалить, скачать

---

## 💡 Как работает Masonry Grid

### 1. Расчёт колонок:
```typescript
// Экран 1440px → 4-5 колонок
// Экран 768px → 2-3 колонки
// Экран 375px → 1 колонка
```

### 2. Распределение элементов:
```typescript
// Элемент всегда добавляется в самую короткую колонку
// Это обеспечивает равномерное заполнение
```

### 3. Lazy Loading:
```html
<img loading="lazy" />
<!-- Браузер загружает только видимые изображения -->
```

### 4. Skeleton:
```
Показываем skeleton → Загружаем изображение → Плавно показываем
```

---

Готовы к **Этапу 6: Модальное окно деталей**? 🚀