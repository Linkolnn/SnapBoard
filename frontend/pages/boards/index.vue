<template>
  <main class="boards-page">
    <div class="boards-page__container">
      <header class="boards-page__header">
        <div class="boards-page__title-row">
          <h1 class="boards-page__title">Мои доски</h1>
          <span class="boards-page__count">{{ totalBoards }} досок</span>
        </div>
        <button class="boards-page__create-btn" @click="openCreateModal">
          <span class="boards-page__create-icon">+</span>
          Создать доску
        </button>
      </header>
      
      <div class="boards-page__filters">
        <button
          v-for="filter in filters"
          :key="filter.value"
          class="boards-page__filter"
          :class="{ 'boards-page__filter--active': activeFilter === filter.value }"
          @click="activeFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>
      
      <div v-if="isLoading" class="boards-page__loading">
        <div class="boards-page__spinner"></div>
        <p>Загрузка досок...</p>
      </div>
      
      <div v-else-if="error" class="boards-page__error">
        <p>{{ error }}</p>
        <button @click="loadBoards">Попробовать снова</button>
      </div>
      
      <div v-else-if="!filteredBoards.length" class="boards-page__empty">
        <div class="boards-page__empty-icon">📋</div>
        <h2>Досок пока нет</h2>
        <p>Создайте первую доску для организации изображений</p>
        <button class="boards-page__create-btn" @click="openCreateModal">Создать доску</button>
      </div>
      
      <div v-else class="boards-page__grid">
        <BoardCard
          v-for="board in filteredBoards"
          :key="board.id"
          :board="board"
          @click="navigateToBoard"
          @edit="openEditModal"
          @delete="openDeleteModal"
        />
      </div>
    </div>
    
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="isFormModalOpen" class="boards-page__modal" @click.self="closeFormModal">
          <div class="boards-page__modal-content">
            <button class="boards-page__modal-close" @click="closeFormModal">✕</button>
            <BoardForm
              :board="editingBoard"
              :is-submitting="isSubmitting"
              @submit="handleFormSubmit"
              @cancel="closeFormModal"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
    
    <CommonConfirmModal
      :is-open="isDeleteModalOpen"
      title="Удалить доску?"
      :message="`Вы уверены, что хотите удалить доску '${deletingBoard?.title}'?`"
      confirm-text="Удалить"
      type="danger"
      :is-loading="isDeleting"
      @confirm="handleDelete"
      @cancel="closeDeleteModal"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBoards } from '~/composables/useBoards'
import type { Board, CreateBoardDto, UpdateBoardDto } from '~/types/board'

const router = useRouter()
const { boards, isLoading, error, totalBoards, loadBoards, createBoard, updateBoard, deleteBoard } = useBoards()

const filters = [
  { label: 'Все', value: 'all' },
  { label: 'Публичные', value: 'public' },
  { label: 'Приватные', value: 'private' }
]

const activeFilter = ref('all')

const filteredBoards = computed(() => {
  switch (activeFilter.value) {
    case 'public': return boards.value.filter((b: Board) => !b.isPrivate)
    case 'private': return boards.value.filter((b: Board) => b.isPrivate)
    default: return boards.value
  }
})

const isFormModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const editingBoard = ref<Board | null>(null)
const deletingBoard = ref<Board | null>(null)
const isSubmitting = ref(false)
const isDeleting = ref(false)

const openCreateModal = () => {
  editingBoard.value = null
  isFormModalOpen.value = true
}

const openEditModal = (board: Board) => {
  editingBoard.value = board
  isFormModalOpen.value = true
}

const closeFormModal = () => {
  isFormModalOpen.value = false
  editingBoard.value = null
}

const openDeleteModal = (board: Board) => {
  deletingBoard.value = board
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  deletingBoard.value = null
}

