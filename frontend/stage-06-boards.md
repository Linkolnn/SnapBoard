# Этап 6: Работа с досками (Boards) SnapBoard

## 🎯 Цель этапа
Создать полноценный функционал для работы с досками: создание, редактирование, удаление, просмотр списка досок и отдельной доски с изображениями. Доски - это основная сущность для организации изображений пользователя.

---

## 📋 Чеклист этапа
- [ ] Обновление типов и интерфейсов для досок
- [ ] Pinia Store для управления досками
- [ ] Компонент карточки доски (BoardCard)
- [ ] Компонент формы создания/редактирования доски (BoardForm)
- [ ] Модальное окно подтверждения удаления (ConfirmModal)
- [ ] Страница списка досок (/boards)
- [ ] Страница отдельной доски (/boards/[id])
- [ ] Composable для работы с досками

---

## 🗂️ Структура данных

### Обновлённые интерфейсы

### Файл: `types/board.ts`

```typescript
/**
 * Интерфейс доски
 */
export interface Board {
  id: string
  title: string
  description?: string
  coverImage?: string      // URL обложки доски
  userId: string
  isPrivate: boolean       // приватная или публичная
  imageCount: number       // количество изображений
  createdAt: string
  updatedAt: string
}

/**
 * DTO для создания доски
 */
export interface CreateBoardDto {
  title: string
  description?: string
  isPrivate?: boolean
}

/**
 * DTO для обновления доски
 */
export interface UpdateBoardDto {
  title?: string
  description?: string
  isPrivate?: boolean
  coverImage?: string
}
```

---

## 1️⃣ Pinia Store для досок

### Файл: `store/boards.ts`

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Board, CreateBoardDto, UpdateBoardDto } from '~/types/board'

