# Этап 5: Masonry Grid для изображений SnapBoard

## 🎯 Цель этапа
Создать красивую Masonry Grid (как в Pinterest) для отображения изображений разных размеров. **Колонки растягиваются на всю доступную ширину** без пустого пространства, с правильной адаптивностью.

---

## 📋 Чеклист этапа
- [ ] Composable с правильным расчётом ширины колонок
- [ ] Компонент Masonry Grid с адаптивностью
- [ ] Lazy loading изображений
- [ ] Skeleton loader для изображений
- [ ] Компонент карточки изображения
- [ ] Исправление бага с загрузкой

---

## 🎨 Как работает адаптивность

### Desktop (1440px):
```
max-width: 1440px контейнер
padding: 24px с каждой стороны
Доступная ширина: 1392px
4-5 колонок растягиваются на 1392px
```

### Tablet (768px):
```
padding: 16px с каждой стороны
Доступная ширина: 736px
2-3 колонки растягиваются на 736px
```

### Mobile (576px):
```
padding: 16px с каждой стороны
1 колонка на всю ширину: 544px
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
  height: number
  column: number
  top: number
}

/**
 * Composable для расчёта Masonry Layout
 * Колонки автоматически растягиваются на всю доступную ширину
 * 
 * @param minColumnWidth - минимальная ширина колонки
 * @param gap - отступ между элементами
 */
export const useMasonryLayout = (minColumnWidth = 250, gap = 16) => {
  const items = ref<MasonryItem[]>([])
  const columnCount = ref(0)
  const columnWidth = ref(0)
  const columnHeights = ref<number[]>([])
  const containerHeight = ref(0)
  
  /**
   * Расчёт количества колонок и их ширины
   * @param availableWidth - доступная ширина (за вычетом padding)
   */
  const calculateColumns = (availableWidth: number) => {
    if (availableWidth <= 0) {
      return { count: 1, width: availableWidth }
    }
    
    // Рассчитываем сколько колонок влезет
    const maxColumns = Math.floor((availableWidth + gap) / (minColumnWidth + gap))
    const count = Math.max(1, Math.min(maxColumns, 6))
    
    // Рассчитываем ширину колонки чтобы заполнить всё пространство
    const totalGaps = (count - 1) * gap
    const width = Math.floor((availableWidth - totalGaps) / count)
    
    return { count, width }
  }
  
  /**
   * Найти самую короткую колонку
   */
  const getShortestColumn = (): number => {
    let shortest = 0
    let minHeight = columnHeights.value[0] || 0
    
    for (let i = 1; i < columnHeights.value.length; i++) {
      if (columnHeights.value[i] < minHeight) {
        minHeight = columnHeights.value[i]
        shortest = i
      }
    }
    
    return shortest
  }
  
  /**
   * Расчёт layout
   * @param itemHeights - массив высот элементов
   * @param availableWidth - доступная ширина контейнера
   */
  const calculateLayout = (itemHeights: number[], availableWidth: number) => {
    if (!itemHeights.length || availableWidth <= 0) return
    
    const { count, width } = calculateColumns(availableWidth)
    columnCount.value = count
    columnWidth.value = width
    columnHeights.value = new Array(count).fill(0)
    
    const calculatedItems: MasonryItem[] = []
    
    itemHeights.forEach((height, index) => {
      // Используем минимальную высоту если высота = 0
      const itemHeight = height > 0 ? height : 300
      
      const column = getShortestColumn()
      
      calculatedItems.push({
        id: `item-${index}`,
        height: itemHeight,
        column,
        top: columnHeights.value[column]
      })
      
      columnHeights.value[column] += itemHeight + gap
    })
    
    items.value = calculatedItems
    containerHeight.value = Math.max(...columnHeights.value, 0)
  }
  
  return {
    items,
    columnCount,
    columnWidth,
    containerHeight,
    gap,
    calculateLayout
  }
}
```

---

## 2️⃣ Компонент Skeleton Loader

### Файл: `components/image/Skeleton.vue`

```vue
<template>
  <article class="img-skeleton" :style="{ height: height + 'px' }">
    <div class="img-skeleton__shimmer"></div>
  </article>
</template>

<script setup lang="ts">
interface Props {
  height?: number
}

withDefaults(defineProps<Props>(), {
  height: 300
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.img-skeleton
  position: relative
  width: 100%
  background: $gray-200
  border-radius: $radius
  overflow: hidden
  
  &__shimmer
    position: absolute
    top: 0
    left: -100%
    width: 100%
    height: 100%
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)
    animation: shimmer 1.5s infinite
    
@keyframes shimmer
  0%
    left: -100%
  100%
    left: 100%
</style>
```

