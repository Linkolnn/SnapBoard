<template>
  <main class="board-page">
    <div class="board-page__container">
      <div v-if="isLoading" class="board-page__loading">
        <div class="board-page__spinner"></div>
        <p>Загрузка доски...</p>
      </div>

      <div v-else-if="error || !currentBoard" class="board-page__error">
        <div class="board-page__error-icon">😕</div>
        <h2>Доска не найдена</h2>
        <p>{{ error || 'Возможно, она была удалена' }}</p>
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
              <span>{{ boardImages.length }} изображений</span>
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

        <section class="board-page__gallery">
          <div v-if="boardImages.length" class="board-page__images">
            <div v-for="image in boardImages" :key="image.id" class="board-page__image">
              <img :src="image.url" :alt="image.title" loading="lazy" />
            </div>
          </div>

          <div v-else class="board-page__empty">
            <div class="board-page__empty-icon">🖼️</div>
            <h2>Изображений пока нет</h2>
            <p>Добавьте первое изображение в эту доску</p>
            <button class="board-page__upload-btn" @click="openUploadModal">📤 Загрузить изображения</button>
          </div>
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
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useBoards } from '~/composables/useBoards'
import { useImages } from '~/composables/useImages'
import type { UpdateBoardDto } from '~/types/board'

const route = useRoute()
const { currentBoard, isLoading, error, loadBoard, updateBoard, clearCurrentBoard } = useBoards()
const { loadBoardImages, getBoardImages } = useImages()

const boardId = computed(() => route.params.id as string)
const boardImages = computed(() => getBoardImages(boardId.value))

const isEditModalOpen = ref(false)
const isUploadModalOpen = ref(false)
const isSubmitting = ref(false)

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

const openEditModal = () => { isEditModalOpen.value = true }
const closeEditModal = () => { isEditModalOpen.value = false }
const openUploadModal = () => { isUploadModalOpen.value = true }
const closeUploadModal = () => { isUploadModalOpen.value = false }

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
  console.log('Images uploaded successfully')
}

onMounted(async () => {
  await loadBoard(boardId.value)
  if (currentBoard.value) {
    await loadBoardImages(boardId.value)
  }
})

onUnmounted(() => clearCurrentBoard())

watch(boardId, async (newId) => {
  if (newId) {
    await loadBoard(newId)
    if (currentBoard.value) {
      await loadBoardImages(newId)
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
    flex-wrap: wrap

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

  &__gallery
    min-height: 400px

  &__images
    display: grid
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))
    gap: 16px

  &__image
    border-radius: $radius-sm
    overflow: hidden
    img
      width: 100%
      height: auto
      display: block

  &__empty
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

  &__upload-btn
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
