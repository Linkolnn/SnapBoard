<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen" 
        class="save-modal-overlay"
        @click.self="handleClose"
      >
        <div class="save-modal">
          <header class="save-modal__header">
            <h3>Сохранить на доску</h3>
            <CommonBaseIconButton 
              variant="ghost" 
              size="sm"
              @click="handleClose"
            >
              ✕
            </CommonBaseIconButton>
          </header>

          <div class="save-modal__search">
            <CommonBaseInput
              v-model="searchQuery"
              placeholder="Поиск досок..."
              type="text"
            />
          </div>

          <div class="save-modal__content">
            <div v-if="isLoading" class="save-modal__loading">
              <CommonBaseLoader size="medium" />
            </div>

            <div v-else-if="filteredBoards.length === 0" class="save-modal__empty">
              <p v-if="searchQuery">Доски не найдены</p>
              <p v-else>У вас пока нет досок</p>
            </div>

            <div v-else class="save-modal__list">
              <button
                v-for="board in filteredBoards"
                :key="board.id"
                class="save-modal__item"
                :class="{ 'save-modal__item--saved': isSavedToBoard(board.id) }"
                @click="handleSelectBoard(board)"
              >
                <div class="save-modal__item-cover">
                  <img 
                    v-if="board.coverImage" 
                    :src="board.coverImage" 
                    :alt="board.title"
                  />
                  <span v-else class="save-modal__item-placeholder">📁</span>
                </div>
                <div class="save-modal__item-info">
                  <span class="save-modal__item-title">{{ board.title }}</span>
                  <span class="save-modal__item-count">
                    {{ board.imageCount }} {{ pluralize(board.imageCount, 'изображение', 'изображения', 'изображений') }}
                  </span>
                </div>
                <span v-if="isSavedToBoard(board.id)" class="save-modal__item-check">✓</span>
              </button>
            </div>
          </div>

          <footer class="save-modal__footer">
            <button class="save-modal__create" @click="showCreateForm = true">
              <span>➕</span>
              Создать новую доску
            </button>
          </footer>

          <!-- Форма создания доски -->
          <Transition name="slide">
            <div v-if="showCreateForm" class="save-modal__create-form">
              <header class="save-modal__create-header">
                <button class="save-modal__back" @click="showCreateForm = false">
                  ← Назад
                </button>
                <h4>Новая доска</h4>
              </header>
              
              <div class="save-modal__create-content">
                <CommonBaseInput
                  v-model="newBoardTitle"
                  label="Название"
                  placeholder="Введите название доски"
                  :error="createError"
                />
                
                <CommonBaseTextarea
                  v-model="newBoardDescription"
                  label="Описание (необязательно)"
                  placeholder="Добавьте описание"
                  :rows="3"
                />

                <label class="save-modal__checkbox">
                  <input v-model="newBoardPrivate" type="checkbox" />
                  <span>Приватная доска</span>
                </label>
              </div>

              <div class="save-modal__create-actions">
                <CommonBaseButton
                  variant="secondary"
                  @click="showCreateForm = false"
                >
                  Отмена
                </CommonBaseButton>
                <CommonBaseButton
                  :loading="isCreating"
                  :disabled="!newBoardTitle.trim()"
                  @click="handleCreateBoard"
                >
                  Создать и сохранить
                </CommonBaseButton>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBoardsStore } from '~/store/boards'
import { useToast } from '~/composables/useToast'
import type { Board } from '~/types/board'

interface Props {
  isOpen: boolean
  imageId: string | null
  savedBoardIds?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  savedBoardIds: () => []
})

const emit = defineEmits<{
  close: []
  save: [boardId: string]
  remove: [boardId: string]
}>()

const boardsStore = useBoardsStore()
const toast = useToast()

const searchQuery = ref('')
const showCreateForm = ref(false)
const newBoardTitle = ref('')
const newBoardDescription = ref('')
const newBoardPrivate = ref(false)
const isCreating = ref(false)
const createError = ref('')
const isLoading = ref(false)

const filteredBoards = computed(() => {
  if (!searchQuery.value.trim()) {
    return boardsStore.boards
  }
  const query = searchQuery.value.toLowerCase()
  return boardsStore.boards.filter(board => 
    board.title.toLowerCase().includes(query)
  )
})

const isSavedToBoard = (boardId: string): boolean => {
  return props.savedBoardIds.includes(boardId)
}

const pluralize = (count: number, one: string, few: string, many: string): string => {
  const mod10 = count % 10
  const mod100 = count % 100
  
  if (mod100 >= 11 && mod100 <= 19) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}

const handleClose = () => {
  showCreateForm.value = false
  searchQuery.value = ''
  resetCreateForm()
  emit('close')
}

const handleSelectBoard = (board: Board) => {
  if (isSavedToBoard(board.id)) {
    emit('remove', board.id)
    toast.info(`Удалено с доски "${board.title}"`)
  } else {
    emit('save', board.id)
    toast.success(`Сохранено на доску "${board.title}"`)
  }
}

const resetCreateForm = () => {
  newBoardTitle.value = ''
  newBoardDescription.value = ''
  newBoardPrivate.value = false
  createError.value = ''
}