export const useBoardsStore = defineStore('boards', () => {
  // State
  const boards = ref<Board[]>([])
  const currentBoard = ref<Board | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const userBoards = computed(() => boards.value)
  
  const publicBoards = computed(() => 
    boards.value.filter(board => !board.isPrivate)
  )
  
  const privateBoards = computed(() => 
    boards.value.filter(board => board.isPrivate)
  )
  
  const boardById = computed(() => (id: string) => 
    boards.value.find(board => board.id === id)
  )
  
  const totalBoards = computed(() => boards.value.length)

  // Actions
  
  /**
   * Загрузка всех досок пользователя
   */
  const fetchBoards = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      // TODO: Заменить на реальный API вызов
      // const response = await $fetch<Board[]>('/api/boards')
      // boards.value = response
      
      // Mock данные для разработки
      await new Promise(resolve => setTimeout(resolve, 500))
      boards.value = getMockBoards()
    } catch (e) {
      error.value = 'Не удалось загрузить доски'
      console.error('Error fetching boards:', e)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Загрузка одной доски по ID
   */
  const fetchBoardById = async (id: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      // TODO: Заменить на реальный API вызов
      // const response = await $fetch<Board>(`/api/boards/${id}`)
      // currentBoard.value = response
      
      await new Promise(resolve => setTimeout(resolve, 300))
      const board = boards.value.find(b => b.id === id)
      
      if (!board) {
        throw new Error('Доска не найдена')
      }
      
      currentBoard.value = board
      return board
    } catch (e) {
      error.value = 'Не удалось загрузить доску'
      console.error('Error fetching board:', e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Создание новой доски
   */
  const createBoard = async (data: CreateBoardDto): Promise<Board | null> => {
    isLoading.value = true
    error.value = null
    
    try {
      // TODO: Заменить на реальный API вызов
      // const response = await $fetch<Board>('/api/boards', {
      //   method: 'POST',
      //   body: data
      // })
      
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const newBoard: Board = {
        id: `board-${Date.now()}`,
        title: data.title,
        description: data.description,
        userId: 'current-user',
        isPrivate: data.isPrivate ?? false,
        imageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      boards.value.unshift(newBoard)
      return newBoard
    } catch (e) {
      error.value = 'Не удалось создать доску'
      console.error('Error creating board:', e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Обновление доски
   */
  const updateBoard = async (id: string, data: UpdateBoardDto): Promise<Board | null> => {
    isLoading.value = true
    error.value = null
    
    try {
      // TODO: Заменить на реальный API вызов
      // const response = await $fetch<Board>(`/api/boards/${id}`, {
      //   method: 'PATCH',
      //   body: data
      // })
      
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const index = boards.value.findIndex(b => b.id === id)
      if (index === -1) {
        throw new Error('Доска не найдена')
      }
      
      const updatedBoard: Board = {
        ...boards.value[index],
        ...data,
        updatedAt: new Date().toISOString()
      }
      
      boards.value[index] = updatedBoard
      
      if (currentBoard.value?.id === id) {
        currentBoard.value = updatedBoard
      }
      
      return updatedBoard
    } catch (e) {
      error.value = 'Не удалось обновить доску'
      console.error('Error updating board:', e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Удаление доски
   */
  const deleteBoard = async (id: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null
    
    try {
      // TODO: Заменить на реальный API вызов
      // await $fetch(`/api/boards/${id}`, { method: 'DELETE' })
      
      await new Promise(resolve => setTimeout(resolve, 300))
      
      boards.value = boards.value.filter(b => b.id !== id)
      
      if (currentBoard.value?.id === id) {
        currentBoard.value = null
      }
      
      return true
    } catch (e) {
      error.value = 'Не удалось удалить доску'
      console.error('Error deleting board:', e)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Очистка текущей доски
   */
  const clearCurrentBoard = () => {
    currentBoard.value = null
  }

  /**
   * Очистка ошибки
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    boards,
    currentBoard,
    isLoading,
    error,
    
    // Getters
    userBoards,
    publicBoards,
    privateBoards,
    boardById,
    totalBoards,
    
    // Actions
    fetchBoards,
    fetchBoardById,
    createBoard,
    updateBoard,
    deleteBoard,
    clearCurrentBoard,
    clearError
  }
})

/**
 * Mock данные для разработки
 */
function getMockBoards(): Board[] {
  return [
    {
      id: 'board-1',
      title: 'Вдохновение для дизайна',
      description: 'Коллекция идей для UI/UX проектов',
      coverImage: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300',
      userId: 'current-user',
      isPrivate: false,
      imageCount: 24,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T15:30:00Z'
    },
    {
      id: 'board-2',
      title: 'Путешествия 2024',
      description: 'Места, которые хочу посетить',
      coverImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300',
      userId: 'current-user',
      isPrivate: false,
      imageCount: 18,
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-18T12:00:00Z'
    },
    {
      id: 'board-3',
      title: 'Рецепты',
      description: 'Вкусные блюда для приготовления',
      coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300',
      userId: 'current-user',
      isPrivate: true,
      imageCount: 12,
      createdAt: '2024-01-05T14:00:00Z',
      updatedAt: '2024-01-16T09:00:00Z'
    },
    {
      id: 'board-4',
      title: 'Архитектура',
      description: 'Интересные здания и сооружения',
      coverImage: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300',
      userId: 'current-user',
      isPrivate: false,
      imageCount: 31,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-19T16:00:00Z'
    }
  ]
}
```

---

## 2️⃣ Composable для работы с досками

### Файл: `composables/useBoards.ts`

```typescript
import { storeToRefs } from 'pinia'
import { useBoardsStore } from '~/store/boards'
import type { CreateBoardDto, UpdateBoardDto } from '~/types/board'

/**
 * Composable для работы с досками
 * Предоставляет удобный интерфейс для компонентов
 */
export const useBoards = () => {
  const store = useBoardsStore()
  
  const {
    boards,
    currentBoard,
    isLoading,
    error,
    userBoards,
    publicBoards,
    privateBoards,
    totalBoards
  } = storeToRefs(store)

  /**
   * Загрузка всех досок
   */
  const loadBoards = async () => {
    await store.fetchBoards()
  }

  /**
   * Загрузка доски по ID
   */
  const loadBoard = async (id: string) => {
    return await store.fetchBoardById(id)
  }

  /**
   * Создание новой доски
   */
  const createBoard = async (data: CreateBoardDto) => {
    return await store.createBoard(data)
  }

  /**
   * Обновление доски
   */
  const updateBoard = async (id: string, data: UpdateBoardDto) => {
    return await store.updateBoard(id, data)
  }

  /**
   * Удаление доски
   */
  const deleteBoard = async (id: string) => {
    return await store.deleteBoard(id)
  }

  /**
   * Получение доски по ID из кэша
   */
  const getBoardById = (id: string) => {
    return store.boardById(id)
  }

  /**
   * Очистка текущей доски
   */
  const clearCurrentBoard = () => {
    store.clearCurrentBoard()
  }

  /**
   * Очистка ошибки
   */
  const clearError = () => {
    store.clearError()
  }

  return {
    // State
    boards,
    currentBoard,
    isLoading,
    error,
    
    // Computed
    userBoards,
    publicBoards,
    privateBoards,
    totalBoards,
    
    // Methods
    loadBoards,
    loadBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    getBoardById,
    clearCurrentBoard,
    clearError
  }
}
```

---


## 3️⃣ Компонент карточки доски (BoardCard)

### Файл: `components/board/Card.vue`

```vue
<template>
  <article 
    class="board-card"
    @click="handleClick"
  >
    <!-- Обложка доски -->
    <div class="board-card__cover">
      <img
        v-if="board.coverImage"
        :src="board.coverImage"
        :alt="board.title"
        class="board-card__img"
        loading="lazy"
      />
      <div v-else class="board-card__placeholder">
        <span class="board-card__placeholder-icon">📋</span>
      </div>
      
      <!-- Бейдж приватности -->
      <span 
        v-if="board.isPrivate" 
        class="board-card__badge"
      >
        🔒 Приватная
      </span>
    </div>
    
    <!-- Информация о доске -->
    <div class="board-card__content">
      <h3 class="board-card__title">{{ board.title }}</h3>
      
      <p 
        v-if="board.description" 
        class="board-card__desc"
      >
        {{ board.description }}
      </p>
      
      <div class="board-card__meta">
        <span class="board-card__count">
          {{ board.imageCount }} {{ pluralize(board.imageCount, 'изображение', 'изображения', 'изображений') }}
        </span>
        <span class="board-card__date">
          {{ formatDate(board.updatedAt) }}
        </span>
      </div>
    </div>
    
    <!-- Действия -->
    <div class="board-card__actions" @click.stop>
      <button 
        class="board-card__action"
        title="Редактировать"
        @click="handleEdit"
      >
        ✏️
      </button>
      <button 
        class="board-card__action board-card__action--danger"
        title="Удалить"
        @click="handleDelete"
      >
        🗑️
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Board } from '~/types/board'

interface Props {
  board: Board
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [board: Board]
  edit: [board: Board]
  delete: [board: Board]
}>()

/**
 * Склонение слов
 */
const pluralize = (count: number, one: string, few: string, many: string): string => {
  const mod10 = count % 10
  const mod100 = count % 100
  
  if (mod100 >= 11 && mod100 <= 19) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}

/**
 * Форматирование даты
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
}

const handleClick = () => emit('click', props.board)
const handleEdit = () => emit('edit', props.board)
const handleDelete = () => emit('delete', props.board)
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.board-card
  position: relative
  background: white
  border-radius: $radius-lg
  overflow: hidden
  cursor: pointer
  transition: all $transition-normal
  box-shadow: $shadow-sm
  
  &:hover
    transform: translateY(-4px)
    box-shadow: $shadow-lg
    
    .board-card__actions
      opacity: 1
  
  &__cover
    position: relative
    width: 100%
    height: 180px
    background: $gray-100
    overflow: hidden
  
  &__img
    width: 100%
    height: 100%
    object-fit: cover
    transition: transform $transition-normal
    
    .board-card:hover &
      transform: scale(1.05)
  
  &__placeholder
    width: 100%
    height: 100%
    display: flex
    align-items: center
    justify-content: center
    background: linear-gradient(135deg, $gray-100, $gray-200)
    
    &-icon
      font-size: 48px
      opacity: 0.5
  
  &__badge
    position: absolute
    top: 12px
    left: 12px
    padding: 4px 8px
    background: rgba(0, 0, 0, 0.7)
    color: white
    font-size: 12px
    border-radius: $radius-sm
  
  &__content
    padding: 16px
  
  &__title
    font-size: 18px
    font-weight: 600
    color: $text-light
    margin-bottom: 8px
    display: -webkit-box
    -webkit-line-clamp: 1
    -webkit-box-orient: vertical
    overflow: hidden
  
  &__desc
    font-size: 14px
    color: $gray-500
    margin-bottom: 12px
    display: -webkit-box
    -webkit-line-clamp: 2
    -webkit-box-orient: vertical
    overflow: hidden
  
  &__meta
    display: flex
    justify-content: space-between
    align-items: center
    font-size: 13px
    color: $gray-400
  
  &__actions
    position: absolute
    top: 12px
    right: 12px
    display: flex
    gap: 8px
    opacity: 0
    transition: opacity $transition-normal
  
  &__action
    width: 36px
    height: 36px
    border: none
    border-radius: 50%
    background: white
    cursor: pointer
    display: flex
    align-items: center
    justify-content: center
    font-size: 16px
    transition: all $transition-fast
    box-shadow: $shadow-sm
    
    &:hover
      transform: scale(1.1)
    
    &--danger:hover
      background: $error
</style>
```

---


## 4️⃣ Компонент формы создания/редактирования доски

### Файл: `components/board/Form.vue`

```vue
<template>
  <form class="board-form" @submit.prevent="handleSubmit">
    <h2 class="board-form__title">
      {{ isEditing ? 'Редактировать доску' : 'Создать доску' }}
    </h2>
    
    <!-- Название -->
    <div class="board-form__field">
      <label for="title" class="board-form__label">
        Название <span class="board-form__required">*</span>
      </label>
      <input
        id="title"
        v-model="form.title"
        type="text"
        class="board-form__input"
        :class="{ 'board-form__input--error': errors.title }"
        placeholder="Введите название доски"
        maxlength="100"
      />
      <span v-if="errors.title" class="board-form__error">
        {{ errors.title }}
      </span>
    </div>
    
    <!-- Описание -->
    <div class="board-form__field">
      <label for="description" class="board-form__label">
        Описание
      </label>
      <textarea
        id="description"
        v-model="form.description"
        class="board-form__textarea"
        placeholder="Добавьте описание (необязательно)"
        rows="3"
        maxlength="500"
      />
      <span class="board-form__hint">
        {{ form.description?.length || 0 }}/500
      </span>
    </div>
    
    <!-- Приватность -->
    <div class="board-form__field">
      <label class="board-form__checkbox">
        <input
          v-model="form.isPrivate"
          type="checkbox"
          class="board-form__checkbox-input"
        />
        <span class="board-form__checkbox-mark"></span>
        <span class="board-form__checkbox-text">
          🔒 Сделать доску приватной
        </span>
      </label>
      <p class="board-form__hint">
        Приватные доски видны только вам
      </p>
    </div>
    
    <!-- Кнопки -->
    <div class="board-form__actions">
      <button
        type="button"
        class="board-form__btn board-form__btn--secondary"
        @click="handleCancel"
      >
        Отмена
      </button>
      <button
        type="submit"
        class="board-form__btn board-form__btn--primary"
        :disabled="isSubmitting"
      >
        <span v-if="isSubmitting" class="board-form__spinner"></span>
        {{ isEditing ? 'Сохранить' : 'Создать' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { Board, CreateBoardDto, UpdateBoardDto } from '~/types/board'

interface Props {
  board?: Board | null
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  board: null,
  isSubmitting: false
})

const emit = defineEmits<{
  submit: [data: CreateBoardDto | UpdateBoardDto]
  cancel: []
}>()

const isEditing = computed(() => !!props.board)

const form = reactive({
  title: '',
  description: '',
  isPrivate: false
})

const errors = reactive({
  title: ''
})

/**
 * Заполнение формы при редактировании
 */
watch(() => props.board, (board) => {
  if (board) {
    form.title = board.title
    form.description = board.description || ''
    form.isPrivate = board.isPrivate
  } else {
    resetForm()
  }
}, { immediate: true })

/**
 * Валидация формы
 */
const validate = (): boolean => {
  errors.title = ''
  
  if (!form.title.trim()) {
    errors.title = 'Название обязательно'
    return false
  }
  
  if (form.title.trim().length < 2) {
    errors.title = 'Минимум 2 символа'
    return false
  }
  
  return true
}

/**
 * Отправка формы
 */
const handleSubmit = () => {
  if (!validate()) return
  
  const data: CreateBoardDto | UpdateBoardDto = {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    isPrivate: form.isPrivate
  }
  
  emit('submit', data)
}

/**
 * Отмена
 */
const handleCancel = () => {
  emit('cancel')
}

/**
 * Сброс формы
 */
const resetForm = () => {
  form.title = ''
  form.description = ''
  form.isPrivate = false
  errors.title = ''
}

/**
 * Экспорт для родительского компонента
 */
defineExpose({ resetForm })
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.board-form
  width: 100%
  max-width: 480px
  
  &__title
    font-size: 24px
    font-weight: 700
    color: $text-light
    margin-bottom: 24px
  
  &__field
    margin-bottom: 20px
  
  &__label
    display: block
    font-size: 14px
    font-weight: 500
    color: $text-light
    margin-bottom: 8px
  
  &__required
    color: $error
  
  &__input,
  &__textarea
    width: 100%
    padding: 12px 16px
    font-size: 16px
    border: 2px solid $gray-200
    border-radius: $radius
    background: white
    transition: all $transition-fast
    
    &:focus
      outline: none
      border-color: $primary
      box-shadow: 0 0 0 3px rgba($primary, 0.1)
    
    &--error
      border-color: $error
      
      &:focus
        box-shadow: 0 0 0 3px rgba($error, 0.1)
    
    &::placeholder
      color: $gray-400
  
  &__textarea
    resize: vertical
    min-height: 80px
  
  &__error
    display: block
    font-size: 13px
    color: $error
    margin-top: 6px
  
  &__hint
    display: block
    font-size: 13px
    color: $gray-400
    margin-top: 6px
  
  &__checkbox
    display: flex
    align-items: center
    gap: 12px
    cursor: pointer
    
    &-input
      display: none
      
      &:checked + .board-form__checkbox-mark
        background: $primary
        border-color: $primary
        
        &::after
          opacity: 1
          transform: scale(1)
    
    &-mark
      width: 22px
      height: 22px
      border: 2px solid $gray-300
      border-radius: 6px
      position: relative
      transition: all $transition-fast
      
      &::after
        content: '✓'
        position: absolute
        top: 50%
        left: 50%
        transform: translate(-50%, -50%) scale(0)
        color: white
        font-size: 14px
        opacity: 0
        transition: all $transition-fast
    
    &-text
      font-size: 15px
      color: $text-light
  
  &__actions
    display: flex
    gap: 12px
    margin-top: 32px
  
  &__btn
    flex: 1
    padding: 14px 24px
    font-size: 16px
    font-weight: 600
    border: none
    border-radius: $radius
    cursor: pointer
    transition: all $transition-fast
    display: flex
    align-items: center
    justify-content: center
    gap: 8px
    
    &--primary
      background: $primary
      color: white
      
      &:hover:not(:disabled)
        background: darken($primary, 8%)
      
      &:disabled
        opacity: 0.6
        cursor: not-allowed
    
    &--secondary
      background: $gray-100
      color: $text-light
      
      &:hover
        background: $gray-200
  
  &__spinner
    width: 18px
    height: 18px
    border: 2px solid rgba(white, 0.3)
    border-top-color: white
    border-radius: 50%
    animation: spin 0.8s linear infinite

@keyframes spin
  to
    transform: rotate(360deg)
</style>
```

---


## 5️⃣ Модальное окно подтверждения удаления

### Файл: `components/common/ConfirmModal.vue`

```vue
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen" 
        class="confirm-modal"
        @click.self="handleCancel"
      >
        <div class="confirm-modal__content">
          <!-- Иконка -->
          <div class="confirm-modal__icon" :class="`confirm-modal__icon--${type}`">
            {{ typeIcon }}
          </div>
          
          <!-- Заголовок -->
          <h3 class="confirm-modal__title">{{ title }}</h3>
          
          <!-- Сообщение -->
          <p class="confirm-modal__message">{{ message }}</p>
          
          <!-- Кнопки -->
          <div class="confirm-modal__actions">
            <button
              class="confirm-modal__btn confirm-modal__btn--secondary"
              @click="handleCancel"
            >
              {{ cancelText }}
            </button>
            <button
              class="confirm-modal__btn"
              :class="`confirm-modal__btn--${type}`"
              :disabled="isLoading"
              @click="handleConfirm"
            >
              <span v-if="isLoading" class="confirm-modal__spinner"></span>
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  isOpen: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Подтверждение',
  message: 'Вы уверены, что хотите выполнить это действие?',
  confirmText: 'Подтвердить',
  cancelText: 'Отмена',
  type: 'danger',
  isLoading: false
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const typeIcon = computed(() => {
  switch (props.type) {
    case 'danger': return '⚠️'
    case 'warning': return '⚡'
    case 'info': return 'ℹ️'
    default: return '⚠️'
  }
})

const handleConfirm = () => {
  if (!props.isLoading) {
    emit('confirm')
  }
}

const handleCancel = () => {
  if (!props.isLoading) {
    emit('cancel')
  }
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.confirm-modal
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  background: rgba(0, 0, 0, 0.5)
  display: flex
  align-items: center
  justify-content: center
  z-index: 1000
  padding: 16px
  
  &__content
    background: white
    border-radius: $radius-lg
    padding: 32px
    max-width: 400px
    width: 100%
    text-align: center
    box-shadow: $shadow-xl
  
  &__icon
    width: 64px
    height: 64px
    border-radius: 50%
    display: flex
    align-items: center
    justify-content: center
    font-size: 32px
    margin: 0 auto 20px
    
    &--danger
      background: rgba($error, 0.1)
    
    &--warning
      background: rgba($warning, 0.1)
    
    &--info
      background: rgba($info, 0.1)
  
  &__title
    font-size: 20px
    font-weight: 700
    color: $text-light
    margin-bottom: 12px
  
  &__message
    font-size: 15px
    color: $gray-500
    margin-bottom: 28px
    line-height: 1.5
  
  &__actions
    display: flex
    gap: 12px
  
  &__btn
    flex: 1
    padding: 12px 20px
    font-size: 15px
    font-weight: 600
    border: none
    border-radius: $radius
    cursor: pointer
    transition: all $transition-fast
    display: flex
    align-items: center
    justify-content: center
    gap: 8px
    
    &--secondary
      background: $gray-100
      color: $text-light
      
      &:hover
        background: $gray-200
    
    &--danger
      background: $error
      color: white
      
      &:hover:not(:disabled)
        background: darken($error, 8%)
    
    &--warning
      background: $warning
      color: white
      
      &:hover:not(:disabled)
        background: darken($warning, 8%)
    
    &--info
      background: $info
      color: white
      
      &:hover:not(:disabled)
        background: darken($info, 8%)
    
    &:disabled
      opacity: 0.6
      cursor: not-allowed
  
  &__spinner
    width: 16px
    height: 16px
    border: 2px solid rgba(white, 0.3)
    border-top-color: white
    border-radius: 50%
    animation: spin 0.8s linear infinite

// Анимация появления
.modal-enter-active,
.modal-leave-active
  transition: all 0.3s ease

.modal-enter-from,
.modal-leave-to
  opacity: 0
  
  .confirm-modal__content
    transform: scale(0.9)

@keyframes spin
  to
    transform: rotate(360deg)
</style>
```

---


## 6️⃣ Страница списка досок

### Файл: `pages/boards/index.vue`

```vue
<template>
  <div class="boards-page">
    <div class="boards-page__container">
      <!-- Header -->
      <header class="boards-page__header">
        <div class="boards-page__title-row">
          <h1 class="boards-page__title">Мои доски</h1>
          <span class="boards-page__count">{{ totalBoards }} досок</span>
        </div>
        
        <button 
          class="boards-page__create-btn"
          @click="openCreateModal"
        >
          <span class="boards-page__create-icon">+</span>
          Создать доску
        </button>
      </header>
      
      <!-- Фильтры -->
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
      
      <!-- Загрузка -->
      <div v-if="isLoading" class="boards-page__loading">
        <div class="boards-page__spinner"></div>
        <p>Загрузка досок...</p>
      </div>
      
      <!-- Ошибка -->
      <div v-else-if="error" class="boards-page__error">
        <p>{{ error }}</p>
        <button @click="loadBoards">Попробовать снова</button>
      </div>
      
      <!-- Пустое состояние -->
      <div v-else-if="!filteredBoards.length" class="boards-page__empty">
        <div class="boards-page__empty-icon">📋</div>
        <h2>Досок пока нет</h2>
        <p>Создайте первую доску для организации изображений</p>
        <button 
          class="boards-page__create-btn"
          @click="openCreateModal"
        >
          Создать доску
        </button>
      </div>
      
      <!-- Сетка досок -->
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
    
    <!-- Модальное окно создания/редактирования -->
    <Teleport to="body">
      <Transition name="modal">
        <div 
          v-if="isFormModalOpen" 
          class="boards-page__modal"
          @click.self="closeFormModal"
        >
          <div class="boards-page__modal-content">
            <button 
              class="boards-page__modal-close"
              @click="closeFormModal"
            >
              ✕
            </button>
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
    
    <!-- Модальное окно подтверждения удаления -->
    <ConfirmModal
      :is-open="isDeleteModalOpen"
      title="Удалить доску?"
      :message="`Вы уверены, что хотите удалить доску '${deletingBoard?.title}'? Все изображения в ней будут удалены.`"
      confirm-text="Удалить"
      type="danger"
      :is-loading="isDeleting"
      @confirm="handleDelete"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBoards } from '~/composables/useBoards'
import type { Board, CreateBoardDto, UpdateBoardDto } from '~/types/board'

const router = useRouter()

const {
  boards,
  isLoading,
  error,
  totalBoards,
  loadBoards,
  createBoard,
  updateBoard,
  deleteBoard
} = useBoards()

// Фильтры
const filters = [
  { label: 'Все', value: 'all' },
  { label: 'Публичные', value: 'public' },
  { label: 'Приватные', value: 'private' }
]

const activeFilter = ref('all')

const filteredBoards = computed(() => {
  switch (activeFilter.value) {
    case 'public':
      return boards.value.filter(b => !b.isPrivate)
    case 'private':
      return boards.value.filter(b => b.isPrivate)
    default:
      return boards.value
  }
})

// Модальные окна
const isFormModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const editingBoard = ref<Board | null>(null)
const deletingBoard = ref<Board | null>(null)
const isSubmitting = ref(false)
const isDeleting = ref(false)

/**
 * Открыть модалку создания
 */
const openCreateModal = () => {
  editingBoard.value = null
  isFormModalOpen.value = true
}

/**
 * Открыть модалку редактирования
 */
const openEditModal = (board: Board) => {
  editingBoard.value = board
  isFormModalOpen.value = true
}

/**
 * Закрыть модалку формы
 */
const closeFormModal = () => {
  isFormModalOpen.value = false
  editingBoard.value = null
}

/**
 * Открыть модалку удаления
 */
const openDeleteModal = (board: Board) => {
  deletingBoard.value = board
  isDeleteModalOpen.value = true
}

/**
 * Закрыть модалку удаления
 */
const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  deletingBoard.value = null
}

/**
 * Обработка отправки формы
 */
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

/**
 * Обработка удаления
 */
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

/**
 * Переход к доске
 */
const navigateToBoard = (board: Board) => {
  router.push(`/boards/${board.id}`)
}

onMounted(() => {
  loadBoards()
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.boards-page
  min-height: 100vh
  background: $gray-50
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
    color: $text-light
    
    @include mobile
      font-size: 28px
  
  &__count
    font-size: 16px
    color: $gray-400
  
  &__create-btn
    display: flex
    align-items: center
    gap: 8px
    padding: 12px 24px
    background: $primary
    color: white
    border: none
    border-radius: $radius
    font-size: 16px
    font-weight: 600
    cursor: pointer
    transition: all $transition-fast
    
    &:hover
      background: darken($primary, 8%)
      transform: translateY(-2px)
  
  &__create-icon
    font-size: 20px
    font-weight: 400
  
  &__filters
    display: flex
    gap: 8px
    margin-bottom: 32px
    
    @include mobile
      overflow-x: auto
      padding-bottom: 8px
  
  &__filter
    padding: 8px 16px
    background: white
    border: 2px solid $gray-200
    border-radius: $radius-full
    font-size: 14px
    font-weight: 500
    color: $gray-500
    cursor: pointer
    transition: all $transition-fast
    white-space: nowrap
    
    &:hover
      border-color: $primary
      color: $primary
    
    &--active
      background: $primary
      border-color: $primary
      color: white
  
  &__loading,
  &__error,
  &__empty
    text-align: center
    padding: 64px 24px
  
  &__spinner
    width: 48px
    height: 48px
    border: 3px solid $gray-200
    border-top-color: $primary
    border-radius: 50%
    margin: 0 auto 16px
    animation: spin 1s linear infinite
  
  &__error
    p
      color: $error
      margin-bottom: 16px
    
    button
      padding: 12px 24px
      background: $primary
      color: white
      border: none
      border-radius: $radius
      cursor: pointer
  
  &__empty
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
  
  &__grid
    display: grid
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))
    gap: 24px
    
    @include mobile
      grid-template-columns: 1fr
  
  // Модальное окно
  &__modal
    position: fixed
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: rgba(0, 0, 0, 0.5)
    display: flex
    align-items: center
    justify-content: center
    z-index: 1000
    padding: 16px
    
    &-content
      position: relative
      background: white
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
      background: $gray-100
      border-radius: 50%
      font-size: 18px
      cursor: pointer
      transition: all $transition-fast
      
      &:hover
        background: $gray-200

// Анимации
.modal-enter-active,
.modal-leave-active
  transition: all 0.3s ease

.modal-enter-from,
.modal-leave-to
  opacity: 0
  
  .boards-page__modal-content
    transform: scale(0.9)

@keyframes spin
  to
    transform: rotate(360deg)
</style>
```



---


## 7️⃣ Страница отдельной доски

### Файл: `pages/boards/[id].vue`

```vue
<template>
  <div class="board-page">
    <div class="board-page__container">
      <!-- Загрузка -->
      <div v-if="isLoading" class="board-page__loading">
        <div class="board-page__spinner"></div>
        <p>Загрузка доски...</p>
      </div>
      
      <!-- Ошибка -->
      <div v-else-if="error || !currentBoard" class="board-page__error">
        <div class="board-page__error-icon">😕</div>
        <h2>Доска не найдена</h2>
        <p>{{ error || 'Возможно, она была удалена или у вас нет доступа' }}</p>
        <NuxtLink to="/boards" class="board-page__back-btn">
          ← Вернуться к доскам
        </NuxtLink>
      </div>
      
      <!-- Контент доски -->
      <template v-else>
        <!-- Header доски -->
        <header class="board-page__header">
          <NuxtLink to="/boards" class="board-page__back">
            ← Назад к доскам
          </NuxtLink>
          
          <div class="board-page__info">
            <div class="board-page__title-row">
              <h1 class="board-page__title">{{ currentBoard.title }}</h1>
              <span 
                v-if="currentBoard.isPrivate" 
                class="board-page__badge"
              >
                🔒 Приватная
              </span>
            </div>
            
            <p 
              v-if="currentBoard.description" 
              class="board-page__desc"
            >
              {{ currentBoard.description }}
            </p>
            
            <div class="board-page__meta">
              <span>{{ currentBoard.imageCount }} изображений</span>
              <span>•</span>
              <span>Обновлено {{ formatDate(currentBoard.updatedAt) }}</span>
            </div>
          </div>
          
          <div class="board-page__actions">
            <button 
              class="board-page__action-btn"
              @click="openEditModal"
            >
              ✏️ Редактировать
            </button>
            <button 
              class="board-page__action-btn board-page__action-btn--secondary"
              @click="openUploadModal"
            >
              📤 Добавить изображения
            </button>
          </div>
        </header>
        
        <!-- Галерея изображений -->
        <section class="board-page__gallery">
          <ImageMasonryGrid
            v-if="boardImages.length"
            :images="boardImages"
            :is-loading="isLoadingImages"
            :min-column-width="250"
            :gap="16"
            @image-click="handleImageClick"
          />
          
          <!-- Пустое состояние -->
          <div v-else class="board-page__empty">
            <div class="board-page__empty-icon">🖼️</div>
            <h2>Изображений пока нет</h2>
            <p>Добавьте первое изображение в эту доску</p>
            <button 
              class="board-page__upload-btn"
              @click="openUploadModal"
            >
              📤 Загрузить изображения
            </button>
          </div>
        </section>
      </template>
    </div>
    
    <!-- Модальное окно редактирования -->
    <Teleport to="body">
      <Transition name="modal">
        <div 
          v-if="isEditModalOpen" 
          class="board-page__modal"
          @click.self="closeEditModal"
        >
          <div class="board-page__modal-content">
            <button 
              class="board-page__modal-close"
              @click="closeEditModal"
            >
              ✕
            </button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBoards } from '~/composables/useBoards'
import type { Image } from '~/types'
import type { UpdateBoardDto } from '~/types/board'

const route = useRoute()
const router = useRouter()

const {
  currentBoard,
  isLoading,
  error,
  loadBoard,
  updateBoard,
  clearCurrentBoard
} = useBoards()

// ID доски из URL
const boardId = computed(() => route.params.id as string)

// Изображения доски (mock)
const boardImages = ref<Image[]>([])
const isLoadingImages = ref(false)

// Модальные окна
const isEditModalOpen = ref(false)
const isSubmitting = ref(false)

/**
 * Форматирование даты
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Загрузка изображений доски
 */
const loadBoardImages = async () => {
  isLoadingImages.value = true
  
  try {
    // TODO: Заменить на реальный API вызов
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock данные
    boardImages.value = getMockBoardImages()
  } catch (e) {
    console.error('Error loading board images:', e)
  } finally {
    isLoadingImages.value = false
  }
}

/**
 * Открыть модалку редактирования
 */
const openEditModal = () => {
  isEditModalOpen.value = true
}

/**
 * Закрыть модалку редактирования
 */
const closeEditModal = () => {
  isEditModalOpen.value = false
}

/**
 * Открыть модалку загрузки (заглушка)
 */
const openUploadModal = () => {
  // TODO: Реализовать в этапе 7
  alert('Функционал загрузки будет реализован в этапе 7')
}

/**
 * Обработка редактирования
 */
const handleEditSubmit = async (data: UpdateBoardDto) => {
  isSubmitting.value = true
  
  try {
    await updateBoard(boardId.value, data)
    closeEditModal()
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Клик по изображению
 */
const handleImageClick = (image: Image) => {
  // TODO: Открыть модалку просмотра (этап 8)
  console.log('Image clicked:', image)
}

/**
 * Mock изображения для доски
 */
function getMockBoardImages(): Image[] {
  return [
    {
      id: 'img-1',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600',
      title: 'Горный пейзаж',
      description: 'Удивительный вид на горы',
      boardId: boardId.value,
      userId: 'current-user',
      tags: ['природа', 'горы'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'img-2',
      url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300',
      title: 'Архитектура',
      boardId: boardId.value,
      userId: 'current-user',
      tags: ['архитектура'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'img-3',
      url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&h=500',
      title: 'Интерьер',
      boardId: boardId.value,
      userId: 'current-user',
      tags: ['интерьер', 'дизайн'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'img-4',
      url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400',
      title: 'Еда',
      boardId: boardId.value,
      userId: 'current-user',
      tags: ['еда'],
      createdAt: new Date().toISOString()
    }
  ]
}

// Загрузка при монтировании
onMounted(async () => {
  await loadBoard(boardId.value)
  
  if (currentBoard.value) {
    await loadBoardImages()
  }
})

// Очистка при размонтировании
onUnmounted(() => {
  clearCurrentBoard()
})

// Следим за изменением ID в URL
watch(boardId, async (newId) => {
  if (newId) {
    await loadBoard(newId)
    if (currentBoard.value) {
      await loadBoardImages()
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
  
  &__loading,
  &__error
    text-align: center
    padding: 64px 24px
  
  &__spinner
    width: 48px
    height: 48px
    border: 3px solid $gray-200
    border-top-color: $primary
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
    background: $primary
    color: white
    text-decoration: none
    border-radius: $radius
    font-weight: 600
    transition: all $transition-fast
    
    &:hover
      background: darken($primary, 8%)
  
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
      color: $primary
  
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
    background: $primary
    color: white
    border: none
    border-radius: $radius
    font-size: 14px
    font-weight: 600
    cursor: pointer
    transition: all $transition-fast
    
    &:hover
      background: darken($primary, 8%)
    
    &--secondary
      background: white
      color: $text-light
      border: 2px solid $gray-200
      
      &:hover
        border-color: $primary
        color: $primary
  
  &__gallery
    min-height: 400px
  
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
    background: $primary
    color: white
    border: none
    border-radius: $radius
    font-size: 16px
    font-weight: 600
    cursor: pointer
    transition: all $transition-fast
    
    &:hover
      background: darken($primary, 8%)
  
  // Модальное окно
  &__modal
    position: fixed
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: rgba(0, 0, 0, 0.5)
    display: flex
    align-items: center
    justify-content: center
    z-index: 1000
    padding: 16px
    
    &-content
      position: relative
      background: white
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
      background: $gray-100
      border-radius: 50%
      font-size: 18px
      cursor: pointer
      transition: all $transition-fast
      
      &:hover
        background: $gray-200

// Анимации
.modal-enter-active,
.modal-leave-active
  transition: all 0.3s ease

.modal-enter-from,
.modal-leave-to
  opacity: 0
  
  .board-page__modal-content
    transform: scale(0.9)

@keyframes spin
  to
    transform: rotate(360deg)
</style>
```


---


## 8️⃣ Общий компонент навигации (DRY)

Создаём переиспользуемый компонент навигации, который будет использоваться в `Header.vue`, `MobileMenu.vue` и `HeaderActions.vue`.

### Файл: `types/navigation.ts`

```typescript
/**
 * Интерфейс элемента навигации
 * Используется во всех компонентах навигации
 */
export interface NavItem {
  text: string
  link: string
  icon?: string        // Опциональная иконка
  requiresAuth?: boolean  // Требует авторизации
}

/**
 * Варианты отображения навигации
 */
export type NavVariant = 'horizontal' | 'vertical' | 'dropdown'
```

---

### Файл: `composables/useNavigation.ts`

```typescript
import type { NavItem } from '~/types/navigation'

/**
 * Composable для централизованного управления навигацией
 * DRY: один источник правды для всех навигационных компонентов
 */
export const useNavigation = () => {
  /**
   * Основные пункты навигации
   */
  const mainNavItems: NavItem[] = [
    { text: 'Главная', link: '/' },
    { text: 'Мои доски', link: '/boards', requiresAuth: true },
    { text: 'Избранное', link: '/favorites', requiresAuth: true },
    { text: 'Профиль', link: '/profile', requiresAuth: true }
  ]

  /**
   * Пункты меню пользователя (dropdown)
   */
  const userMenuItems: NavItem[] = [
    { text: 'Профиль', link: '/profile' },
    { text: 'Мои доски', link: '/boards' },
    { text: 'Настройки', link: '/settings' }
  ]

  /**
   * Фильтрация по авторизации
   */
  const getFilteredNavItems = (items: NavItem[], isAuthenticated: boolean): NavItem[] => {
    return items.filter(item => {
      if (item.requiresAuth && !isAuthenticated) return false
      return true
    })
  }

  return {
    mainNavItems,
    userMenuItems,
    getFilteredNavItems
  }
}
```

---

### Файл: `components/common/NavList.vue`

```vue
<template>
  <!-- 
    Универсальный компонент навигации
    Поддерживает горизонтальный, вертикальный и dropdown варианты
    Следует БЭМ и семантике
  -->
  <nav :class="navClasses" :aria-label="ariaLabel">
    <ul class="nav-list__items">
      <li 
        v-for="item in items"
        :key="item.link"
        class="nav-list__item"
      >
        <NuxtLink 
          :to="item.link"
          class="nav-list__link"
          :class="{ 'nav-list__link--active': isActive(item.link) }"
          @click="handleClick(item)"
        >
          <span v-if="item.icon" class="nav-list__icon">{{ item.icon }}</span>
          <span class="nav-list__text">{{ item.text }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { NavItem, NavVariant } from '~/types/navigation'

interface Props {
  items: NavItem[]
  variant?: NavVariant
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'horizontal',
  ariaLabel: 'Навигация'
})

const emit = defineEmits<{
  itemClick: [item: NavItem]
}>()

const route = useRoute()

/**
 * CSS классы в зависимости от варианта
 */
const navClasses = computed(() => [
  'nav-list',
  `nav-list--${props.variant}`
])

/**
 * Проверка активной ссылки
 */
const isActive = (link: string): boolean => {
  if (link === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(link)
}

/**
 * Обработчик клика по пункту
 */
const handleClick = (item: NavItem) => {
  emit('itemClick', item)
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.nav-list
  // Базовые стили
  &__items
    list-style: none
    margin: 0
    padding: 0
    display: flex
  
  &__item
    // Базовый стиль элемента
  
  &__link
    display: flex
    align-items: center
    gap: 8px
    text-decoration: none
    color: $text-light
    font-weight: 500
    transition: color $transition-fast
    
    &:hover
      color: $primary-color
    
    &--active
      color: $primary-color
  
  &__icon
    font-size: 18px
  
  &__text
    white-space: nowrap

  // === Горизонтальный вариант (Header) ===
  &--horizontal
    .nav-list__items
      flex-direction: row
      gap: 24px
    
    .nav-list__link
      padding: 8px 0
      position: relative
      
      &--active::after
        content: ''
        position: absolute
        bottom: -4px
        left: 0
        right: 0
        height: 2px
        background: $primary-color
        border-radius: 1px

  // === Вертикальный вариант (MobileMenu, Sidebar) ===
  &--vertical
    .nav-list__items
      flex-direction: column
      gap: 4px
    
    .nav-list__link
      padding: 12px 16px
      border-radius: $radius-sm
      
      &:hover
        background: rgba($primary-color, 0.1)
      
      &--active
        background: rgba($primary-color, 0.1)
        border-left: 3px solid $primary-color
        padding-left: 13px

  // === Dropdown вариант (UserMenu) ===
  &--dropdown
    .nav-list__items
      flex-direction: column
      gap: 0
    
    .nav-list__link
      padding: 12px 16px
      
      &:hover
        background: $gray-100
</style>
```

---

### Обновление `components/layout/Header.vue`

Теперь Header использует общий NavList:

```vue
<template>
  <header class="app-header">
    <div class="app-header__container">
      <!-- Логотип -->
      <NuxtLink to="/" class="app-header__logo">
        <span class="app-header__logo-text">SnapBoard</span>
      </NuxtLink>

      <!-- Основная навигация (desktop) -->
      <CommonNavList
        :items="filteredNavItems"
        variant="horizontal"
        aria-label="Основная навигация"
        class="app-header__nav"
      />

      <!-- Действия -->
      <div class="app-header__actions">
        <!-- Поиск -->
        <div class="app-header__search">
          <input 
            type="search" 
            placeholder="Поиск..."
            class="app-header__search-input"
          />
        </div>
        
        <!-- Кнопки авторизации или меню пользователя -->
        <LayoutHeaderActions />

        <!-- Бургер меню -->
        <button
          class="app-header__burger"
          @click="toggleMobileMenu"
          aria-label="Открыть меню"
          aria-expanded="isMobileMenuOpen"
        >
          <span class="app-header__burger-line"></span>
          <span class="app-header__burger-line"></span>
          <span class="app-header__burger-line"></span>
        </button>
      </div>
    </div>

    <!-- Мобильное меню -->
    <LayoutMobileMenu 
      v-model="isMobileMenuOpen" 
      :nav-items="filteredNavItems"
    />
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNavigation } from '~/composables/useNavigation'
import { useAuthStore } from '~/stores/auth'

const { mainNavItems, getFilteredNavItems } = useNavigation()
const authStore = useAuthStore()

/**
 * Фильтруем пункты навигации по авторизации
 */
const filteredNavItems = computed(() => 
  getFilteredNavItems(mainNavItems, authStore.isAuthenticated)
)

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.app-header
  position: sticky
  top: 0
  z-index: $z-index-dropdown
  background: white
  border-bottom: 1px solid $gray-200

  &__container
    max-width: $breakpoint-desktop
    margin: 0 auto
    padding: 16px 24px
    display: flex
    align-items: center
    justify-content: space-between
    gap: 24px
    
    @include mobile
      padding: 16px

  &__logo
    display: flex
    align-items: center
    text-decoration: none
    color: $text-light
    font-weight: 700
    font-size: 24px
    transition: color $transition-fast
    
    &:hover
      color: $primary-color

  &__logo-text
    white-space: nowrap

  // Скрываем навигацию на планшетах
  &__nav
    @include laptop
      display: none

  &__actions
    display: flex
    align-items: center
    gap: 16px

  &__search
    @include tablet
      display: none

  &__search-input
    width: 250px
    padding: 8px 16px
    border: 1px solid $gray-300
    border-radius: $radius-sm
    font-size: 14px
    transition: all $transition-fast
    
    &:focus
      outline: none
      border-color: $primary-color
      box-shadow: 0 0 0 3px rgba($primary-color, 0.1)
    
    &::placeholder
      color: $gray-400

  &__burger
    display: none
    flex-direction: column
    justify-content: space-between
    width: 28px
    height: 20px
    padding: 0
    background: none
    border: none
    cursor: pointer
    
    @include laptop
      display: flex

  &__burger-line
    width: 100%
    height: 3px
    background: $text-light
    border-radius: 2px
    transition: all $transition-fast
    
    .app-header__burger:hover &
      background: $primary-color
</style>
```

---

### Обновление `components/layout/HeaderActions.vue`

```vue
<template>
  <!-- 
    Действия в header: авторизация или меню пользователя
    Использует общий NavList для dropdown меню
  -->
  <div class="header-actions">
    <!-- Гость: кнопки входа/регистрации -->
    <template v-if="!authStore.isAuthenticated">
      <CommonBaseButton variant="outline" @click="navigateTo('/login')">
        Войти
      </CommonBaseButton>
      <CommonBaseButton variant="primary" @click="navigateTo('/register')">
        Регистрация
      </CommonBaseButton>
    </template>
    
    <!-- Авторизован: меню пользователя -->
    <template v-else>
      <div class="header-actions__user">
        <!-- Аватар -->
        <button 
          class="header-actions__avatar"
          @click="toggleUserMenu"
          :aria-expanded="isUserMenuOpen"
          aria-haspopup="true"
        >
          <img 
            v-if="authStore.user?.avatar" 
            :src="authStore.user.avatar" 
            :alt="authStore.user.username"
          />
          <span v-else>{{ userInitials }}</span>
        </button>
        
        <!-- Dropdown меню -->
        <Transition name="dropdown">
          <div v-if="isUserMenuOpen" class="header-actions__dropdown">
            <CommonNavList
              :items="userMenuItems"
              variant="dropdown"
              aria-label="Меню пользователя"
              @item-click="closeUserMenu"
            />
            
            <!-- Кнопка выхода отдельно -->
            <div class="header-actions__logout">
              <button @click="handleLogout">
                Выйти
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useNavigation } from '~/composables/useNavigation'

const authStore = useAuthStore()
const router = useRouter()
const { userMenuItems } = useNavigation()

const isUserMenuOpen = ref(false)

/**
 * Инициалы пользователя
 */
const userInitials = computed(() => {
  if (!authStore.user?.username) return '?'
  return authStore.user.username.charAt(0).toUpperCase()
})

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

const handleLogout = async () => {
  closeUserMenu()
  await authStore.logout()
  router.push('/login')
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.header-actions
  display: flex
  align-items: center
  gap: 8px
  
  // Скрываем кнопки на планшетах
  @include laptop
    display: none
  
  &__user
    position: relative
  
  &__avatar
    width: 40px
    height: 40px
    border-radius: 50%
    background: $primary-color
    color: white
    display: flex
    align-items: center
    justify-content: center
    font-weight: 600
    font-size: 16px
    cursor: pointer
    border: none
    transition: transform $transition-fast
    overflow: hidden
    
    &:hover
      transform: scale(1.05)
    
    img
      width: 100%
      height: 100%
      object-fit: cover
  
  &__dropdown
    position: absolute
    top: calc(100% + 8px)
    right: 0
    background: white
    border-radius: $radius-sm
    box-shadow: $shadow-lg
    min-width: 200px
    z-index: $z-index-dropdown
    overflow: hidden
  
  &__logout
    border-top: 1px solid $gray-200
    
    button
      display: block
      width: 100%
      padding: 12px 16px
      text-align: left
      color: $error
      background: none
      border: none
      font-size: 14px
      cursor: pointer
      transition: background $transition-fast
      
      &:hover
        background: rgba($error, 0.1)

// Анимация dropdown
.dropdown-enter-active,
.dropdown-leave-active
  transition: all 0.2s ease

.dropdown-enter-from,
.dropdown-leave-to
  opacity: 0
  transform: translateY(-8px)
</style>
```

---

### Обновление `components/layout/MobileMenu.vue`

```vue
<template>
  <Teleport to="body">
    <Transition name="mobile-menu">
      <div 
        v-if="modelValue" 
        class="mobile-menu-overlay"
        @click="close"
      >
        <aside class="mobile-menu" @click.stop>
          <!-- Header -->
          <header class="mobile-menu__header">
            <h2 class="mobile-menu__title">Меню</h2>
            <button 
              class="mobile-menu__close" 
              @click="close"
              aria-label="Закрыть меню"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </header>

          <!-- Поиск -->
          <div class="mobile-menu__search">
            <input 
              type="search" 
              placeholder="Поиск..."
              class="mobile-menu__search-input"
            />
          </div>

          <!-- Навигация через общий компонент -->
          <CommonNavList
            :items="navItems"
            variant="vertical"
            aria-label="Мобильная навигация"
            class="mobile-menu__nav"
            @item-click="close"
          />

          <!-- Кнопки авторизации -->
          <footer class="mobile-menu__footer">
            <template v-if="!authStore.isAuthenticated">
              <CommonBaseButton variant="outline" @click="close">
                Войти
              </CommonBaseButton>
              <CommonBaseButton variant="primary" @click="close">
                Регистрация
              </CommonBaseButton>
            </template>
            <template v-else>
              <CommonBaseButton variant="outline" @click="handleLogout">
                Выйти
              </CommonBaseButton>
            </template>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import type { NavItem } from '~/types/navigation'

interface Props {
  modelValue: boolean
  navItems: NavItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const authStore = useAuthStore()
const router = useRouter()

const close = () => {
  emit('update:modelValue', false)
}

const handleLogout = async () => {
  close()
  await authStore.logout()
  router.push('/login')
}

// Блокируем скролл при открытом меню
watch(
  () => props.modelValue,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
)
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.mobile-menu-overlay
  position: fixed
  inset: 0
  background: rgba(0, 0, 0, 0.5)
  z-index: $z-index-modal

.mobile-menu
  position: fixed
  top: 0
  right: 0
  bottom: 0
  width: 320px
  max-width: 85vw
  background: white
  box-shadow: $shadow-lg
  display: flex
  flex-direction: column
  overflow-y: auto
  
  &__header
    display: flex
    align-items: center
    justify-content: space-between
    padding: 24px
    border-bottom: 1px solid $gray-200
  
  &__title
    font-size: 20px
    font-weight: 700
    color: $text-light
  
  &__close
    width: 40px
    height: 40px
    display: flex
    align-items: center
    justify-content: center
    border-radius: 50%
    border: none
    background: none
    color: $gray-400
    cursor: pointer
    transition: all $transition-fast
    
    &:hover
      background: $gray-100
      color: $text-light
  
  &__search
    padding: 16px 24px
    border-bottom: 1px solid $gray-200
  
  &__search-input
    width: 100%
    padding: 12px
    border: 1px solid $gray-300
    border-radius: $radius-sm
    font-size: 14px
    
    &:focus
      outline: none
      border-color: $primary-color
    
    &::placeholder
      color: $gray-400
  
  &__nav
    flex: 1
    padding: 16px 8px
  
  &__footer
    padding: 24px
    border-top: 1px solid $gray-200
    display: flex
    flex-direction: column
    gap: 12px

// Анимации
.mobile-menu-enter-active,
.mobile-menu-leave-active
  transition: opacity $transition-normal

.mobile-menu-enter-from,
.mobile-menu-leave-to
  opacity: 0

.mobile-menu-enter-active .mobile-menu,
.mobile-menu-leave-active .mobile-menu
  transition: transform $transition-normal

.mobile-menu-enter-from .mobile-menu,
.mobile-menu-leave-to .mobile-menu
  transform: translateX(100%)
</style>
```


---


## 9️⃣ Структура файлов этапа

```
frontend/
├── components/
│   ├── board/
│   │   ├── Card.vue          # Карточка доски
│   │   └── Form.vue          # Форма создания/редактирования
│   ├── common/
│   │   ├── ConfirmModal.vue  # Модалка подтверждения
│   │   └── NavList.vue       # Общий компонент навигации (DRY)
│   └── layout/
│       ├── Header.vue        # Обновлённый header
│       ├── HeaderActions.vue # Действия пользователя
│       └── MobileMenu.vue    # Обновлённое мобильное меню
├── composables/
│   ├── useBoards.ts          # Composable для досок
│   └── useNavigation.ts      # Composable для навигации (DRY)
├── pages/
│   └── boards/
│       ├── index.vue         # Список досок
│       └── [id].vue          # Страница доски
├── store/
│   └── boards.ts             # Pinia store досок
└── types/
    ├── board.ts              # Типы для досок
    └── navigation.ts         # Типы для навигации
```

---


## ✅ Чеклист выполнения

### Типы и интерфейсы
- [x] Интерфейс `Board`
- [x] DTO `CreateBoardDto`
- [x] DTO `UpdateBoardDto`
- [x] Интерфейс `NavItem` (DRY)
- [x] Тип `NavVariant`

### Store и Composables
- [x] Pinia Store `useBoardsStore`
- [x] Composable `useBoards`
- [x] Composable `useNavigation` (DRY)
- [x] CRUD операции (mock)
- [x] Getters для фильтрации

### Компоненты
- [x] `BoardCard` - карточка доски
- [x] `BoardForm` - форма создания/редактирования
- [x] `ConfirmModal` - модалка подтверждения
- [x] `NavList` - общий компонент навигации (DRY)

### Layout компоненты (обновлённые)
- [x] `Header.vue` - использует NavList
- [x] `HeaderActions.vue` - использует NavList для dropdown
- [x] `MobileMenu.vue` - использует NavList

### Страницы
- [x] `/boards` - список досок
- [x] `/boards/[id]` - страница доски

### Функционал
- [x] Создание доски
- [x] Редактирование доски
- [x] Удаление доски с подтверждением
- [x] Фильтрация (все/публичные/приватные)
- [x] Навигация между страницами
- [x] Единый источник навигации (DRY)

---


## 🎯 Результат этапа

После выполнения этого этапа у вас будет:

1. **Полноценный CRUD для досок** - создание, чтение, обновление, удаление
2. **Красивые UI компоненты** - карточки, формы, модалки
3. **Фильтрация досок** - по типу приватности
4. **Страница отдельной доски** - с галереей изображений
5. **Переиспользуемые компоненты** - ConfirmModal, NavList
6. **DRY навигация** - один источник правды для всех меню
7. **Семантическая разметка** - правильные HTML теги (nav, header, aside, footer)
8. **БЭМ методология** - консистентные CSS классы

---


## 🔜 Следующий этап

**Этап 7: Загрузка изображений**
- Drag & Drop компонент
- Загрузка по URL
- Превью перед загрузкой
- Progress bar
- Множественная загрузка

Готов к следующему этапу! 🚀


---

## 🔐 Исправление аутентификации и Cookie

### Проблема
Cookie с `httpOnly: true` не доступна через JavaScript (`useCookie`), поэтому middleware не мог проверить авторизацию на клиенте.

### Решение
1. `access_token` - `httpOnly: false` (доступен клиенту для проверки)
2. `refresh_token` - `httpOnly: true` (только сервер, для безопасности)
3. Добавлен redirect на страницу из query параметра после логина

### Обновлённые файлы

#### Файл: `server/api/auth/login.post.ts`

```typescript
/**
 * Mock API endpoint для входа
 * Credentials: test@test.com / 123456
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Email и пароль обязательны'
    })
  }

  // Mock: "существующий" пользователь
  if (email === 'test@test.com' && password === '123456') {
    const config = useRuntimeConfig()
    const isProduction = config.public?.nodeEnv === 'production'

    // access_token - доступен клиенту для проверки авторизации
    setCookie(event, 'access_token', 'mock_access_token_' + Date.now(), {
      httpOnly: false, // Доступен клиенту для middleware
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 минут
      path: '/'
    })

    // refresh_token - только httpOnly для безопасности
    setCookie(event, 'refresh_token', 'mock_refresh_token_' + Date.now(), {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 дней
      path: '/'
    })

    return {
      user: {
        id: '1',
        email: email,
        username: 'testuser',
        avatar: null,
        createdAt: new Date().toISOString()
      }
    }
  }

  throw createError({
    statusCode: 401,
    message: 'Неверный email или пароль'
  })
})
```

#### Файл: `server/api/auth/logout.post.ts`

```typescript
/**
 * Mock API endpoint для выхода
 */
export default defineEventHandler((event) => {
  // Удаляем cookies с указанием path
  deleteCookie(event, 'access_token', { path: '/' })
  deleteCookie(event, 'refresh_token', { path: '/' })

  return { success: true }
})
```

#### Файл: `server/api/auth/register.post.ts`

```typescript
/**
 * Mock API endpoint для регистрации
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, email, password } = body

  if (!username || !email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Все поля обязательны'
    })
  }

  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      message: 'Пароль должен быть не менее 6 символов'
    })
  }

  // Mock: проверка на существующий email
  if (email === 'test@test.com') {
    throw createError({
      statusCode: 409,
      message: 'Пользователь с таким email уже существует'
    })
  }

  const config = useRuntimeConfig()
  const isProduction = config.public?.nodeEnv === 'production'

  // access_token - доступен клиенту
  setCookie(event, 'access_token', 'mock_access_token_' + Date.now(), {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 15,
    path: '/'
  })

  // refresh_token - только httpOnly
  setCookie(event, 'refresh_token', 'mock_refresh_token_' + Date.now(), {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  })

  return {
    user: {
      id: Date.now().toString(),
      email: email,
      username: username,
      avatar: null,
      createdAt: new Date().toISOString()
    }
  }
})
```

#### Файл: `server/api/auth/refresh.post.ts`

```typescript
/**
 * Mock API endpoint для обновления токена
 */
export default defineEventHandler((event) => {
  const refreshToken = getCookie(event, 'refresh_token')

  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      message: 'Refresh token отсутствует'
    })
  }

  const config = useRuntimeConfig()
  const isProduction = config.public?.nodeEnv === 'production'

  // Обновляем access_token
  setCookie(event, 'access_token', 'mock_access_token_' + Date.now(), {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 15,
    path: '/'
  })

  return { success: true }
})
```

#### Файл: `store/auth.ts`

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Cookie для проверки авторизации (httpOnly: false)
  const accessTokenCookie = useCookie('access_token', {
    maxAge: 60 * 15,
    sameSite: 'lax',
    path: '/'
  })

  const isAuthenticated = computed(() => {
    return !!accessTokenCookie.value
  })

  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })

      user.value = response.user
      return { success: true }
    } catch (err: any) {
      console.error('Login error:', err)
      error.value = err.data?.message || err.message || 'Ошибка при входе'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (username: string, email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/auth/register', {
        method: 'POST',
        body: { username, email, password }
      })

      user.value = response.user
      return { success: true }
    } catch (err: any) {
      console.error('Register error:', err)
      error.value = err.data?.message || err.message || 'Ошибка при регистрации'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      user.value = null
      error.value = null
      accessTokenCookie.value = null
    }
  }

  const fetchCurrentUser = async () => {
    if (!accessTokenCookie.value) return

    try {
      const response = await $fetch('/api/auth/me')
      user.value = response.user
    } catch (err) {
      console.error('Failed to fetch current user:', err)
      user.value = null
      accessTokenCookie.value = null
    }
  }

  const refreshAccessToken = async () => {
    try {
      await $fetch('/api/auth/refresh', { method: 'POST' })
      return true
    } catch (err) {
      console.error('Token refresh failed:', err)
      await logout()
      throw err
    }
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    fetchCurrentUser,
    refreshAccessToken
  }
})
```

#### Файл: `middleware/auth.global.ts`

```typescript
/**
 * Глобальный middleware для проверки аутентификации
 * Работает на клиенте и сервере
 */
export default defineNuxtRouteMiddleware((to) => {
  // Список защищённых роутов
  const protectedRoutes = ['/profile', '/boards', '/settings']

  // Список роутов только для гостей
  const guestRoutes = ['/login', '/register']

  // Проверяем наличие токена в cookie
  const accessToken = useCookie('access_token')
  const isAuthenticated = !!accessToken.value

  // Если защищённый роут и не авторизован - на login
  if (protectedRoutes.some(route => to.path.startsWith(route)) && !isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  // Если роут для гостей и авторизован - на главную
  if (guestRoutes.includes(to.path) && isAuthenticated) {
    return navigateTo('/')
  }
})
```

#### Обновление `components/auth/LoginForm.vue`

Добавлен redirect на страницу из query параметра:

```typescript
// В script setup добавить:
import { computed } from 'vue'

const route = useRoute()

const redirectUrl = computed(() => {
  const redirect = route.query.redirect as string
  return redirect || '/'
})

// В handleSubmit изменить:
if (result.success) {
  router.push(redirectUrl.value)
}
```

### Тестовые данные для входа

- **Email:** `test@test.com`
- **Пароль:** `123456`

---

## ✅ Итоги этапа 6

### Созданные файлы:
- `types/board.ts` - типы для досок
- `store/boards.ts` - Pinia store
- `composables/useBoards.ts` - composable
- `components/board/Card.vue` - карточка доски
- `components/board/Form.vue` - форма создания/редактирования
- `components/common/ConfirmModal.vue` - модальное подтверждение
- `pages/boards/index.vue` - список досок
- `pages/boards/[id].vue` - детальная страница доски

### Обновлённые файлы:
- `server/api/auth/login.post.ts` - исправлены cookie
- `server/api/auth/logout.post.ts` - исправлены cookie
- `server/api/auth/register.post.ts` - исправлены cookie
- `server/api/auth/refresh.post.ts` - исправлены cookie
- `store/auth.ts` - упрощена проверка авторизации
- `middleware/auth.global.ts` - без изменений логики
- `components/auth/LoginForm.vue` - добавлен redirect
- `assets/styles/variables.sass` - добавлены переменные

### Добавленные SASS переменные:
- `$gray-50`, `$gray-600`
- `$error`, `$success`, `$warning`, `$info` (алиасы)
- `$radius-full`
- `$shadow-xl`
