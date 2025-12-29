# Этап 10.3: Полноэкранный просмотр изображений (Fullscreen View) SnapBoard

## 🎯 Цель этапа
Исправить брейкпоинты в MasonryGrid согласно variables.sass, реализовать полноэкранный просмотр изображений в стиле Pinterest с панелью действий внизу и секцией рекомендаций на основе тегов/названия текущего изображения.

---

## 📋 Чеклист этапа
- [x] Брейкпоинт 2 колонки при ширине < 380px (вместо 350px)
- [x] Брейкпоинты в gridConfig.ts соответствуют variables.sass
- [x] Полноэкранный просмотр изображения при клике на карточку
- [x] Панель действий внизу (избранное, сохранить, поделиться)
- [x] Секция рекомендаций под изображением (MasonryGrid)
- [x] Рекомендации на основе тегов и названия текущего изображения
- [x] Навигация между изображениями (стрелки)
- [x] Закрытие по клику на фон или кнопку

---

## 1️⃣ Брейкпоинты согласно variables.sass

### Проблема
Текущие брейкпоинты в `gridConfig.ts` не соответствуют `variables.sass`:
- variables.sass: `$breakpoint-mobile: 576px`, `$breakpoint-tablet: 768px`, `$breakpoint-laptop: 1024px`
- gridConfig.ts использует: 576px, 1024px (пропущен tablet 768px)

Также нужно 2 колонки при ширине < 380px (не 350px).

### Решение
Обновить `gridConfig.ts` с правильными брейкпоинтами.

### Файл: `utils/gridConfig.ts`

```typescript
/**
 * Единые настройки для masonry grid
 * Брейкпоинты соответствуют variables.sass
 */
export const MASONRY_CONFIG = {
  // Минимальная ширина колонки
  minColumnWidth: {
    desktop: 280,    // > 1024px
    laptop: 250,     // 768px - 1024px
    tablet: 220,     // 576px - 768px
    mobile: 140,     // 380px - 576px
    narrow: 120      // < 380px (для 2 колонок на узких экранах)
  },
  
  // Отступы между элементами
  gap: {
    desktop: 16,
    laptop: 14,
    tablet: 12,
    mobile: 8,
    narrow: 6
  },
  
  // Максимальное количество колонок
  maxColumns: 6,
  
  // Минимальное количество колонок
  minColumns: 2,
  
  // Брейкпоинты (соответствуют variables.sass)
  breakpoints: {
    desktop: 1440,
    laptop: 1024,
    tablet: 768,
    mobile: 576,
    narrow: 380  // Новый брейкпоинт для 2 колонок
  }
}

/**
 * Получить конфигурацию для текущего размера экрана
 */
export function getMasonryConfig() {
  if (typeof window === 'undefined') {
    return {
      minColumnWidth: MASONRY_CONFIG.minColumnWidth.desktop,
      gap: MASONRY_CONFIG.gap.desktop
    }
  }
  
  const width = window.innerWidth
  const { breakpoints, minColumnWidth, gap } = MASONRY_CONFIG
  
  // < 380px - узкие экраны, 2 колонки
  if (width < breakpoints.narrow) {
    return {
      minColumnWidth: minColumnWidth.narrow,
      gap: gap.narrow
    }
  }
  
  // 380px - 576px - mobile
  if (width < breakpoints.mobile) {
    return {
      minColumnWidth: minColumnWidth.mobile,
      gap: gap.mobile
    }
  }
  
  // 576px - 768px - tablet
  if (width < breakpoints.tablet) {
    return {
      minColumnWidth: minColumnWidth.tablet,
      gap: gap.tablet
    }
  }
  
  // 768px - 1024px - laptop
  if (width < breakpoints.laptop) {
    return {
      minColumnWidth: minColumnWidth.laptop,
      gap: gap.laptop
    }
  }
  
  // > 1024px - desktop
  return {
    minColumnWidth: minColumnWidth.desktop,
    gap: gap.desktop
  }
}
```

---

## 2️⃣ Новый компонент FullscreenModal

### Проблема
Текущий `Modal.vue` показывает изображение с sidebar. Нужен новый режим - полноэкранный просмотр как в Pinterest.