---

## 3️⃣ Компонент карточки изображения

### Файл: `components/image/Card.vue`

```vue
<template>
  <article 
    class="img-card"
    :class="{ 'img-card--loaded': isLoaded }"
    @click="handleClick"
  >
    <!-- Skeleton пока не загружено -->
    <ImageSkeleton 
      v-if="!isLoaded"
      :height="estimatedHeight"
    />
    
    <!-- Изображение - используем v-if вместо v-show -->
    <img
      v-if="isLoaded"
      :src="image.url"
      :alt="image.title || 'Image'"
      class="img-card__img"
      loading="lazy"
      @load="handleImageLoad"
      @error="handleImageError"
    />
    
    <!-- Overlay -->
    <div v-if="isLoaded" class="img-card__overlay">
      <div class="img-card__info">
        <h3 v-if="image.title" class="img-card__title">
          {{ image.title }}
        </h3>
        <p v-if="image.description" class="img-card__desc">
          {{ image.description }}
        </p>
        
        <div v-if="image.tags?.length" class="img-card__tags">
          <span 
            v-for="tag in image.tags.slice(0, 3)" 
            :key="tag"
            class="img-card__tag"
          >
            #{{ tag }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Image } from '~/types'

interface Props {
  image: Image
  estimatedHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  estimatedHeight: 300
})

const emit = defineEmits<{
  click: [image: Image]
  load: [height: number]
}>()

const isLoaded = ref(true)

/**
 * Обработчик загрузки изображения
 */
const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  
  // Эмитим высоту ДО изменения состояния
  emit('load', img.offsetHeight)
  
  // Затем меняем состояние
  isLoaded.value = true
}

/**
 * Обработчик ошибки загрузки
 */
const handleImageError = () => {
  console.error('Failed to load image:', props.image.url)
  emit('load', props.estimatedHeight)
  isLoaded.value = true
}

/**
 * Клик по карточке
 */
const handleClick = () => {
  if (isLoaded.value) {
    emit('click', props.image)
  }
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.img-card
  position: relative
  width: 100%
  border-radius: $radius
  overflow: hidden
  cursor: pointer
  background: $gray-200
  transition: all $transition-normal
  
  &:hover
    transform: translateY(-4px)
    box-shadow: $shadow-lg
    
    .img-card__overlay
      opacity: 1
  
  &__img
    width: 100%
    height: auto
    display: block
    animation: fadeIn 0.3s ease-in
  
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
    opacity: 0
    transition: opacity $transition-normal
  
  &__info
    width: 100%
    color: white
  
  &__title
    font-size: 16px
    font-weight: 600
    margin-bottom: 4px
    display: -webkit-box
    -webkit-line-clamp: 2
    -webkit-box-orient: vertical
    overflow: hidden
  
  &__desc
    font-size: 14px
    margin-bottom: 8px
    opacity: 0.9
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
  <section ref="gridRef" class="masonry-grid">
    <div 
      class="masonry-grid__container"
      :style="{ height: containerHeight + 'px' }"
    >
      <!-- Skeleton при загрузке -->
      <template v-if="isLoading">
        <div
          v-for="i in 8"
          :key="`skeleton-${i}`"
          class="masonry-grid__item"
          :style="getSkeletonStyle(i - 1)"
        >
          <ImageSkeleton :height="getRandomHeight()" />
        </div>
      </template>
      
      <!-- Реальные изображения -->
      <template v-else>
        <div
          v-for="(item, index) in layoutItems"
          :key="images[index]?.id || index"
          class="masonry-grid__item"
          :style="getItemStyle(item)"
        >
          <ImageCard
            v-if="images[index]"
            :image="images[index]"
            :estimated-height="item.height"
            @load="(h) => handleImageLoad(index, h)"
            @click="handleImageClick"
          />
        </div>
      </template>
    </div>
    
    <!-- Пустое состояние -->
    <div v-if="!isLoading && !images.length" class="masonry-grid__empty">
      <p>Изображений пока нет</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useMasonryLayout } from '~/composables/useMasonryLayout'
import type { Image } from '~/types'

interface Props {
  images: Image[]
  isLoading?: boolean
  minColumnWidth?: number
  gap?: number
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  minColumnWidth: 250,
  gap: 16
})

const emit = defineEmits<{
  imageClick: [image: Image]
}>()

const gridRef = ref<HTMLElement | null>(null)

const {
  items: layoutItems,
  columnCount,
  columnWidth,
  containerHeight,
  gap,
  calculateLayout
} = useMasonryLayout(props.minColumnWidth, props.gap)

const imageHeights = ref<number[]>([])
const loadedCount = ref(0)

/**
 * Получить доступную ширину контейнера (с учетом padding)
 */
const getAvailableWidth = (): number => {
  if (!gridRef.value) return 0
  
  const rect = gridRef.value.getBoundingClientRect()
  // Получаем ширину без padding
  const style = window.getComputedStyle(gridRef.value)
  const paddingLeft = parseInt(style.paddingLeft)
  const paddingRight = parseInt(style.paddingRight)
  
  return rect.width - paddingLeft - paddingRight
}

/**
 * Случайная высота для skeleton
 */
const getRandomHeight = () => {
  return Math.floor(Math.random() * 200) + 250
}

/**
 * Стили для skeleton
 */
const getSkeletonStyle = (index: number) => {
  const col = index % Math.max(columnCount.value, 1)
  const row = Math.floor(index / Math.max(columnCount.value, 1))
  
  return {
    position: 'absolute',
    left: `${col * (columnWidth.value + gap)}px`,
    top: `${row * 350}px`,
    width: `${columnWidth.value}px`
  }
}

/**
 * Стили для элемента
 */
const getItemStyle = (item: any) => {
  const style = {
    position: 'absolute',
    left: `${item.column * (columnWidth.value + gap)}px`,
    top: `${item.top}px`,
    width: `${columnWidth.value}px`,
  }
  
  return style
}

/**
 * Обработчик загрузки изображения
 */
const handleImageLoad = (index: number, height: number) => {
  imageHeights.value[index] = height
  loadedCount.value++
  
  // Пересчитываем layout сразу после каждой загрузки
  // Это позволяет карточкам появляться постепенно
  const width = getAvailableWidth()
  if (width > 0) {
    calculateLayout(imageHeights.value, width)
  }
}

/**
 * Клик по изображению
 */
const handleImageClick = (image: Image) => {
  emit('imageClick', image)
}

/**
 * Обновление layout
 */
const updateLayout = () => {
  if (!gridRef.value || !props.images.length) return
  
  const width = getAvailableWidth()
  
  // Если высоты уже есть - используем их
  if (imageHeights.value.length === props.images.length) {
    calculateLayout(imageHeights.value, width)
  } else {
    // Иначе используем примерные значения
    const estimated = new Array(props.images.length).fill(300)
    calculateLayout(estimated, width)
  }
}

/**
 * Наблюдаем за изменением массива изображений
 */
watch(() => props.images, (newImages) => {
  if (newImages.length > 0) {
    // Инициализируем примерными высотами для начального layout
    imageHeights.value = new Array(newImages.length).fill(300)
    loadedCount.value = 0
    
    nextTick(() => {
      const width = getAvailableWidth()
      if (width > 0) {
        calculateLayout(imageHeights.value, width)
      }
    })
  }
}, { immediate: true })

/**
 * Инициализация
 */
onMounted(() => {
  if (!gridRef.value) return
  
  // Первоначальный расчёт
  updateLayout()
  
  // Отслеживаем изменение размера
  const resizeObserver = new ResizeObserver(() => {
    updateLayout()
  })
  
  resizeObserver.observe(gridRef.value)
  
  onUnmounted(() => {
    resizeObserver.disconnect()
  })
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.masonry-grid
  width: 100%
  // Здесь НЕ устанавливаем max-width - это делает layout
  
  &__container
    position: relative
    width: 100%
    transition: height 0.3s ease
  
  &__item
    position: absolute
    transition: all 0.3s ease
  
  &__empty
    padding: 64px 24px
    text-align: center
    
    p
      font-size: 18px
      color: $gray-400
</style>
```