const handleCreateBoard = async () => {
  if (!newBoardTitle.value.trim()) {
    createError.value = 'Введите название доски'
    return
  }

  isCreating.value = true
  createError.value = ''

  try {
    const board = await boardsStore.createBoard({
      title: newBoardTitle.value.trim(),
      description: newBoardDescription.value.trim() || undefined,
      isPrivate: newBoardPrivate.value
    })

    if (board) {
      emit('save', board.id)
      toast.success(`Доска "${board.title}" создана`)
      showCreateForm.value = false
      resetCreateForm()
    }
  } catch (e) {
    createError.value = 'Не удалось создать доску'
    toast.error('Ошибка при создании доски')
  } finally {
    isCreating.value = false
  }
}

// Загрузка досок при открытии
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen && boardsStore.boards.length === 0) {
    isLoading.value = true
    await boardsStore.fetchBoards()
    isLoading.value = false
  }
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.save-modal-overlay
  position: fixed
  inset: 0
  background: var(--modal-overlay)
  display: flex
  align-items: center
  justify-content: center
  z-index: $z-index-modal
  padding: 16px

.save-modal
  background: var(--modal-bg)
  border-radius: $radius-lg
  width: 100%
  max-width: 420px
  max-height: 80vh
  display: flex
  flex-direction: column
  position: relative
  overflow: hidden

  &__header
    display: flex
    align-items: center
    justify-content: space-between
    padding: 16px 20px
    border-bottom: 1px solid var(--border-color)

    h3
      font-size: 18px
      font-weight: 600
      color: var(--text-primary)
      margin: 0

  &__search
    padding: 12px 20px
    border-bottom: 1px solid var(--border-light)

  &__content
    flex: 1
    overflow-y: auto
    min-height: 200px

  &__loading,
  &__empty
    display: flex
    align-items: center
    justify-content: center
    height: 200px
    color: var(--text-muted)

  &__list
    padding: 8px

  &__item
    display: flex
    align-items: center
    gap: 12px
    width: 100%
    padding: 12px
    background: none
    border: none
    border-radius: $radius
    cursor: pointer
    text-align: left
    transition: background 0.2s

    &:hover
      background: var(--bg-hover)

    &--saved
      background: var(--accent-light)

      &:hover
        background: var(--accent-light)

  &__item-cover
    width: 48px
    height: 48px
    border-radius: $radius-sm
    overflow: hidden
    background: var(--bg-tertiary)
    flex-shrink: 0
    display: flex
    align-items: center
    justify-content: center

    img
      width: 100%
      height: 100%
      object-fit: cover

  &__item-placeholder
    font-size: 20px

  &__item-info
    flex: 1
    min-width: 0

  &__item-title
    display: block
    font-size: 15px
    font-weight: 500
    color: var(--text-primary)
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis

  &__item-count
    display: block
    font-size: 13px
    color: var(--text-muted)
    margin-top: 2px

  &__item-check
    color: var(--accent-color)
    font-weight: 700
    font-size: 16px

  &__footer
    padding: 12px 20px
    border-top: 1px solid var(--border-light)

  &__create
    display: flex
    align-items: center
    gap: 8px
    width: 100%
    padding: 12px
    background: none
    border: 2px dashed var(--border-color)
    border-radius: $radius
    color: var(--text-secondary)
    font-size: 14px
    font-weight: 500
    cursor: pointer
    transition: all 0.2s

    &:hover
      border-color: var(--accent-color)
      color: var(--accent-color)

  // Форма создания
  &__create-form
    position: absolute
    inset: 0
    background: var(--modal-bg)
    display: flex
    flex-direction: column

  &__create-header
    display: flex
    align-items: center
    gap: 12px
    padding: 16px 20px
    border-bottom: 1px solid var(--border-color)

    h4
      font-size: 18px
      font-weight: 600
      color: var(--text-primary)
      margin: 0

  &__back
    background: none
    border: none
    color: var(--text-secondary)
    font-size: 14px
    cursor: pointer
    padding: 4px 8px
    margin-left: -8px

    &:hover
      color: var(--text-primary)

  &__create-content
    flex: 1
    padding: 20px
    display: flex
    flex-direction: column
    gap: 16px
    overflow-y: auto

  &__checkbox
    display: flex
    align-items: center
    gap: 8px
    cursor: pointer
    font-size: 14px
    color: var(--text-primary)

    input
      width: 18px
      height: 18px
      cursor: pointer

  &__create-actions
    display: flex
    gap: 12px
    padding: 16px 20px
    border-top: 1px solid var(--border-light)

    button
      flex: 1

// Анимации
.modal-enter-active,
.modal-leave-active
  transition: opacity 0.2s ease

  .save-modal
    transition: transform 0.2s ease

.modal-enter-from,
.modal-leave-to
  opacity: 0

  .save-modal
    transform: scale(0.95)

.slide-enter-active,
.slide-leave-active
  transition: transform 0.2s ease

.slide-enter-from
  transform: translateX(100%)

.slide-leave-to
  transform: translateX(100%)
</style>
