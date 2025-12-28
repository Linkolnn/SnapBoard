# Этап 8: Детальный просмотр изображений (Image Detail View) SnapBoard

## 🎯 Цель этапа
Реализовать модальное окно для детального просмотра изображений с возможностью редактирования метаданных, управления тегами и выполнения действий (удаление, скачивание).

---

## 📋 Чеклист этапа
- [ ] Обновление типов для детального просмотра
- [ ] Компонент модального окна просмотра (ImageModal)
- [ ] Компонент информации об изображении (ImageInfo)
- [ ] Компонент редактирования метаданных (ImageEditForm)
- [ ] Компонент системы тегов (TagInput)
- [ ] Компонент действий (ImageActions)
- [ ] Интеграция с Masonry Grid
- [ ] Навигация между изображениями (prev/next)
- [ ] Keyboard shortcuts (стрелки, Escape)

---

## 🗂️ Структура данных

### Обновлённые интерфейсы

### Файл: `types/image.ts` (дополнение)

```typescript
/**
 * Интерфейс изображения (расширенный)
 */
export interface Image {
  id: string
  url: string
  title?: string
  description?: string
  boardId: string
  userId: string
  tags?: string[]
  width?: number
  height?: number
  size?: number
  mimeType?: string
  createdAt: string
  updatedAt?: string
}

/**
 * DTO для обновления изображения
 */
export interface UpdateImageDto {
  title?: string
  description?: string
  tags?: string[]
}

/**
 * Контекст просмотра изображения
 */
export interface ImageViewContext {
  currentIndex: number
  totalImages: number
  hasNext: boolean
  hasPrev: boolean
}
```

---

## 1️⃣ Composable для работы с модальным просмотром

### Файл: `composables/useImageModal.ts`

```typescript
import { ref, computed } from 'vue'
import type { Image, ImageViewContext } from '~/types/image'

/**
 * Composable для управления модальным окном просмотра изображений
 */
export const useImageModal = () => {
  const isOpen = ref(false)
  const currentImage = ref<Image | null>(null)
  const imageList = ref<Image[]>([])
  const currentIndex = ref(-1)

  /**
   * Контекст просмотра
   */
  const viewContext = computed<ImageViewContext>(() => ({
    currentIndex: currentIndex.value,
    totalImages: imageList.value.length,
    hasNext: currentIndex.value < imageList.value.length - 1,
    hasPrev: currentIndex.value > 0
  }))

  /**
   * Открыть модалку с изображением
   */
  const openModal = (image: Image, images: Image[] = []) => {
    currentImage.value = image
    imageList.value = images
    currentIndex.value = images.findIndex(img => img.id === image.id)
    isOpen.value = true
    
    // Блокируем скролл
    document.body.style.overflow = 'hidden'
  }

  /**
   * Закрыть модалку
   */
  const closeModal = () => {
    isOpen.value = false
    currentImage.value = null
    currentIndex.value = -1
    
    // Восстанавливаем скролл
    document.body.style.overflow = ''
  }

  /**
   * Перейти к следующему изображению
   */
  const nextImage = () => {
    if (!viewContext.value.hasNext) return
    
    currentIndex.value++
    currentImage.value = imageList.value[currentIndex.value]
  }

  /**
   * Перейти к предыдущему изображению
   */
  const prevImage = () => {
    if (!viewContext.value.hasPrev) return
    
    currentIndex.value--
    currentImage.value = imageList.value[currentIndex.value]
  }

  /**
   * Обновить текущее изображение в списке
   */
  const updateCurrentImage = (updatedImage: Image) => {
    currentImage.value = updatedImage
    
    if (currentIndex.value !== -1) {
      imageList.value[currentIndex.value] = updatedImage
    }
  }

  /**
   * Удалить текущее изображение из списка
   */
  const removeCurrentImage = () => {
    if (currentIndex.value === -1) return
    
    imageList.value.splice(currentIndex.value, 1)
    
    // Переходим к следующему или предыдущему
    if (imageList.value.length === 0) {
      closeModal()
    } else if (currentIndex.value >= imageList.value.length) {
      currentIndex.value = imageList.value.length - 1
      currentImage.value = imageList.value[currentIndex.value]
    } else {
      currentImage.value = imageList.value[currentIndex.value]
    }
  }

  return {
    isOpen,
    currentImage,
    viewContext,
    openModal,
    closeModal,
    nextImage,
    prevImage,
    updateCurrentImage,
    removeCurrentImage
  }
}
```

