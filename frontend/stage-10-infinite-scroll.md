# Этап 10: Бесконечный скролл (Infinite Scroll) SnapBoard

## 🎯 Цель этапа
Реализовать систему бесконечного скролла для оптимизации загрузки большого количества изображений с использованием Intersection Observer API, пагинации данных и обработки состояний загрузки.

---

## 📋 Чеклист этапа
- [ ] Типы для пагинации
- [ ] Расширение store изображений для пагинации
- [ ] Composable useInfiniteScroll
- [ ] Компонент Sentinel (триггер загрузки)
- [ ] Компонент LoadMore (индикатор загрузки и конец списка)
- [ ] Интеграция с существующими страницами
- [ ] Интеграция с поиском и фильтрами
- [ ] Обработка ошибок и retry
- [ ] Оптимизация производительности

---

## 🗂️ Структура данных

### Файл: `types/pagination.ts`

```typescript
/**
 * Состояние пагинации
 */
export interface PaginationState {
  page: number
  pageSize: number
  hasMore: boolean
  isLoading: boolean
  error: string | null
}

/**
 * Параметры запроса страницы
 */
export interface PageRequest {
  page: number
  pageSize: number
  boardId?: string
  query?: string
  tags?: string[]
  sortBy?: string
}

/**
 * Ответ с пагинированными данными
 */
export interface PaginatedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasMore: boolean
}

/**
 * Конфигурация Infinite Scroll
 */
export interface InfiniteScrollConfig {
  pageSize?: number
  threshold?: number  // пиксели до sentinel для триггера загрузки
  initialLoad?: boolean
}

/**
 * Значения по умолчанию
 */
export const DEFAULT_INFINITE_SCROLL_CONFIG: InfiniteScrollConfig = {
  pageSize: 12,
  threshold: 100,
  initialLoad: true
}

/**
 * Состояние загрузки
 */
export type LoadingState = 'idle' | 'loading' | 'error' | 'end'
```

---

## 1️⃣ Расширение Store изображений

### Обновление файла: `store/images.ts`

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Image, 
  UpdateImageDto,
  UploadQueueItem
} from '~/types/image'
import type { 
  PaginationState, 
  PageRequest, 
  PaginatedResponse 
} from '~/types/pagination'
import { 
  generateUploadId, 
  createFilePreview,
  validateFile,
  validateImageUrl,
  DEFAULT_UPLOAD_CONFIG 
} from '~/utils/fileHelpers'

export const useImagesStore = defineStore('images', () => {
  // Существующий State
  const images = ref<Image[]>([])
  const uploadQueue = ref<UploadQueueItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Новый State для пагинации
  const pagination = ref<PaginationState>({
    page: 1,
    pageSize: 12,
    hasMore: true,
    isLoading: false,
    error: null
  })

  // Существующие Getters
  const imagesByBoard = computed(() => (boardId: string) =>
    images.value.filter(img => img.boardId === boardId)
  )

  // ... остальные существующие getters ...

  // Новые Getters для пагинации
  const paginationState = computed(() => pagination.value)
  
  const canLoadMore = computed(() => 
    pagination.value.hasMore && !pagination.value.isLoading
  )

  // Новые Actions для пагинации

  /**
   * Загрузка страницы изображений
   */
  const fetchPagedImages = async (request: PageRequest): Promise<PaginatedResponse<Image>> => {
    pagination.value.isLoading = true
    pagination.value.error = null

    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const response = getMockPagedImages(request)
      
      return response
    } catch (e) {
      const errorMessage = 'Не удалось загрузить изображения'
      pagination.value.error = errorMessage
      throw new Error(errorMessage)
    } finally {
      pagination.value.isLoading = false
    }
  }

  /**
   * Добавление изображений к существующему списку
   */
  const appendImages = (newImages: Image[]) => {
    images.value = [...images.value, ...newImages]
  }

  /**
   * Установка изображений (замена)
   */
  const setImages = (newImages: Image[]) => {
    images.value = newImages
  }

  /**
   * Сброс пагинации
   */
  const resetPagination = () => {
    pagination.value = {
      page: 1,
      pageSize: 12,
      hasMore: true,
      isLoading: false,
      error: null
    }
    images.value = []
  }

  /**
   * Обновление состояния пагинации
   */
  const updatePagination = (updates: Partial<PaginationState>) => {
    pagination.value = { ...pagination.value, ...updates }
  }

  /**
   * Установка ошибки пагинации
   */
  const setPaginationError = (errorMessage: string | null) => {
    pagination.value.error = errorMessage
  }

  // ... существующие actions ...

  return {
    // Существующие exports
    images,
    uploadQueue,
    isLoading,
    error,
    imagesByBoard,
    // ... остальные существующие exports ...
    
    // Новые exports для пагинации
    pagination,
    paginationState,
    canLoadMore,
    fetchPagedImages,
    appendImages,
    setImages,
    resetPagination,
    updatePagination,
    setPaginationError
  }
})