### Решение
Создать новый компонент `FullscreenModal.vue` для главной страницы.

### Файл: `components/image/FullscreenModal.vue`

```vue
<template>
  <Teleport to="body">
    <Transition name="fullscreen">
      <div 
        v-if="isOpen" 
        class="fullscreen-modal"
        @click.self="handleClose"
      >
        <!-- Кнопка закрытия -->
        <button class="fullscreen-modal__close" @click="handleClose">
          ✕
        </button>
        
        <!-- Навигация -->
        <button
          v-if="viewContext.hasPrev"
          class="fullscreen-modal__nav fullscreen-modal__nav--prev"
          @click="handlePrev"
        >
          ‹
        </button>
        
        <button
          v-if="viewContext.hasNext"
          class="fullscreen-modal__nav fullscreen-modal__nav--next"
          @click="handleNext"
        >
          ›
        </button>
        
        <!-- Основной контент -->
        <div class="fullscreen-modal__content">
          <!-- Изображение на весь экран -->
          <div class="fullscreen-modal__image-section">
            <img
              :src="image.url"
              :alt="image.title || 'Image'"
              class="fullscreen-modal__image"
            />
          </div>
          
          <!-- Панель действий внизу -->
          <div class="fullscreen-modal__actions">
            <div class="fullscreen-modal__actions-left">
              <h3 class="fullscreen-modal__title">{{ image.title || 'Без названия' }}</h3>
              <div v-if="image.tags?.length" class="fullscreen-modal__tags">
                <span 
                  v-for="tag in image.tags.slice(0, 5)" 
                  :key="tag"
                  class="fullscreen-modal__tag"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>
            
            <div class="fullscreen-modal__actions-right">
              <button 
                class="fullscreen-modal__btn fullscreen-modal__btn--favorite"
                :class="{ 'fullscreen-modal__btn--active': isFavorite }"
                @click="toggleFavorite"
              >
                <span>{{ isFavorite ? '❤️' : '🤍' }}</span>
                <span>Избранное</span>
              </button>
              
              <button 
                class="fullscreen-modal__btn fullscreen-modal__btn--save"
                @click="openSaveModal"
              >
                <span>📌</span>
                <span>Сохранить</span>
              </button>
              
              <button 
                class="fullscreen-modal__btn fullscreen-modal__btn--share"
                @click="shareImage"
              >
                <span>↗️</span>
                <span>Поделиться</span>
              </button>
            </div>
          </div>
          
          <!-- Секция рекомендаций -->
          <div class="fullscreen-modal__recommendations">
            <h4>Похожие изображения</h4>
            
            <ImageMasonryGrid
              v-if="recommendations.length"
              :images="recommendations"
              :is-loading="isLoadingRecommendations"
              @image-click="handleRecommendationClick"
            />
            
            <div v-else-if="isLoadingRecommendations" class="fullscreen-modal__loading">
              <span>Загрузка рекомендаций...</span>
            </div>
            
            <div v-else class="fullscreen-modal__no-recommendations">
              <span>Нет похожих изображений</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { Image, ImageViewContext } from '~/types/image'
import { useImages } from '~/composables/useImages'
import { useFavorites } from '~/composables/useFavorites'

interface Props {
  isOpen: boolean
  image: Image
  viewContext: ImageViewContext
  allImages: Image[]  // Все изображения для поиска рекомендаций
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  next: []
  prev: []
  imageSelect: [image: Image]
}>()

const { isFavorite, toggleFavorite: toggleFav } = useFavorites()

// Состояние
const isLoadingRecommendations = ref(false)
const recommendations = ref<Image[]>([])

// Проверка избранного
const isFavoriteComputed = computed(() => isFavorite(props.image.id))

/**
 * Получить рекомендации на основе тегов и названия
 */
const loadRecommendations = () => {
  isLoadingRecommendations.value = true
  
  try {
    const currentTags = props.image.tags || []
    const currentTitle = (props.image.title || '').toLowerCase()
    const titleWords = currentTitle.split(/\s+/).filter(w => w.length > 2)
    
    // Фильтруем изображения по совпадению тегов или слов из названия
    const filtered = props.allImages.filter(img => {
      // Исключаем текущее изображение
      if (img.id === props.image.id) return false
      
      const imgTags = img.tags || []
      const imgTitle = (img.title || '').toLowerCase()
      
      // Проверяем совпадение тегов
      const hasMatchingTag = currentTags.some(tag => 
        imgTags.includes(tag)
      )
      
      // Проверяем совпадение слов из названия
      const hasMatchingWord = titleWords.some(word =>
        imgTitle.includes(word)
      )
      
      return hasMatchingTag || hasMatchingWord
    })
    
    // Сортируем по количеству совпадений
    const scored = filtered.map(img => {
      const imgTags = img.tags || []
      const imgTitle = (img.title || '').toLowerCase()
      
      let score = 0
      
      // Баллы за совпадение тегов
      currentTags.forEach(tag => {
        if (imgTags.includes(tag)) score += 2
      })
      
      // Баллы за совпадение слов
      titleWords.forEach(word => {
        if (imgTitle.includes(word)) score += 1
      })
      
      return { img, score }
    })
    
    // Сортируем по score и берём топ-12
    recommendations.value = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map(item => item.img)
      
  } finally {
    isLoadingRecommendations.value = false
  }
}

// Загружаем рекомендации при смене изображения
watch(() => props.image.id, () => {
  if (props.isOpen) {
    loadRecommendations()
  }
}, { immediate: true })

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadRecommendations()
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const handleClose = () => {
  emit('close')
}

const handleNext = () => {
  if (props.viewContext.hasNext) {
    emit('next')
  }
}

const handlePrev = () => {
  if (props.viewContext.hasPrev) {
    emit('prev')
  }
}

const toggleFavorite = () => {
  toggleFav(props.image.id)
}

const openSaveModal = () => {
  // TODO: Открыть модал выбора доски
  console.log('Save to board:', props.image.id)
}

const shareImage = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: props.image.title || 'SnapBoard Image',
        url: props.image.url
      })
    } catch (err) {
      console.log('Share cancelled')
    }
  } else {
    // Fallback: копируем ссылку
    await navigator.clipboard.writeText(props.image.url)
    // TODO: Показать toast "Ссылка скопирована"
  }
}

const handleRecommendationClick = (image: Image) => {
  emit('imageSelect', image)
}

// Обработка клавиш
const handleKeydown = (event: KeyboardEvent) => {
  if (!props.isOpen) return
  
  switch (event.key) {
    case 'Escape':
      handleClose()
      break
    case 'ArrowLeft':
      handlePrev()
      break
    case 'ArrowRight':
      handleNext()
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.fullscreen-modal
  position: fixed
  inset: 0
  background: rgba(0, 0, 0, 0.95)
  z-index: $z-index-modal
  overflow-y: auto
  
  &__close
    position: fixed
    top: 16px
    right: 16px
    width: 48px
    height: 48px
    background: rgba(255, 255, 255, 0.1)
    border: none
    border-radius: 50%
    color: white
    font-size: 24px
    cursor: pointer
    transition: all $transition-fast
    z-index: 10
    display: flex
    align-items: center
    justify-content: center
    
    &:hover
      background: rgba(255, 255, 255, 0.2)
    
    @include mobile
      width: 40px
      height: 40px
      top: 12px
      right: 12px
  
  &__nav
    position: fixed
    top: 50%
    transform: translateY(-50%)
    width: 56px
    height: 56px
    background: rgba(255, 255, 255, 0.1)
    border: none
    border-radius: 50%
    color: white
    font-size: 32px
    cursor: pointer
    transition: all $transition-fast
    z-index: 10
    display: flex
    align-items: center
    justify-content: center
    
    &:hover
      background: rgba(255, 255, 255, 0.2)
    
    &--prev
      left: 16px
    
    &--next
      right: 16px
    
    @include mobile
      width: 44px
      height: 44px
      font-size: 24px
      
      &--prev
        left: 8px
      
      &--next
        right: 8px
  
  &__content
    max-width: 1200px
    margin: 0 auto
    padding: 80px 80px 40px
    
    @include tablet
      padding: 70px 40px 32px
    
    @include mobile
      padding: 60px 16px 24px
  
  &__image-section
    display: flex
    justify-content: center
    margin-bottom: 24px
  
  &__image
    max-width: 100%
    max-height: 70vh
    object-fit: contain
    border-radius: $radius
    
    @include mobile
      max-height: 50vh
  
  &__actions
    display: flex
    justify-content: space-between
    align-items: center
    padding: 20px 24px
    background: rgba(255, 255, 255, 0.05)
    border-radius: $radius
    margin-bottom: 32px
    gap: 16px
    
    @include tablet
      flex-direction: column
      align-items: stretch
    
    @include mobile
      padding: 16px
      margin-bottom: 24px
  
  &__actions-left
    flex: 1
  
  &__actions-right
    display: flex
    gap: 12px
    
    @include mobile
      justify-content: center
      flex-wrap: wrap
  
  &__title
    color: white
    font-size: 20px
    font-weight: 600
    margin: 0 0 8px
    
    @include mobile
      font-size: 18px
  
  &__tags
    display: flex
    gap: 8px
    flex-wrap: wrap
  
  &__tag
    color: $gray-400
    font-size: 14px
    
    @include mobile
      font-size: 12px
  
  &__btn
    display: flex
    align-items: center
    gap: 8px
    padding: 12px 20px
    background: rgba(255, 255, 255, 0.1)
    border: none
    border-radius: $radius
    color: white
    font-size: 14px
    font-weight: 500
    cursor: pointer
    transition: all $transition-fast
    
    &:hover
      background: rgba(255, 255, 255, 0.2)
    
    &--active
      background: $error-color
      
      &:hover
        background: darken($error-color, 10%)
    
    @include mobile
      padding: 10px 16px
      font-size: 13px
  
  &__recommendations
    h4
      color: white
      font-size: 24px
      font-weight: 600
      margin-bottom: 24px
      
      @include mobile
        font-size: 20px
        margin-bottom: 16px
  
  &__loading,
  &__no-recommendations
    text-align: center
    padding: 48px 24px
    color: $gray-400
    font-size: 16px

// Анимации
.fullscreen-enter-active,
.fullscreen-leave-active
  transition: all 0.3s ease

.fullscreen-enter-from,
.fullscreen-leave-to
  opacity: 0
</style>
```

