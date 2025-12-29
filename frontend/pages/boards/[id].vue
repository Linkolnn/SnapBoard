<template>
  <main class="board-page">
    <div class="board-page__container">
      <div v-if="boardLoading && !currentBoard" class="board-page__loading">
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
              <span>{{ displayedImages.length }} изображений</span>
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
          <!-- Masonry Grid -->
          <ImageMasonryGrid
            v-if="displayedImages.length"
            :images="displayedImages"
            :is-loading="infiniteLoading && displayedImages.length === 0"
            @image-click="handleImageClick"
          />

          <!-- Пустое состояние при поиске -->
          <div v-else-if="hasActiveFilters && !infiniteLoading" class="board-page__no-results">
            <div class="board-page__no-results-icon">🔍</div>
            <h2>Ничего не найдено</h2>
            <p>Попробуйте изменить параметры поиска</p>
            <button class="board-page__clear-btn" @click="clearFilters">
              Сбросить фильтры
            </button>
          </div>

          <!-- Пустое состояние без изображений -->
          <div v-else-if="!displayedImages.length && !infiniteLoading" class="board-page__empty">
            <div class="board-page__empty-icon">🖼️</div>
            <h2>Изображений пока нет</h2>
            <p>Добавьте первое изображение в эту доску</p>
            <button class="board-page__upload-btn" @click="openUploadModal">📤 Загрузить изображения</button>
          </div>

          <!-- Компонент загрузки / конца списка -->
          <InfiniteScrollLoadMore
            :is-loading="infiniteLoading"
            :has-more="hasMore"
            :error="loadError"
            :item-count="displayedImages.length"
            @retry="retry"
            @sentinel-mounted="handleSentinelMounted"
          />
        </section>
      </template>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="isEditModalOpen" class="board-page__modal" @click.self="closeEditModal">
          <div class="board-page__modal-content">
            <button class="board-page__modal-close" @click="closeEditModal">✕</button>
            <BoardForm
              :board="currentBoard"
              :is-submitting="isSubmitting"
              @submit="handleEditSubmit"
              @cancel="closeEditModal"
            />
          </div>
        </div>
      </Transition>
    </Teleport>

    <UploadModal
      :is-open="isUploadModalOpen"
      :board-id="boardId"
      @close="closeUploadModal"
      @uploaded="handleImagesUploaded"
    />

    <ImageModal
      v-if="selectedImage"
      :is-open="isImageModalOpen"
      :image="selectedImage"
      :view-context="imageViewContext"
      @close="closeImageModal"
      @next="nextImage"
      @prev="prevImage"
      @update="handleImageUpdate"
      @delete="handleImageDelete"
    />
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
  isLoading: infiniteLoading,
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

// Отображаемые изображения
const displayedImages = computed(() => {
  if (hasActiveFilters.value) {
    return filteredImages.value
  }
  return infiniteImages.value
})

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
  reset()
}

onMounted(async () => {
  await loadBoard(boardId.value)
  if (currentBoard.value) {
    await loadMore()
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