/**
 * Mock функция для получения пагинированных изображений
 */
function getMockPagedImages(request: PageRequest): PaginatedResponse<Image> {
  const { page, pageSize, boardId } = request
  
  // Генерируем mock данные
  const allImages = generateMockImages(boardId || 'default', 50)
  
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const pageImages = allImages.slice(startIndex, endIndex)
  
  return {
    items: pageImages,
    page,
    pageSize,
    totalItems: allImages.length,
    totalPages: Math.ceil(allImages.length / pageSize),
    hasMore: endIndex < allImages.length
  }
}

/**
 * Генерация mock изображений
 */
function generateMockImages(boardId: string, count: number): Image[] {
  const tags = ['природа', 'город', 'архитектура', 'портрет', 'еда', 'путешествия', 'искусство', 'технологии']
  const images: Image[] = []
  
  for (let i = 1; i <= count; i++) {
    const width = 300 + Math.floor(Math.random() * 200)
    const height = 300 + Math.floor(Math.random() * 300)
    
    images.push({
      id: `img-${boardId}-${i}`,
      url: `https://picsum.photos/seed/${boardId}-${i}/${width}/${height}`,
      title: `Изображение ${i}`,
      description: `Описание изображения ${i}`,
      boardId,
      userId: 'current-user',
      tags: [
        tags[Math.floor(Math.random() * tags.length)] || 'природа',
        tags[Math.floor(Math.random() * tags.length)] || 'город'
      ],
      createdAt: new Date(Date.now() - i * 86400000).toISOString()
    })
  }
  
  return images
}
```

---

## 2️⃣ Composable для бесконечного скролла

### Файл: `composables/useInfiniteScroll.ts`

```typescript
import { ref, computed, watch, onMounted, onUnmounted, type Ref, type ComputedRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useImagesStore } from '~/store/images'
import { useSearchStore } from '~/store/search'
import type { Image } from '~/types/image'
import type { InfiniteScrollConfig, LoadingState, PageRequest } from '~/types/pagination'
import { DEFAULT_INFINITE_SCROLL_CONFIG } from '~/types/pagination'

interface UseInfiniteScrollOptions {
  boardId: string
  config?: InfiniteScrollConfig
}

interface UseInfiniteScrollReturn {
  // State
  items: ComputedRef<Image[]>
  isLoading: Ref<boolean>
  hasMore: Ref<boolean>
  error: Ref<string | null>
  page: Ref<number>
  loadingState: ComputedRef<LoadingState>
  
  // Actions
  loadMore: () => Promise<void>
  reset: () => Promise<void>
  retry: () => Promise<void>
  
  // Observer
  sentinelRef: Ref<HTMLElement | null>
  observerActive: Ref<boolean>
}

/**
 * Composable для бесконечного скролла
 */