const handleFormSubmit = async (data: CreateBoardDto | UpdateBoardDto) => {
  isSubmitting.value = true
  try {
    if (editingBoard.value) {
      await updateBoard(editingBoard.value.id, data)
    } else {
      await createBoard(data as CreateBoardDto)
    }
    closeFormModal()
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async () => {
  if (!deletingBoard.value) return
  isDeleting.value = true
  try {
    await deleteBoard(deletingBoard.value.id)
    closeDeleteModal()
  } finally {
    isDeleting.value = false
  }
}

const navigateToBoard = (board: Board) => {
  router.push(`/boards/${board.id}`)
}

onMounted(() => loadBoards())
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.boards-page
  min-height: 100vh
  background: var(--bg-primary)
  padding: 32px 0
  
  &__container
    max-width: $breakpoint-desktop
    margin: 0 auto
    padding: 0 24px
    @include mobile
      padding: 0 16px
  
  &__header
    display: flex
    justify-content: space-between
    align-items: center
    margin-bottom: 24px
    @include mobile
      flex-direction: column
      align-items: flex-start
      gap: 16px
  
  &__title-row
    display: flex
    align-items: baseline
    gap: 12px
  
  &__title
    font-size: 32px
    font-weight: 700
    color: var(--text-primary)
    @include mobile
      font-size: 28px
  
  &__count
    font-size: 16px
    color: var(--text-muted)
  
  &__create-btn
    display: flex
    align-items: center
    gap: 8px
    padding: 12px 24px
    background: var(--accent-color)
    color: var(--text-inverse)
    border: none
    border-radius: $radius
    font-size: 16px
    font-weight: 600
    cursor: pointer
    transition: all $transition-fast
    &:hover
      background: var(--accent-hover)
      transform: translateY(-2px)
  
  &__create-icon
    font-size: 20px
  
  &__filters
    display: flex
    gap: 8px
    margin-bottom: 32px
    @include mobile
      overflow-x: auto
      padding-bottom: 8px
  
  &__filter
    padding: 8px 16px
    background: var(--card-bg)
    border: 2px solid var(--border-color)
    border-radius: $radius-full
    font-size: 14px
    font-weight: 500
    color: var(--text-secondary)
    cursor: pointer
    transition: all $transition-fast
    white-space: nowrap
    &:hover
      border-color: var(--accent-color)
      color: var(--accent-color)
    &--active
      background: var(--accent-color)
      border-color: var(--accent-color)
      color: var(--text-inverse)
  
  &__loading, &__error, &__empty
    text-align: center
    padding: 64px 24px
  
  &__spinner
    width: 48px
    height: 48px
    border: 3px solid var(--border-color)
    border-top-color: var(--accent-color)
    border-radius: 50%
    margin: 0 auto 16px
    animation: spin 1s linear infinite
  
  &__error
    p
      color: var(--error-color)
      margin-bottom: 16px
    button
      padding: 12px 24px
      background: var(--accent-color)
      color: var(--text-inverse)
      border: none
      border-radius: $radius
      cursor: pointer
  
  &__empty
    &-icon
      font-size: 64px
      margin-bottom: 16px
    h2
      font-size: 24px
      color: var(--text-primary)
      margin-bottom: 8px
    p
      color: var(--text-muted)
      margin-bottom: 24px
  
  &__grid
    display: grid
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))
    gap: 24px
    @include mobile
      grid-template-columns: 1fr
  
  &__modal
    position: fixed
    inset: 0
    background: var(--modal-overlay)
    display: flex
    align-items: center
    justify-content: center
    z-index: $z-index-modal
    padding: 16px
    
    &-content
      position: relative
      background: var(--modal-bg)
      border-radius: $radius-lg
      padding: 32px
      max-width: 500px
      width: 100%
      max-height: 90vh
      overflow-y: auto
    
    &-close
      position: absolute
      top: 16px
      right: 16px
      width: 32px
      height: 32px
      border: none
      background: var(--bg-tertiary)
      border-radius: 50%
      font-size: 18px
      cursor: pointer
      color: var(--text-primary)
      transition: all $transition-fast
      &:hover
        background: var(--bg-hover)

.modal-enter-active, .modal-leave-active
  transition: all 0.3s ease

.modal-enter-from, .modal-leave-to
  opacity: 0
  .boards-page__modal-content
    transform: scale(0.9)

@keyframes spin
  to
    transform: rotate(360deg)
</style>