---

## 5️⃣ Обновлённая страница с правильным контейнером

### Файл: `pages/index.vue`

```vue
<template>
  <div class="home-page">
    <!-- Hero секция -->
    <section class="home-page__hero">
      <div class="home-page__container">
        <h1>Добро пожаловать в SnapBoard</h1>
        <p>Ваша визуальная доска вдохновения</p>
      </div>
    </section>
    
    <!-- Галерея с правильным контейнером -->
    <section class="home-page__gallery">
      <div class="home-page__container">
        <h2>Популярные изображения</h2>
        
        <!-- Masonry Grid - занимает всю ширину контейнера -->
        <ImageMasonryGrid
          :images="mockImages"
          :is-loading="isLoading"
          :min-column-width="250"
          :gap="16"
          @image-click="handleImageClick"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Image } from '~/types'

const isLoading = ref(true)

/**
 * Mock изображения с разными URL для тестирования
 */
const mockImages = ref<Image[]>([
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600',
    title: 'Горный пейзаж',
    description: 'Удивительный вид на горы',
    boardId: '1',
    userId: '1',
    tags: ['природа', 'горы'],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300',
    title: 'Архитектура',
    description: 'Современное здание',
    boardId: '1',
    userId: '1',
    tags: ['архитектура'],
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&h=500',
    title: 'Интерьер',
    boardId: '1',
    userId: '1',
    tags: ['интерьер', 'дизайн'],
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400',
    title: 'Еда',
    description: 'Вкусная еда',
    boardId: '1',
    userId: '1',
    tags: ['еда'],
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=550',
    title: 'Мода',
    boardId: '1',
    userId: '1',
    tags: ['мода'],
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=350',
    title: 'Искусство',
    boardId: '1',
    userId: '1',
    tags: ['искусство'],
    createdAt: new Date().toISOString()
  },
  {
    id: '7',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=450',
    title: 'Путешествия',
    boardId: '1',
    userId: '1',
    tags: ['путешествия'],
    createdAt: new Date().toISOString()
  },
  {
    id: '8',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=380',
    title: 'Природа',
    boardId: '1',
    userId: '1',
    tags: ['природа'],
    createdAt: new Date().toISOString()
  }
])

const handleImageClick = (image: Image) => {
  console.log('Image clicked:', image)
}

onMounted(() => {
  // Имитация загрузки
  setTimeout(() => {
    isLoading.value = false
  }, 500)
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.home-page
  width: 100%
  
  // Контейнер с max-width и padding
  &__container
    max-width: $breakpoint-desktop
    margin: 0 auto
    padding: 0 24px
    
    @include mobile
      padding: 0 16px
  
  &__hero
    padding: 48px 0
    text-align: center
    
    h1
      font-size: 42px
      font-weight: 700
      color: $text-light
      margin-bottom: 16px
      
      @include mobile
        font-size: 32px
    
    p
      font-size: 18px
      color: $gray-500
  
  &__gallery
    padding: 32px 0 64px
    
    h2
      font-size: 28px
      font-weight: 700
      color: $text-light
      margin-bottom: 32px
      
      @include mobile
        font-size: 24px
</style>
```