---

## 2️⃣ Компонент ввода тегов

### Файл: `components/image/TagInput.vue`

```vue
<template>
  <div class="tag-input">
    <label v-if="label" class="tag-input__label">{{ label }}</label>
    
    <!-- Список тегов -->
    <div class="tag-input__tags">
      <span 
        v-for="(tag, index) in modelValue" 
        :key="index"
        class="tag-input__tag"
      >
        {{ tag }}
        <button
          v-if="!disabled"
          type="button"
          class="tag-input__tag-remove"
          @click="removeTag(index)"
        >
          ✕
        </button>
      </span>
      
      <!-- Поле ввода нового тега -->
      <input
        v-if="!disabled && modelValue.length < maxTags"
        v-model="newTag"
        type="text"
        class="tag-input__input"
        :placeholder="placeholder"
        @keydown.enter.prevent="addTag"
        @keydown.comma.prevent="addTag"
        @keydown.backspace="handleBackspace"
      />
    </div>
    
    <!-- Подсказка -->
    <p v-if="hint && !disabled" class="tag-input__hint">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: string[]
  label?: string
  placeholder?: string
  hint?: string
  maxTags?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Добавить тег...',
  hint: 'Нажмите Enter или запятую для добавления',
  maxTags: 10,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [tags: string[]]
}>()

const newTag = ref('')

/**
 * Добавить тег
 */
const addTag = () => {
  const tag = newTag.value.trim().toLowerCase()
  
  if (!tag) return
  if (props.modelValue.includes(tag)) {
    newTag.value = ''
    return
  }
  if (props.modelValue.length >= props.maxTags) return
  
  emit('update:modelValue', [...props.modelValue, tag])
  newTag.value = ''
}

/**
 * Удалить тег
 */
const removeTag = (index: number) => {
  const newTags = [...props.modelValue]
  newTags.splice(index, 1)
  emit('update:modelValue', newTags)
}

/**
 * Обработка Backspace - удаление последнего тега
 */
const handleBackspace = () => {
  if (newTag.value === '' && props.modelValue.length > 0) {
    removeTag(props.modelValue.length - 1)
  }
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.tag-input
  &__label
    display: block
    font-size: 14px
    font-weight: 500
    color: $text-light
    margin-bottom: 8px

  &__tags
    display: flex
    flex-wrap: wrap
    gap: 8px
    padding: 8px 12px
    background: white
    border: 2px solid $gray-200
    border-radius: $radius
    min-height: 48px
    align-items: center
    transition: border-color $transition-fast

    &:focus-within
      border-color: $primary-color

  &__tag
    display: inline-flex
    align-items: center
    gap: 4px
    padding: 4px 8px
    background: $primary-color
    color: white
    border-radius: $radius-sm
    font-size: 13px
    font-weight: 500

    &-remove
      display: flex
      align-items: center
      justify-content: center
      width: 16px
      height: 16px
      background: rgba(white, 0.2)
      border: none
      border-radius: 50%
      color: white
      font-size: 10px
      cursor: pointer
      transition: background $transition-fast

      &:hover
        background: rgba(white, 0.4)

  &__input
    flex: 1
    min-width: 120px
    padding: 4px 0
    border: none
    background: transparent
    font-size: 14px
    color: $text-light

    &:focus
      outline: none

    &::placeholder
      color: $gray-400

  &__hint
    margin-top: 6px
    font-size: 12px
    color: $gray-400
</style>
```

---

## 3️⃣ Компонент формы редактирования изображения

### Файл: `components/image/EditForm.vue`