export function useInfiniteScroll(options: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const { boardId, config = {} } = options
  const mergedConfig = { ...DEFAULT_INFINITE_SCROLL_CONFIG, ...config }
  
  const imagesStore = useImagesStore()
  const searchStore = useSearchStore()
  
  const { pagination, images } = storeToRefs(imagesStore)
  const { query, selectedTags, sortBy } = storeToRefs(searchStore)
  
  // Refs
  const sentinelRef = ref<HTMLElement | null>(null)
  const observerActive = ref(true)
  const observer = ref<IntersectionObserver | null>(null)
  
  // Computed
  const items = computed(() => images.value)
  const isLoading = computed(() => pagination.value.isLoading)
  const hasMore = computed(() => pagination.value.hasMore)
  const error = computed(() => pagination.value.error)
  const page = computed(() => pagination.value.page)
  
  const loadingState = computed<LoadingState>(() => {
    if (pagination.value.isLoading) return 'loading'
    if (pagination.value.error) return 'error'
    if (!pagination.value.hasMore) return 'end'
    return 'idle'
  })

  /**
   * Создание запроса с текущими фильтрами
   */
  const createPageRequest = (pageNum: number): PageRequest => ({
    page: pageNum,
    pageSize: mergedConfig.pageSize!,
    boardId,
    query: query.value || undefined,
    tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
    sortBy: sortBy.value
  })

  /**
   * Загрузка следующей страницы
   */
  const loadMore = async (): Promise<void> => {
    // Предотвращаем дублирующие запросы
    if (pagination.value.isLoading || !pagination.value.hasMore) {
      return
    }

    try {
      const request = createPageRequest(pagination.value.page)
      const response = await imagesStore.fetchPagedImages(request)
      
      // Добавляем новые изображения
      imagesStore.appendImages(response.items)
      
      // Обновляем состояние пагинации
      imagesStore.updatePagination({
        page: pagination.value.page + 1,
        hasMore: response.hasMore
      })
      
      // Останавливаем observer если больше нет данных
      if (!response.hasMore) {
        stopObserver()
      }
    } catch (e) {
      console.error('Error loading more images:', e)
    }
  }

  /**
   * Сброс и загрузка с начала
   */
  const reset = async (): Promise<void> => {
    imagesStore.resetPagination()
    startObserver()
    
    if (mergedConfig.initialLoad) {
      await loadMore()
    }
  }

  /**
   * Повторная попытка после ошибки
   */
  const retry = async (): Promise<void> => {
    imagesStore.setPaginationError(null)
    await loadMore()
  }

  /**
   * Callback для Intersection Observer
   */
  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    const entry = entries[0]
    if (entry?.isIntersecting && observerActive.value) {
      loadMore()
    }
  }

  /**
   * Запуск observer
   */
  const startObserver = () => {
    if (!sentinelRef.value || observer.value) return
    
    observer.value = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: `${mergedConfig.threshold}px`,
      threshold: 0
    })
    
    observer.value.observe(sentinelRef.value)
    observerActive.value = true
  }

  /**
   * Остановка observer
   */
  const stopObserver = () => {
    if (observer.value) {
      observer.value.disconnect()
      observer.value = null
    }
    observerActive.value = false
  }

  // Следим за изменениями фильтров
  watch(
    [query, selectedTags, sortBy],
    () => {
      reset()
    },
    { deep: true }
  )

  // Следим за sentinel ref
  watch(sentinelRef, (newRef) => {
    if (newRef) {
      startObserver()
    } else {
      stopObserver()
    }
  })

  // Lifecycle
  onMounted(() => {
    if (mergedConfig.initialLoad) {
      loadMore()
    }
  })

  onUnmounted(() => {
    stopObserver()
  })

  return {
    // State
    items,
    isLoading,
    hasMore,
    error,
    page,
    loadingState,
    
    // Actions
    loadMore,
    reset,
    retry,
    
    // Observer
    sentinelRef,
    observerActive
  }
}
```

---

## 3️⃣ Компонент Sentinel

### Файл: `components/infinite-scroll/Sentinel.vue`

```vue
<template>
  <div 
    ref="sentinelElement"
    class="infinite-scroll-sentinel"
    :class="{ 'infinite-scroll-sentinel--hidden': !active }"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  active: true
})

const sentinelElement = ref<HTMLElement | null>(null)

// Expose ref для родительского компонента
defineExpose({
  element: sentinelElement
})

// Emit ref при монтировании
const emit = defineEmits<{
  'mounted': [element: HTMLElement | null]
}>()

watch(sentinelElement, (el) => {
  emit('mounted', el)
}, { immediate: true })
</script>

<style lang="sass" scoped>
.infinite-scroll-sentinel
  height: 1px
  width: 100%
  
  &--hidden
    display: none
</style>
```

---

## 4️⃣ Компонент LoadMore

### Файл: `components/infinite-scroll/LoadMore.vue`

```vue
<template>
  <div class="load-more">
    <!-- Состояние загрузки -->
    <div v-if="isLoading" class="load-more__loading">
      <div class="load-more__spinner"></div>
      <span class="load-more__text">Загрузка изображений...</span>
    </div>
    
    <!-- Состояние ошибки -->
    <div v-else-if="error" class="load-more__error">
      <div class="load-more__error-icon">⚠️</div>
      <span class="load-more__error-text">{{ error }}</span>
      <button 
        class="load-more__retry-btn"
        @click="$emit('retry')"
      >
        🔄 Повторить
      </button>
    </div>
    
    <!-- Конец списка -->
    <div v-else-if="!hasMore && itemCount > 0" class="load-more__end">
      <div class="load-more__end-line"></div>
      <span class="load-more__end-text">Все изображения загружены</span>
      <div class="load-more__end-line"></div>
    </div>
    
    <!-- Sentinel для Intersection Observer -->
    <InfiniteScrollSentinel 
      v-if="hasMore && !error"
      :active="!isLoading"
      @mounted="handleSentinelMounted"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  isLoading: boolean
  hasMore: boolean
  error: string | null
  itemCount: number
}

defineProps<Props>()

const emit = defineEmits<{
  'retry': []
  'sentinel-mounted': [element: HTMLElement | null]
}>()