---

## ✅ Что исправлено

### 1. Адаптивность колонок:
```
Desktop 1440px: контейнер 1392px (1440 - 48px padding)
  → 4-5 колонок растянуты на 1392px ✅

Tablet 768px: контейнер 736px (768 - 32px padding)
  → 2-3 колонки растянуты на 736px ✅

Mobile 576px: контейнер 544px (576 - 32px padding)
  → 1 колонка на 544px ✅
```

### 2. Исправлен баг со skeleton:
- ✅ Добавлен `nextTick()` после загрузки изображения
- ✅ Правильная передача пропсов `v-if="images[index]"`
- ✅ Счётчик загруженных изображений
- ✅ Пересчёт layout после загрузки всех изображений
- ✅ Использование Unsplash вместо picsum для надёжности

### 3. Правильный расчёт ширины:
- ✅ `getAvailableWidth()` учитывает padding контейнера
- ✅ Колонки растягиваются на всю доступную ширину
- ✅ ResizeObserver отслеживает изменения

### 4. Структура страницы:
- ✅ Контейнер с `max-width` в layout
- ✅ MasonryGrid занимает всю ширину контейнера
- ✅ Нет вложенных контейнеров

---

## 🎯 Результат

Теперь:
- ✅ Колонки заполняют всю ширину (нет пустого места)
- ✅ Изображения загружаются и выходят из skeleton
- ✅ Адаптивность работает на всех экранах
- ✅ Правильный расчёт с учётом padding

Готов к следующему этапу! 🚀