```vue
<template>
  <form class="image-edit-form" @submit.prevent="handleSubmit">
    <h3 class="image-edit-form__title">Редактировать изображение</h3>
    
    <!-- Название -->
    <div class="image-edit-form__field">
      <label for="image-title" class="image-edit-form__label">
        Название
      </label>
      <input
        id="image-title"
        v-model="form.title"
        type="text"
        class="image-edit-form__input"
        placeholder="Введите название..."
        :disabled="isSubmitting"
      />
    </div>
    
    <!-- Описание -->
    <div class="image-edit-form__field">
      <label for="image-description" class="image-edit-form__label">
        Описание
      </label>
      <textarea
        id="image-description"
        v-model="form.description"
        class="image-edit-form__textarea"
        placeholder="Добавьте описание..."
        rows="3"
        :disabled="isSubmitting"
      ></textarea>
    </div>
    
    <!-- Теги -->
    <div class="image-edit-form__field">
      <ImageTagInput
        v-model="form.tags"
        label="Теги"
        :disabled="isSubmitting"
      />
    </div>
    
    <!-- Кнопки -->
    <div class="image-edit-form__actions">
      <button
        type="button"
        class="image-edit-form__btn image-edit-form__btn--secondary"
        :disabled="isSubmitting"
        @click="handleCancel"
      >
        Отмена
      </button>
      <button
        type="submit"
        class="image-edit-form__btn image-edit-form__btn--primary"
        :disabled="isSubmitting"
      >
        <span v-if="isSubmitting" class="image-edit-form__spinner"></span>
        {{ isSubmitting ? 'Сохранение...' : 'Сохранить' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { Image, UpdateImageDto } from '~/types/image'

interface Props {
  image: Image
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false
})

const emit = defineEmits<{
  submit: [data: UpdateImageDto]
  cancel: []
}>()

const form = reactive<UpdateImageDto>({
  title: props.image.title || '',
  description: props.image.description || '',
  tags: [...(props.image.tags || [])]
})

// Синхронизация при изменении изображения
watch(() => props.image, (newImage) => {
  form.title = newImage.title || ''
  form.description = newImage.description || ''
  form.tags = [...(newImage.tags || [])]
}, { deep: true })

const handleSubmit = () => {
  emit('submit', { ...form })
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.image-edit-form
  &__title
    font-size: 18px
    font-weight: 600
    color: $text-light
    margin-bottom: 20px

  &__field
    margin-bottom: 16px

  &__label
    display: block
    font-size: 14px
    font-weight: 500
    color: $text-light
    margin-bottom: 8px

  &__input,
  &__textarea
    width: 100%
    padding: 12px 16px
    font-size: 14px
    border: 2px solid $gray-200
    border-radius: $radius
    background: white
    transition: border-color $transition-fast

    &:focus
      outline: none
      border-color: $primary-color

    &::placeholder
      color: $gray-400

    &:disabled
      background: $gray-100
      cursor: not-allowed

  &__textarea
    resize: vertical
    min-height: 80px

  &__actions
    display: flex
    gap: 12px
    margin-top: 24px

  &__btn
    flex: 1
    padding: 12px 24px
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

    &--primary
      background: $primary-color
      color: white

      &:hover:not(:disabled)
        background: darken($primary-color, 8%)

      &:disabled
        opacity: 0.5
        cursor: not-allowed

    &--secondary
      background: $gray-100
      color: $text-light

      &:hover:not(:disabled)
        background: $gray-200

      &:disabled
        opacity: 0.5
        cursor: not-allowed

  &__spinner
    width: 16px
    height: 16px
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

## 4️⃣ Компонент информации об изображении

### Файл: `components/image/Info.vue`

```vue
<template>
  <div class="image-info">
    <!-- Название -->
    <h2 class="image-info__title">
      {{ image.title || 'Без названия' }}
    </h2>
    
    <!-- Описание -->
    <p v-if="image.description" class="image-info__description">
      {{ image.description }}
    </p>
    <p v-else class="image-info__description image-info__description--empty">
      Описание не добавлено
    </p>
    
    <!-- Теги -->
    <div v-if="image.tags?.length" class="image-info__tags">
      <span 
        v-for="tag in image.tags" 
        :key="tag"
        class="image-info__tag"
      >
        #{{ tag }}
      </span>
    </div>
    
    <!-- Метаданные -->
    <div class="image-info__meta">
      <div v-if="image.size" class="image-info__meta-item">
        <span class="image-info__meta-label">Размер:</span>
        <span class="image-info__meta-value">{{ formatFileSize(image.size) }}</span>
      </div>
      
      <div v-if="image.width && image.height" class="image-info__meta-item">
        <span class="image-info__meta-label">Разрешение:</span>
        <span class="image-info__meta-value">{{ image.width }} × {{ image.height }}</span>
      </div>
      
      <div class="image-info__meta-item">
        <span class="image-info__meta-label">Добавлено:</span>
        <span class="image-info__meta-value">{{ formatDate(image.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Image } from '~/types/image'
import { formatFileSize } from '~/utils/fileHelpers'

interface Props {
  image: Image
}

defineProps<Props>()

/**
 * Форматирование даты
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.image-info
  &__title
    font-size: 20px
    font-weight: 700
    color: $text-light
    margin-bottom: 12px
    word-break: break-word

  &__description
    font-size: 15px
    color: $gray-600
    line-height: 1.6
    margin-bottom: 16px

    &--empty
      color: $gray-400
      font-style: italic

  &__tags
    display: flex
    flex-wrap: wrap
    gap: 8px
    margin-bottom: 20px

  &__tag
    padding: 4px 12px
    background: rgba($primary-color, 0.1)
    color: $primary-color
    border-radius: $radius-full
    font-size: 13px
    font-weight: 500

  &__meta
    padding-top: 16px
    border-top: 1px solid $gray-200

  &__meta-item
    display: flex
    justify-content: space-between
    padding: 8px 0
    font-size: 14px

    &:not(:last-child)
      border-bottom: 1px solid $gray-100

  &__meta-label
    color: $gray-500

  &__meta-value
    color: $text-light
    font-weight: 500
</style>
```

---

## 5️⃣ Компонент действий с изображением

### Файл: `components/image/Actions.vue`

```vue
<template>
  <div class="image-actions">
    <button
      class="image-actions__btn"
      title="Редактировать"
      @click="$emit('edit')"
    >
      ✏️ Редактировать
    </button>
    
    <button
      class="image-actions__btn"
      title="Скачать"
      @click="handleDownload"
    >
      📥 Скачать
    </button>
    
    <button
      class="image-actions__btn"
      title="Открыть в новой вкладке"
      @click="handleOpenInNewTab"
    >
      🔗 Открыть
    </button>
    
    <button
      class="image-actions__btn image-actions__btn--danger"
      title="Удалить"
      @click="$emit('delete')"
    >
      🗑️ Удалить
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Image } from '~/types/image'

interface Props {
  image: Image
}

const props = defineProps<Props>()

defineEmits<{
  edit: []
  delete: []
}>()

/**
 * Скачать изображение
 */
const handleDownload = async () => {
  try {
    const response = await fetch(props.image.url)
    const blob = await response.blob()
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = props.image.title || `image-${props.image.id}`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download failed:', error)
    // Fallback - открыть в новой вкладке
    window.open(props.image.url, '_blank')
  }
}

/**
 * Открыть в новой вкладке
 */
const handleOpenInNewTab = () => {
  window.open(props.image.url, '_blank')
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.image-actions
  display: flex
  flex-direction: column
  gap: 8px

  &__btn
    display: flex
    align-items: center
    gap: 8px
    width: 100%
    padding: 12px 16px
    background: $gray-100
    border: none
    border-radius: $radius
    font-size: 14px
    font-weight: 500
    color: $text-light
    cursor: pointer
    transition: all $transition-fast
    text-align: left

    &:hover
      background: $gray-200

    &--danger
      color: $error-color

      &:hover
        background: rgba($error-color, 0.1)
</style>
```

---


## 6️⃣ Главный компонент модального окна просмотра

### Файл: `components/image/Modal.vue`

```vue
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen" 
        class="image-modal"
        @click.self="handleClose"
        @keydown.escape="handleClose"
        @keydown.left="handlePrev"
        @keydown.right="handleNext"
      >
        <!-- Кнопка закрытия -->
        <button 
          class="image-modal__close"
          @click="handleClose"
        >
          ✕
        </button>

        <!-- Навигация: предыдущее -->
        <button
          v-if="viewContext.hasPrev"
          class="image-modal__nav image-modal__nav--prev"
          @click="handlePrev"
        >
          ‹
        </button>

        <!-- Навигация: следующее -->
        <button
          v-if="viewContext.hasNext"
          class="image-modal__nav image-modal__nav--next"
          @click="handleNext"
        >
          ›
        </button>

        <!-- Контент -->
        <div class="image-modal__content">
          <!-- Изображение -->
          <div class="image-modal__image-container">
            <img
              :src="image.url"
              :alt="image.title || 'Image'"
              class="image-modal__image"
              @load="handleImageLoad"
            />
            
            <!-- Счётчик -->
            <div 
              v-if="viewContext.totalImages > 1" 
              class="image-modal__counter"
            >
              {{ viewContext.currentIndex + 1 }} / {{ viewContext.totalImages }}
            </div>
          </div>

          <!-- Сайдбар -->
          <aside class="image-modal__sidebar">
            <!-- Режим просмотра -->
            <template v-if="!isEditing">
              <ImageInfo :image="image" />
              
              <div class="image-modal__divider"></div>
              
              <ImageActions
                :image="image"
                @edit="startEditing"
                @delete="handleDelete"
              />
            </template>

            <!-- Режим редактирования -->
            <template v-else>
              <ImageEditForm
                :image="image"
                :is-submitting="isSubmitting"
                @submit="handleEditSubmit"
                @cancel="cancelEditing"
              />
            </template>
          </aside>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Модалка подтверждения удаления -->
  <ConfirmModal
    :is-open="isDeleteModalOpen"
    title="Удалить изображение?"
    message="Это действие нельзя отменить. Изображение будет удалено навсегда."
    confirm-text="Удалить"
    :is-danger="true"
    :is-loading="isDeleting"
    @confirm="confirmDelete"
    @cancel="cancelDelete"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Image, UpdateImageDto, ImageViewContext } from '~/types/image'
import { useImages } from '~/composables/useImages'

interface Props {
  isOpen: boolean
  image: Image
  viewContext: ImageViewContext
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  next: []
  prev: []
  update: [image: Image]
  delete: [id: string]
}>()

const { updateImage, deleteImage } = useImages()

// Состояния
const isEditing = ref(false)
const isSubmitting = ref(false)
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)

/**
 * Закрыть модалку
 */
const handleClose = () => {
  if (isEditing.value) {
    cancelEditing()
  }
  emit('close')
}

/**
 * Следующее изображение
 */
const handleNext = () => {
  if (props.viewContext.hasNext) {
    emit('next')
  }
}

/**
 * Предыдущее изображение
 */
const handlePrev = () => {
  if (props.viewContext.hasPrev) {
    emit('prev')
  }
}

/**
 * Обработка загрузки изображения
 */
const handleImageLoad = () => {
  // Можно добавить логику после загрузки
}

/**
 * Начать редактирование
 */
const startEditing = () => {
  isEditing.value = true
}

/**
 * Отменить редактирование
 */
const cancelEditing = () => {
  isEditing.value = false
}

/**
 * Сохранить изменения
 */
const handleEditSubmit = async (data: UpdateImageDto) => {
  isSubmitting.value = true
  
  try {
    const updated = await updateImage(props.image.id, data)
    
    if (updated) {
      emit('update', updated)
      cancelEditing()
    }
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Открыть модалку удаления
 */
const handleDelete = () => {
  isDeleteModalOpen.value = true
}

/**
 * Подтвердить удаление
 */
const confirmDelete = async () => {
  isDeleting.value = true
  
  try {
    const success = await deleteImage(props.image.id)
    
    if (success) {
      isDeleteModalOpen.value = false
      emit('delete', props.image.id)
    }
  } finally {
    isDeleting.value = false
  }
}

/**
 * Отменить удаление
 */
const cancelDelete = () => {
  isDeleteModalOpen.value = false
}

/**
 * Обработка клавиатуры
 */
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

// Подписка на события клавиатуры
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.image-modal
  position: fixed
  inset: 0
  background: rgba(0, 0, 0, 0.9)
  display: flex
  align-items: center
  justify-content: center
  z-index: $z-index-modal
  padding: 24px

  &__close
    position: absolute
    top: 16px
    right: 16px
    width: 48px
    height: 48px
    background: rgba(white, 0.1)
    border: none
    border-radius: 50%
    color: white
    font-size: 24px
    cursor: pointer
    transition: all $transition-fast
    z-index: 10

    &:hover
      background: rgba(white, 0.2)

  &__nav
    position: absolute
    top: 50%
    transform: translateY(-50%)
    width: 56px
    height: 56px
    background: rgba(white, 0.1)
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
      background: rgba(white, 0.2)

    &--prev
      left: 16px

    &--next
      right: 16px

  &__content
    display: flex
    max-width: 1400px
    width: 100%
    max-height: 90vh
    background: white
    border-radius: $radius-lg
    overflow: hidden

    @media (max-width: 900px)
      flex-direction: column
      max-height: 95vh

  &__image-container
    flex: 1
    position: relative
    display: flex
    align-items: center
    justify-content: center
    background: $gray-900
    min-height: 400px

    @media (max-width: 900px)
      min-height: 300px
      max-height: 50vh

  &__image
    max-width: 100%
    max-height: 100%
    object-fit: contain

  &__counter
    position: absolute
    bottom: 16px
    left: 50%
    transform: translateX(-50%)
    padding: 8px 16px
    background: rgba(0, 0, 0, 0.7)
    color: white
    border-radius: $radius-full
    font-size: 14px
    font-weight: 500

  &__sidebar
    width: 360px
    padding: 24px
    overflow-y: auto
    flex-shrink: 0

    @media (max-width: 900px)
      width: 100%
      max-height: 45vh

  &__divider
    height: 1px
    background: $gray-200
    margin: 20px 0

// Анимации
.modal-enter-active,
.modal-leave-active
  transition: all 0.3s ease

.modal-enter-from,
.modal-leave-to
  opacity: 0

  .image-modal__content
    transform: scale(0.95)
</style>
```

---

## 7️⃣ Интеграция с Masonry Grid

### Обновление `components/image/MasonryGrid.vue`

Добавляем emit для клика по изображению:

```vue
<template>
  <div class="masonry-grid" ref="containerRef">
    <!-- Skeleton loader -->
    <template v-if="isLoading && !images.length">
      <div 
        v-for="n in skeletonCount" 
        :key="`skeleton-${n}`"
        class="masonry-grid__skeleton"
        :style="{ height: getRandomHeight() + 'px' }"
      ></div>
    </template>

    <!-- Изображения -->
    <template v-else>
      <article
        v-for="image in images"
        :key="image.id"
        class="masonry-grid__item"
        @click="$emit('image-click', image)"
      >
        <img
          :src="image.url"
          :alt="image.title || 'Image'"
          class="masonry-grid__image"
          loading="lazy"
        />
        
        <!-- Оверлей с информацией -->
        <div class="masonry-grid__overlay">
          <h3 v-if="image.title" class="masonry-grid__title">
            {{ image.title }}
          </h3>
          <div v-if="image.tags?.length" class="masonry-grid__tags">
            <span 
              v-for="tag in image.tags.slice(0, 3)" 
              :key="tag"
              class="masonry-grid__tag"
            >
              #{{ tag }}
            </span>
          </div>
        </div>
      </article>
    </template>

    <!-- Пустое состояние -->
    <div v-if="!isLoading && !images.length" class="masonry-grid__empty">
      <slot name="empty">
        <p>Изображений нет</p>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Image } from '~/types/image'

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

defineEmits<{
  'image-click': [image: Image]
}>()

const containerRef = ref<HTMLElement | null>(null)
const skeletonCount = 8

/**
 * Случайная высота для skeleton
 */
const getRandomHeight = () => {
  return Math.floor(Math.random() * (400 - 200) + 200)
}

// CSS Grid с masonry-подобным эффектом через columns
onMounted(() => {
  if (containerRef.value) {
    containerRef.value.style.columnWidth = `${props.minColumnWidth}px`
    containerRef.value.style.columnGap = `${props.gap}px`
  }
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.masonry-grid
  column-width: 250px
  column-gap: 16px

  &__item
    break-inside: avoid
    margin-bottom: 16px
    border-radius: $radius
    overflow: hidden
    position: relative
    cursor: pointer
    transition: transform $transition-fast

    &:hover
      transform: translateY(-4px)

      .masonry-grid__overlay
        opacity: 1

  &__image
    width: 100%
    height: auto
    display: block

  &__overlay
    position: absolute
    inset: 0
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 50%)
    display: flex
    flex-direction: column
    justify-content: flex-end
    padding: 16px
    opacity: 0
    transition: opacity $transition-fast

  &__title
    color: white
    font-size: 16px
    font-weight: 600
    margin-bottom: 8px

  &__tags
    display: flex
    flex-wrap: wrap
    gap: 6px

  &__tag
    padding: 2px 8px
    background: rgba(white, 0.2)
    color: white
    border-radius: $radius-sm
    font-size: 12px

  &__skeleton
    break-inside: avoid
    margin-bottom: 16px
    background: linear-gradient(90deg, $gray-200 25%, $gray-100 50%, $gray-200 75%)
    background-size: 200% 100%
    animation: shimmer 1.5s infinite
    border-radius: $radius

  &__empty
    text-align: center
    padding: 48px
    color: $gray-400
    grid-column: 1 / -1

@keyframes shimmer
  0%
    background-position: 200% 0
  100%
    background-position: -200% 0
</style>
```

---

## 8️⃣ Интеграция с страницей доски

### Обновление `pages/boards/[id].vue`

Добавляем модальное окно просмотра изображений:

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
              <span>{{ boardImages.length }} изображений</span>
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
              class="board-page__action-btn board-page__action-btn--primary"
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
    
    <!-- Модальное окно редактирования доски -->
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

    <!-- Модальное окно загрузки изображений -->
    <UploadModal
      :is-open="isUploadModalOpen"
      :board-id="boardId"
      @close="closeUploadModal"
      @uploaded="handleImagesUploaded"
    />

    <!-- Модальное окно просмотра изображения -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useBoards } from '~/composables/useBoards'
import { useImages } from '~/composables/useImages'
import type { Image, ImageViewContext } from '~/types/image'
import type { UpdateBoardDto } from '~/types/board'

const route = useRoute()

// Boards composable
const {
  currentBoard,
  isLoading,
  error,
  loadBoard,
  updateBoard,
  clearCurrentBoard
} = useBoards()

// Images composable
const {
  images,
  loadBoardImages,
  getBoardImages
} = useImages()

// ID доски из URL
const boardId = computed(() => route.params.id as string)

// Изображения доски
const boardImages = computed(() => getBoardImages(boardId.value))
const isLoadingImages = ref(false)

// Модальные окна
const isEditModalOpen = ref(false)
const isUploadModalOpen = ref(false)
const isImageModalOpen = ref(false)
const isSubmitting = ref(false)

// Просмотр изображения
const selectedImage = ref<Image | null>(null)
const selectedImageIndex = ref(-1)

/**
 * Контекст просмотра изображения
 */
const imageViewContext = computed<ImageViewContext>(() => ({
  currentIndex: selectedImageIndex.value,
  totalImages: boardImages.value.length,
  hasNext: selectedImageIndex.value < boardImages.value.length - 1,
  hasPrev: selectedImageIndex.value > 0
}))

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
const loadImages = async () => {
  isLoadingImages.value = true
  try {
    await loadBoardImages(boardId.value)
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
 * Открыть модалку загрузки
 */
const openUploadModal = () => {
  isUploadModalOpen.value = true
}

/**
 * Закрыть модалку загрузки
 */
const closeUploadModal = () => {
  isUploadModalOpen.value = false
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
 * Обработка успешной загрузки изображений
 */
const handleImagesUploaded = () => {
  console.log('Images uploaded successfully')
}

/**
 * Клик по изображению - открыть модалку просмотра
 */
const handleImageClick = (image: Image) => {
  selectedImage.value = image
  selectedImageIndex.value = boardImages.value.findIndex(img => img.id === image.id)
  isImageModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

/**
 * Закрыть модалку просмотра
 */
const closeImageModal = () => {
  isImageModalOpen.value = false
  selectedImage.value = null
  selectedImageIndex.value = -1
  document.body.style.overflow = ''
}

/**
 * Следующее изображение
 */
const nextImage = () => {
  if (imageViewContext.value.hasNext) {
    selectedImageIndex.value++
    selectedImage.value = boardImages.value[selectedImageIndex.value]
  }
}

/**
 * Предыдущее изображение
 */
const prevImage = () => {
  if (imageViewContext.value.hasPrev) {
    selectedImageIndex.value--
    selectedImage.value = boardImages.value[selectedImageIndex.value]
  }
}

/**
 * Обновление изображения
 */
const handleImageUpdate = (updatedImage: Image) => {
  selectedImage.value = updatedImage
}

/**
 * Удаление изображения
 */
const handleImageDelete = (id: string) => {
  // Переходим к следующему или закрываем
  if (boardImages.value.length <= 1) {
    closeImageModal()
  } else if (selectedImageIndex.value >= boardImages.value.length - 1) {
    selectedImageIndex.value--
    selectedImage.value = boardImages.value[selectedImageIndex.value]
  } else {
    selectedImage.value = boardImages.value[selectedImageIndex.value]
  }
}

// Загрузка при монтировании
onMounted(async () => {
  await loadBoard(boardId.value)
  
  if (currentBoard.value) {
    await loadImages()
  }
})

// Очистка при размонтировании
onUnmounted(() => {
  clearCurrentBoard()
  document.body.style.overflow = ''
})

// Следим за изменением ID в URL
watch(boardId, async (newId) => {
  if (newId) {
    await loadBoard(newId)
    if (currentBoard.value) {
      await loadImages()
    }
  }
})
</script>

<!-- Стили остаются без изменений из stage-07 -->
```

---

## 9️⃣ Структура файлов этапа

```
frontend/
├── components/
│   └── image/
│       ├── Modal.vue         # Модальное окно просмотра
│       ├── Info.vue          # Информация об изображении
│       ├── EditForm.vue      # Форма редактирования
│       ├── Actions.vue       # Кнопки действий
│       ├── TagInput.vue      # Компонент ввода тегов
│       └── MasonryGrid.vue   # Обновлённая сетка (с emit)
├── composables/
│   └── useImageModal.ts      # Composable для модалки (опционально)
├── types/
│   └── image.ts              # Обновлённые типы
└── pages/
    └── boards/
        └── [id].vue          # Обновлённая страница доски
```

---

## ✅ Чеклист выполнения

### Типы и интерфейсы
- [ ] Интерфейс `ImageViewContext`
- [ ] Обновлённый `UpdateImageDto`

### Компоненты
- [ ] `ImageModal` - модальное окно просмотра
- [ ] `ImageInfo` - информация об изображении
- [ ] `ImageEditForm` - форма редактирования
- [ ] `ImageActions` - кнопки действий
- [ ] `ImageTagInput` - ввод тегов
- [ ] Обновлённый `MasonryGrid` с emit

### Функционал
- [ ] Открытие модалки по клику на изображение
- [ ] Просмотр полноразмерного изображения
- [ ] Отображение метаданных (название, описание, теги, размер, дата)
- [ ] Редактирование названия и описания
- [ ] Управление тегами (добавление/удаление)
- [ ] Навигация между изображениями (prev/next)
- [ ] Keyboard shortcuts (←, →, Escape)
- [ ] Скачивание изображения
- [ ] Открытие в новой вкладке
- [ ] Удаление изображения с подтверждением
- [ ] Счётчик изображений (1/10)

---

## 🎯 Результат этапа

После выполнения этого этапа у вас будет:

1. **Модальный просмотр** - полноэкранный просмотр изображений
2. **Информационная панель** - название, описание, теги, метаданные
3. **Редактирование** - изменение названия, описания и тегов
4. **Система тегов** - добавление и удаление тегов
5. **Навигация** - переключение между изображениями
6. **Keyboard shortcuts** - управление с клавиатуры
7. **Действия** - скачивание, открытие, удаление
8. **Адаптивность** - корректное отображение на мобильных

---

## 🔜 Следующий этап

**Этап 9: Поиск и фильтрация**
- Компонент поиска
- Фильтры по категориям/тегам
- Сортировка результатов
- Debounce для поиска
- История поиска

Готов к следующему этапу! 🚀