---

## 3️⃣ Интеграция на главную страницу

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
    
    <!-- Галерея с бесконечным скроллом -->
    <section class="home-page__gallery">
      <div class="home-page__container">
        <h2>{{ galleryTitle }}</h2>
        
        <!-- Masonry Grid -->
        <ImageMasonryGrid
          :images="displayedImages"
          :is-loading="isLoading && displayedImages.length === 0"
          @image-click="handleImageClick"
        />
        
        <!-- Пустое состояние при поиске -->
        <div v-if="hasActiveFilters && !isLoading && displayedImages.length === 0" class="home-page__no-results">
          <div class="home-page__no-results-icon">🔍</div>
          <h3>Ничего не найдено</h3>
          <p>Попробуйте изменить параметры поиска</p>
          <button class="home-page__clear-btn" @click="clearFilters">
            Сбросить фильтры
          </button>
        </div>
        
        <!-- Infinite Scroll Loader -->
        <InfiniteScrollLoadMore
          v-if="!hasActiveFilters"
          :is-loading="isLoading"
          :has-more="hasMore"
          :error="error"
          :item-count="items.length"
          @retry="retry"
          @sentinel-mounted="handleSentinelMounted"
        />
      </div>
    </section>
    
    <!-- Полноэкранный просмотр -->
    <ImageFullscreenModal
      :is-open="isModalOpen"
      :image="selectedImage!"
      :view-context="viewContext"
      :all-images="displayedImages"
      @close="closeModal"
      @next="nextImage"
      @prev="prevImage"
      @image-select="selectImage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useInfiniteScroll } from '~/composables/useInfiniteScroll'