const handleSentinelMounted = (element: HTMLElement | null) => {
  emit('sentinel-mounted', element)
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.load-more
  padding: 32px 16px
  display: flex
  flex-direction: column
  align-items: center
  gap: 16px

  &__loading
    display: flex
    flex-direction: column
    align-items: center
    gap: 12px

  &__spinner
    width: 40px
    height: 40px
    border: 3px solid $gray-200
    border-top-color: $primary-color
    border-radius: 50%
    animation: spin 1s linear infinite

  &__text
    font-size: 14px
    color: $gray-500

  &__error
    display: flex
    flex-direction: column
    align-items: center
    gap: 12px
    padding: 24px
    background: rgba($error-color, 0.05)
    border-radius: $radius
    width: 100%
    max-width: 400px

    &-icon
      font-size: 32px

    &-text
      font-size: 14px
      color: $error-color
      text-align: center

  &__retry-btn
    display: flex
    align-items: center
    gap: 8px
    padding: 10px 20px
    background: $primary-color
    color: white
    border: none
    border-radius: $radius
    font-size: 14px
    font-weight: 600
    cursor: pointer
    transition: background $transition-fast

    &:hover
      background: darken($primary-color, 8%)

  &__end
    display: flex
    align-items: center
    gap: 16px
    width: 100%
    max-width: 400px

    &-line
      flex: 1
      height: 1px
      background: $gray-200

    &-text
      font-size: 13px
      color: $gray-400
      white-space: nowrap

@keyframes spin
  to
    transform: rotate(360deg)
</style>
```

---

## 5️⃣ Интеграция с страницей доски

### Обновление `pages/boards/[id].vue`

```vue
<template>
  <main class="board-page">
    <div class="board-page__container">
      <div v-if="initialLoading" class="board-page__loading">
        <div class="board-page__spinner"></div>
        <p>Загрузка доски...</p>
      </div>

      <div v-else-if="boardError || !currentBoard" class="board-page__error">
        <div class="board-page__error-icon">😕</div>
        <h2>Доска не найдена</h2>
        <p>{{ boardError || 'Возможно, она была удалена' }}</p>
        <NuxtLink to="/boards" class="board-page__back-btn">Вернуться к доскам</NuxtLink>
      </div>

      <template v-else>
        <header class="board-page__header">
          <NuxtLink to="/boards" class="board-page__back">← Назад к доскам</NuxtLink>

          <div class="board-page__info">
            <div class="board-page__title-row">
              <h1 class="board-page__title">{{ currentBoard.title }}</h1>
              <span v-if="currentBoard.isPrivate" class="board-page__badge">🔒 Приватная</span>
            </div>
            <p v-if="currentBoard.description" class="board-page__desc">{{ currentBoard.description }}</p>
            <div class="board-page__meta">
              <span>{{ totalImages }} изображений</span>
              <span>•</span>
              <span>Обновлено {{ formatDate(currentBoard.updatedAt) }}</span>
            </div>
          </div>

          <div class="board-page__actions">
            <button class="board-page__action-btn" @click="openEditModal">✏️ Редактировать</button>
            <button class="board-page__action-btn board-page__action-btn--primary" @click="openUploadModal">
              📤 Добавить изображения
            </button>
          </div>
        </header>

        <!-- Панель поиска -->
        <SearchPanel 
          :board-id="boardId" 
          class="board-page__search"
        />

        <section class="board-page__gallery">
          <!-- Галерея изображений -->
          <div v-if="displayedImages.length" class="board-page__images">
            <article 
              v-for="image in displayedImages" 
              :key="image.id" 
              class="board-page__image"
              @click="handleImageClick(image)"
            >
              <img :src="image.url" :alt="image.title" loading="lazy" />
            </article>
          </div>

          <!-- Пустое состояние при поиске -->
          <div v-else-if="hasActiveFilters && !isLoading" class="board-page__no-results">
            <div class="board-page__no-results-icon">🔍</div>
            <h2>Ничего не найдено</h2>
            <p>Попробуйте изменить параметры поиска</p>
            <button 
              class="board-page__clear-btn"
              @click="clearFilters"
            >
              Сбросить фильтры
            </button>
          </div>

          <!-- Пустое состояние без изображений -->
          <div v-else-if="!displayedImages.length && !isLoading" class="board-page__empty">
            <div class="board-page__empty-icon">🖼️</div>
            <h2>Изображений пока нет</h2>
            <p>Добавьте первое изображение в эту доску</p>
            <button class="board-page__upload-btn" @click="openUploadModal">📤 Загрузить изображения</button>
          </div>

          <!-- Компонент загрузки / конца списка -->
          <InfiniteScrollLoadMore
            :is-loading="isLoading"
            :has-more="hasMore"
            :error="loadError"
            :item-count="displayedImages.length"
            @retry="retry"
            @sentinel-mounted="handleSentinelMounted"
          />
        </section>
      </template>
    </div>

    <!-- Модальные окна -->
    <!-- ... существующие модалки ... -->
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useBoards } from '~/composables/useBoards'
import { useInfiniteScroll } from '~/composables/useInfiniteScroll'
import { useSearch } from '~/composables/useSearch'
import type { Image, ImageViewContext } from '~/types/image'
import type { UpdateBoardDto } from '~/types/board'

const route = useRoute()
const { currentBoard, isLoading: boardLoading, error: boardError, loadBoard, updateBoard, clearCurrentBoard } = useBoards()

const boardId = computed(() => route.params.id as string)

// Infinite Scroll
const {
  items: infiniteImages,
  isLoading,
  hasMore,
  error: loadError,
  loadMore,
  reset,
  retry,
  sentinelRef
} = useInfiniteScroll({
  boardId: boardId.value,
  config: {
    pageSize: 12,
    threshold: 200,
    initialLoad: false
  }
})

// Search & Filters
const { 
  filteredImages,
  hasActiveFilters, 
  clearFilters 
} = useSearch(boardId.value)

// Отображаемые изображения (с учётом фильтров)
const displayedImages = computed(() => {
  if (hasActiveFilters.value) {
    // При активных фильтрах используем клиентскую фильтрацию
    return filteredImages.value
  }
  // Без фильтров используем пагинированные данные
  return infiniteImages.value
})

// Общее количество изображений
const totalImages = computed(() => displayedImages.value.length)

// Начальная загрузка доски
const initialLoading = computed(() => boardLoading.value && !currentBoard.value)

// Модальные окна
const isEditModalOpen = ref(false)
const isUploadModalOpen = ref(false)
const isImageModalOpen = ref(false)
const isSubmitting = ref(false)

const selectedImage = ref<Image | null>(null)
const selectedImageIndex = ref(-1)

const imageViewContext = computed<ImageViewContext>(() => ({
  currentIndex: selectedImageIndex.value,
  totalImages: displayedImages.value.length,
  hasNext: selectedImageIndex.value < displayedImages.value.length - 1,
  hasPrev: selectedImageIndex.value > 0
}))

// Handlers
const handleSentinelMounted = (element: HTMLElement | null) => {
  sentinelRef.value = element
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

const openEditModal = () => { isEditModalOpen.value = true }
const closeEditModal = () => { isEditModalOpen.value = false }
const openUploadModal = () => { isUploadModalOpen.value = true }
const closeUploadModal = () => { isUploadModalOpen.value = false }

const handleImageClick = (image: Image) => {
  selectedImage.value = image
  selectedImageIndex.value = displayedImages.value.findIndex(img => img.id === image.id)
  isImageModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeImageModal = () => {
  isImageModalOpen.value = false
  selectedImage.value = null
  selectedImageIndex.value = -1
  document.body.style.overflow = ''
}

const nextImage = () => {
  if (imageViewContext.value.hasNext) {
    selectedImageIndex.value++
    selectedImage.value = displayedImages.value[selectedImageIndex.value] ?? null
  }
}

const prevImage = () => {
  if (imageViewContext.value.hasPrev) {
    selectedImageIndex.value--
    selectedImage.value = displayedImages.value[selectedImageIndex.value] ?? null
  }
}

const handleImageUpdate = (updatedImage: Image) => {
  selectedImage.value = updatedImage
}

const handleImageDelete = (_id: string) => {
  if (displayedImages.value.length <= 1) {
    closeImageModal()
  } else if (selectedImageIndex.value >= displayedImages.value.length - 1) {
    selectedImageIndex.value--
    selectedImage.value = displayedImages.value[selectedImageIndex.value] ?? null
  } else {
    selectedImage.value = displayedImages.value[selectedImageIndex.value] ?? null
  }
}

const handleEditSubmit = async (data: UpdateBoardDto) => {
  isSubmitting.value = true
  try {
    await updateBoard(boardId.value, data)
    closeEditModal()
  } finally {
    isSubmitting.value = false
  }
}

const handleImagesUploaded = () => {
  // Сбрасываем и перезагружаем после загрузки новых изображений
  reset()
}

// Lifecycle
onMounted(async () => {
  await loadBoard(boardId.value)
  if (currentBoard.value) {
    await loadMore() // Загружаем первую страницу
  }
})

onUnmounted(() => {
  clearCurrentBoard()
  document.body.style.overflow = ''
})

watch(boardId, async (newId) => {
  if (newId) {
    await loadBoard(newId)
    if (currentBoard.value) {
      await reset()
    }
  }
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.board-page
  min-height: 100vh
  background: $gray-50
  padding: 32px 0

  &__container
    max-width: $breakpoint-desktop
    margin: 0 auto
    padding: 0 24px
    
    @include mobile
      padding: 0 16px

  &__loading, &__error
    text-align: center
    padding: 64px 24px

  &__spinner
    width: 48px
    height: 48px
    border: 3px solid $gray-200
    border-top-color: $primary-color
    border-radius: 50%
    margin: 0 auto 16px
    animation: spin 1s linear infinite

  &__error
    &-icon
      font-size: 64px
      margin-bottom: 16px
    h2
      font-size: 24px
      color: $text-light
      margin-bottom: 8px
    p
      color: $gray-400
      margin-bottom: 24px

  &__back-btn
    display: inline-block
    padding: 12px 24px
    background: $primary-color
    color: white
    text-decoration: none
    border-radius: $radius
    font-weight: 600

  &__header
    margin-bottom: 32px

  &__back
    display: inline-flex
    align-items: center
    gap: 8px
    color: $gray-500
    text-decoration: none
    font-size: 14px
    margin-bottom: 16px
    transition: color $transition-fast
    &:hover
      color: $primary-color

  &__info
    margin-bottom: 24px

  &__title-row
    display: flex
    align-items: center
    gap: 12px
    margin-bottom: 8px
    flex-wrap: wrap

  &__title
    font-size: 32px
    font-weight: 700
    color: $text-light
    
    @include mobile
      font-size: 28px

  &__badge
    padding: 6px 12px
    background: $gray-100
    border-radius: $radius-full
    font-size: 14px
    color: $gray-600

  &__desc
    font-size: 16px
    color: $gray-500
    margin-bottom: 12px
    max-width: 600px

  &__meta
    display: flex
    gap: 8px
    font-size: 14px
    color: $gray-400

  &__actions
    display: flex
    gap: 12px
    
    @include mobile
      flex-direction: column

  &__action-btn
    display: flex
    align-items: center
    gap: 8px
    padding: 10px 20px
    background: white
    color: $text-light
    border: 2px solid $gray-200
    border-radius: $radius
    font-size: 14px
    font-weight: 600
    cursor: pointer
    transition: all $transition-fast
    &:hover
      border-color: $primary-color
      color: $primary-color
    &--primary
      background: $primary-color
      color: white
      border-color: $primary-color
      &:hover
        background: darken($primary-color, 8%)
        border-color: darken($primary-color, 8%)
        color: white

  &__search
    margin-bottom: 24px

  &__gallery
    min-height: 400px

  &__images
    display: grid
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))
    gap: 16px
    
    @include mobile
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr))
      gap: 12px

  &__image
    border-radius: $radius-sm
    overflow: hidden
    cursor: pointer
    transition: transform $transition-fast
    img
      width: 100%
      height: auto
      display: block
    &:hover
      transform: translateY(-4px)

  &__empty, &__no-results
    text-align: center
    padding: 64px 24px
    background: white
    border-radius: $radius-lg
    
    &-icon
      font-size: 64px
      margin-bottom: 16px
    h2
      font-size: 24px
      color: $text-light
      margin-bottom: 8px
    p
      color: $gray-400
      margin-bottom: 24px

  &__upload-btn, &__clear-btn
    display: inline-flex
    align-items: center
    gap: 8px
    padding: 12px 24px
    background: $primary-color
    color: white
    border: none
    border-radius: $radius
    font-size: 16px
    font-weight: 600
    cursor: pointer

  &__modal
    position: fixed
    inset: 0
    background: rgba(0, 0, 0, 0.5)
    display: flex
    align-items: center
    justify-content: center
    z-index: $z-index-modal
    padding: 16px

    &-content
      position: relative
      background: white
      border-radius: $radius-lg
      padding: 32px
      max-width: 500px
      width: 100%

    &-close
      position: absolute
      top: 16px
      right: 16px
      width: 32px
      height: 32px
      border: none
      background: $gray-100
      border-radius: 50%
      font-size: 18px
      cursor: pointer