import { useSearch } from '~/composables/useSearch'
import type { Image, ImageViewContext } from '~/types/image'

// Infinite scroll
const {
  items,
  isLoading,
  hasMore,
  error,
  retry,
  sentinelRef
} = useInfiniteScroll({
  boardId: 'home',
  config: {
    pageSize: 12,
    threshold: 200,
    initialLoad: true
  }
})

// Поиск и фильтрация
const { filteredImages, hasActiveFilters, clearFilters } = useSearch()

// Отображаемые изображения
const displayedImages = computed(() => {
  if (hasActiveFilters.value) {
    return filteredImages.value
  }
  return items.value
})

// Заголовок галереи
const galleryTitle = computed(() => {
  if (hasActiveFilters.value) {
    return `Результаты поиска (${displayedImages.value.length})`
  }
  return 'Популярные изображения'
})

// Модальное окно
const isModalOpen = ref(false)
const selectedImage = ref<Image | null>(null)
const selectedIndex = ref(0)

const viewContext = computed<ImageViewContext>(() => ({
  currentIndex: selectedIndex.value,
  totalImages: displayedImages.value.length,
  hasPrev: selectedIndex.value > 0,
  hasNext: selectedIndex.value < displayedImages.value.length - 1
}))

const handleSentinelMounted = (element: HTMLElement | null) => {
  sentinelRef.value = element
}