.modal-enter-active, .modal-leave-active
  transition: all 0.3s ease

.modal-enter-from, .modal-leave-to
  opacity: 0

@keyframes spin
  to
    transform: rotate(360deg)
</style>
```

---

## 6️⃣ Обновление useSearch для работы с пагинацией

### Обновление `composables/useSearch.ts`

```typescript
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSearchStore } from '~/store/search'
import { useImagesStore } from '~/store/images'
import type { Image } from '~/types/image'
import type { SortOption } from '~/types/search'

/**
 * Composable для поиска и фильтрации изображений
 * Теперь работает с пагинированными данными
 */
export const useSearch = (boardId?: string) => {
  const searchStore = useSearchStore()
  const imagesStore = useImagesStore()

  const {
    query,
    selectedTags,
    sortBy,
    isSearching,
    history,
    hasActiveFilters,
    activeFiltersCount
  } = storeToRefs(searchStore)

  // Используем изображения из store (уже загруженные через infinite scroll)
  const { images } = storeToRefs(imagesStore)

  /**
   * Получение всех уникальных тегов из загруженных изображений
   */
  const availableTags = computed(() => {
    const boardImages = boardId 
      ? images.value.filter(img => img.boardId === boardId)
      : images.value

    const tagsSet = new Set<string>()
    boardImages.forEach(img => {
      img.tags?.forEach(tag => tagsSet.add(tag))
    })
    
    return Array.from(tagsSet).sort()
  })

  /**
   * Сортировка изображений
   */
  const sortImages = (imageList: Image[], sort: SortOption): Image[] => {
    const sorted = [...imageList]
    
    switch (sort) {
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      case 'oldest':
        return sorted.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      case 'title_asc':
        return sorted.sort((a, b) => 
          (a.title || '').localeCompare(b.title || '')
        )
      case 'title_desc':
        return sorted.sort((a, b) => 
          (b.title || '').localeCompare(a.title || '')
        )
      default:
        return sorted
    }
  }

  /**
   * Фильтрация изображений (клиентская)
   * Применяется к уже загруженным изображениям
   */
  const filteredImages = computed(() => {
    let imageList = boardId 
      ? images.value.filter(img => img.boardId === boardId)
      : images.value

    // Фильтр по поисковому запросу
    if (query.value.trim()) {
      const searchLower = query.value.toLowerCase().trim()
      imageList = imageList.filter(img => 
        img.title?.toLowerCase().includes(searchLower) ||
        img.description?.toLowerCase().includes(searchLower) ||
        img.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Фильтр по тегам
    if (selectedTags.value.length > 0) {
      imageList = imageList.filter(img =>
        selectedTags.value.every(tag => img.tags?.includes(tag))
      )
    }

    // Сортировка
    imageList = sortImages(imageList, sortBy.value)

    return imageList
  })

  /**
   * Количество результатов
   */
  const resultsCount = computed(() => filteredImages.value.length)

  /**
   * Выполнение поиска с добавлением в историю
   */
  const search = (searchQuery: string) => {
    searchStore.setQuery(searchQuery)
    if (searchQuery.trim()) {
      searchStore.addToHistory(searchQuery)
    }
  }

  /**
   * Применение поиска из истории
   */
  const applyFromHistory = (historyQuery: string) => {
    searchStore.setQuery(historyQuery)
  }

  return {
    // State
    query,
    selectedTags,
    sortBy,
    isSearching,
    history,
    hasActiveFilters,
    activeFiltersCount,
    // Computed
    availableTags,
    filteredImages,
    resultsCount,
    // Actions
    search,
    applyFromHistory,
    setQuery: searchStore.setQuery,
    setTags: searchStore.setTags,
    toggleTag: searchStore.toggleTag,
    setSortBy: searchStore.setSortBy,
    setSearching: searchStore.setSearching,
    removeFromHistory: searchStore.removeFromHistory,
    clearHistory: searchStore.clearHistory,
    clearFilters: searchStore.clearFilters
  }
}
```

---

## 7️⃣ Виртуализация (опционально)

### Файл: `composables/useVirtualScroll.ts`

Для очень больших списков можно добавить виртуализацию:

```typescript
import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'

interface UseVirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
}

interface UseVirtualScrollReturn {
  visibleItems: Ref<{ index: number; style: { transform: string } }[]>
  totalHeight: Ref<number>
  containerRef: Ref<HTMLElement | null>
  scrollTo: (index: number) => void
}

/**
 * Composable для виртуализации списка
 * Рендерит только видимые элементы для оптимизации производительности
 */
export function useVirtualScroll<T>(
  items: Ref<T[]>,
  options: UseVirtualScrollOptions
): UseVirtualScrollReturn {
  const { itemHeight, containerHeight, overscan = 3 } = options
  
  const containerRef = ref<HTMLElement | null>(null)
  const scrollTop = ref(0)

  const totalHeight = computed(() => items.value.length * itemHeight)

  const visibleItems = computed(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop.value / itemHeight) - overscan)
    const endIndex = Math.min(
      items.value.length,
      Math.ceil((scrollTop.value + containerHeight) / itemHeight) + overscan
    )

    const visible = []
    for (let i = startIndex; i < endIndex; i++) {
      visible.push({
        index: i,
        style: {
          transform: `translateY(${i * itemHeight}px)`
        }
      })
    }
    return visible
  })

  const handleScroll = () => {
    if (containerRef.value) {
      scrollTop.value = containerRef.value.scrollTop
    }
  }

  const scrollTo = (index: number) => {
    if (containerRef.value) {
      containerRef.value.scrollTop = index * itemHeight
    }
  }

  onMounted(() => {
    containerRef.value?.addEventListener('scroll', handleScroll, { passive: true })
  })

  onUnmounted(() => {
    containerRef.value?.removeEventListener('scroll', handleScroll)
  })

  return {
    visibleItems,
    totalHeight,
    containerRef,
    scrollTo
  }
}
```

---

## 🔟 Структура файлов этапа

```
frontend/
├── types/
│   └── pagination.ts                    # Типы для пагинации
├── store/
│   └── images.ts                        # Расширенный store с пагинацией
├── composables/
│   ├── useInfiniteScroll.ts             # Composable для infinite scroll
│   ├── useSearch.ts                     # Обновлённый composable поиска
│   └── useVirtualScroll.ts              # Виртуализация (опционально)
├── components/
│   └── infinite-scroll/
│       ├── Sentinel.vue                 # Триггер загрузки
│       └── LoadMore.vue                 # Индикатор загрузки/конца
└── pages/
    └── boards/
        └── [id].vue                     # Обновлённая страница доски
```

---

## 📊 Диаграмма работы Infinite Scroll

```
┌─────────────────────────────────────────────────────────────┐
│                      Board Page                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Search Panel                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │    ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐              │   │
│  │    │ Img │  │ Img │  │ Img │  │ Img │              │   │
│  │    └─────┘  └─────┘  └─────┘  └─────┘              │   │
│  │                                                       │   │
│  │    ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐              │   │
│  │    │ Img │  │ Img │  │ Img │  │ Img │   Page 1     │   │
│  │    └─────┘  └─────┘  └─────┘  └─────┘              │   │
│  │                                                       │   │
│  │    ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐              │   │
│  │    │ Img │  │ Img │  │ Img │  │ Img │              │   │
│  │    └─────┘  └─────┘  └─────┘  └─────┘              │   │
│  │                                                       │   │
│  │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │   │
│  │                                                       │   │
│  │    ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐              │   │
│  │    │ Img │  │ Img │  │ Img │  │ Img │   Page 2     │   │
│  │    └─────┘  └─────┘  └─────┘  └─────┘   (loaded)   │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              [Sentinel Element]                       │   │ ← Intersection Observer
│  │                                                       │   │   triggers loadMore()
│  │         ┌──────────────────────────┐                 │   │
│  │         │   🔄 Загрузка...         │                 │   │
│  │         └──────────────────────────┘                 │   │
│  │                    OR                                 │   │
│  │         ┌──────────────────────────┐                 │   │
│  │         │ ── Все загружено ──      │                 │   │
│  │         └──────────────────────────┘                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Конфигурация