const handleImageClick = (image: Image) => {
  const index = displayedImages.value.findIndex(img => img.id === image.id)
  if (index !== -1) {
    selectedIndex.value = index
    selectedImage.value = image
    isModalOpen.value = true
  }
}

const closeModal = () => {
  isModalOpen.value = false
}

const nextImage = () => {
  if (selectedIndex.value < displayedImages.value.length - 1) {
    selectedIndex.value++
    selectedImage.value = displayedImages.value[selectedIndex.value]
  }
}

const prevImage = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--
    selectedImage.value = displayedImages.value[selectedIndex.value]
  }
}

const selectImage = (image: Image) => {
  const index = displayedImages.value.findIndex(img => img.id === image.id)
  if (index !== -1) {
    selectedIndex.value = index
    selectedImage.value = image
  }
}
</script>

<!-- Стили остаются без изменений -->
```

---

## 4️⃣ Composable для избранного (если нет)

### Файл: `composables/useFavorites.ts`

```typescript
import { ref, computed } from 'vue'

const favorites = ref<Set<string>>(new Set())

// Загрузка из localStorage
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('snapboard_favorites')
  if (saved) {
    try {
      favorites.value = new Set(JSON.parse(saved))
    } catch (e) {
      console.error('Failed to parse favorites:', e)
    }
  }
}

export function useFavorites() {
  const isFavorite = (imageId: string) => {
    return favorites.value.has(imageId)
  }
  
  const toggleFavorite = (imageId: string) => {
    if (favorites.value.has(imageId)) {
      favorites.value.delete(imageId)
    } else {
      favorites.value.add(imageId)
    }
    
    // Сохраняем в localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'snapboard_favorites',
        JSON.stringify([...favorites.value])
      )
    }
  }
  
  const favoriteIds = computed(() => [...favorites.value])
  
  return {
    isFavorite,
    toggleFavorite,
    favoriteIds
  }
}
```

---

## 📁 Файлы для изменения

| Файл | Изменения |
|------|-----------|
| `utils/gridConfig.ts` | Брейкпоинты согласно variables.sass, 380px для 2 колонок |
| `components/image/FullscreenModal.vue` | Новый компонент полноэкранного просмотра |
| `pages/index.vue` | Интеграция FullscreenModal |
| `composables/useFavorites.ts` | Новый composable для избранного |

---

## ✅ Критерии завершения

1. 2 колонки при ширине экрана < 380px
2. Брейкпоинты в gridConfig.ts соответствуют variables.sass (576, 768, 1024)
3. При клике на карточку открывается полноэкранный просмотр
4. Изображение занимает большую часть экрана
5. Внизу панель с кнопками: Избранное, Сохранить, Поделиться
6. Под изображением секция "Похожие изображения" с MasonryGrid
7. Рекомендации основаны на тегах и названии текущего изображения
8. Работает навигация стрелками (клавиатура и кнопки)
9. Закрытие по Escape, клику на фон или кнопку ✕
10. Нет TypeScript ошибок