| Параметр | Значение по умолчанию | Описание |
|----------|----------------------|----------|
| `pageSize` | 12 | Количество изображений на страницу |
| `threshold` | 100px | Расстояние до sentinel для триггера |
| `initialLoad` | true | Загружать первую страницу при монтировании |

---

## 🔄 Жизненный цикл загрузки

```
1. Component Mount
       │
       ▼
2. Initial Load (if enabled)
       │
       ▼
3. Intersection Observer Setup
       │
       ▼
4. User Scrolls ──────────────────┐
       │                          │
       ▼                          │
5. Sentinel Enters Viewport       │
       │                          │
       ▼                          │
6. loadMore() Called              │
       │                          │
       ├── isLoading = true       │
       │                          │
       ▼                          │
7. Fetch Page from API            │
       │                          │
       ├── Success ───────────────┤
       │       │                  │
       │       ▼                  │
       │   Append Images          │
       │       │                  │
       │       ▼                  │
       │   page++                 │
       │       │                  │
       │       ▼                  │
       │   hasMore? ──── No ──► Stop Observer
       │       │
       │      Yes
       │       │
       │       └──────────────────┘
       │
       └── Error
               │
               ▼
           Show Retry Button
               │
               ▼
           User Clicks Retry ─────► Go to Step 6
```

---

## ✅ Чеклист выполнения

### Типы и интерфейсы
- [ ] `PaginationState` - состояние пагинации
- [ ] `PageRequest` - параметры запроса
- [ ] `PaginatedResponse` - ответ с данными
- [ ] `InfiniteScrollConfig` - конфигурация
- [ ] `LoadingState` - состояния загрузки

### Store
- [ ] Расширение `useImagesStore` для пагинации
- [ ] `fetchPagedImages` - загрузка страницы
- [ ] `appendImages` - добавление изображений
- [ ] `resetPagination` - сброс пагинации
- [ ] `updatePagination` - обновление состояния

### Composables
- [ ] `useInfiniteScroll` - основная логика
- [ ] Intersection Observer setup/cleanup
- [ ] Интеграция с фильтрами
- [ ] `useVirtualScroll` (опционально)

### Компоненты
- [ ] `Sentinel` - триггер загрузки
- [ ] `LoadMore` - индикатор состояния
- [ ] Интеграция с `pages/boards/[id].vue`

### Функционал
- [ ] Автоматическая загрузка при скролле
- [ ] Индикатор загрузки
- [ ] Сообщение о конце списка
- [ ] Обработка ошибок с retry
- [ ] Сброс при изменении фильтров
- [ ] Предотвращение дублирующих запросов

---

## 🎯 Результат этапа

После выполнения этого этапа у вас будет:

1. **Intersection Observer** - эффективное отслеживание скролла
2. **Пагинация данных** - загрузка по страницам
3. **Индикатор загрузки** - визуальная обратная связь
4. **Обработка конца списка** - информативное сообщение
5. **Обработка ошибок** - retry функционал
6. **Интеграция с фильтрами** - сброс при изменении
7. **Оптимизация** - предотвращение лишних запросов

---

## 🔜 Следующий этап

**Этап 11: Профиль пользователя**
- Страница профиля
- Редактирование профиля
- Аватар пользователя
- Настройки приватности
- Мои доски и изображения

Готов к следующему этапу! 🚀
