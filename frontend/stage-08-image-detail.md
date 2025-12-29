# Этап 8: Детальный просмотр изображений (Image Detail View) SnapBoard

## 🎯 Цель этапа
Реализовать модальное окно для детального просмотра изображений с возможностью редактирования метаданных, управления тегами и выполнения действий (удаление, скачивание).

---

## 📋 Чеклист этапа
- [x] Обновление типов для детального просмотра
- [x] Компонент модального окна просмотра (ImageModal)
- [x] Компонент информации об изображении (ImageInfo)
- [x] Компонент редактирования метаданных (ImageEditForm)
- [x] Компонент системы тегов (TagInput)
- [x] Компонент действий (ImageActions)
- [x] Интеграция с Masonry Grid
- [x] Навигация между изображениями (prev/next)
- [x] Keyboard shortcuts (стрелки, Escape)

---

## 🔧 Предварительная настройка

### Файл: `app.vue`

Добавьте импорт CSS reset для корректного отображения компонентов:

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
</script>

<style lang="sass">
@import '@/assets/styles/reset'
</style>
```

### Файл: `assets/styles/reset.sass`

```sass
*,
*::before,
*::after 
  box-sizing: border-box
  margin: 0
  padding: 0
  border: none

html 
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale

body 
  margin: 0
  padding: 0

img 
  max-width: 100%
  height: auto
  display: block

button 
  cursor: pointer
  border: none
  background: none
```

---

## 🗂️ Структура данных

### Файл: `types/image.ts`

```typescript
/**
 * Интерфейс изображения
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

## 1️⃣ Компонент ввода тегов

### Файл: `components/image/TagInput.vue`

```vue
<template>
  <div class="tag-input">
    <label v-if="label" class="tag-input__label">{{ label }}</label>
    
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
    
    <p v-if="hint && !disabled" class="tag-input__hint">{{ hint }}</p>
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

const removeTag = (index: number) => {
  const newTags = [...props.modelValue]
  newTags.splice(index, 1)
  emit('update:modelValue', newTags)
}

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

## 2️⃣ Компонент формы редактирования

### Файл: `components/image/EditForm.vue`

```vue
<template>
  <form class="image-edit-form" @submit.prevent="handleSubmit">
    <h3 class="image-edit-form__title">Редактировать изображение</h3>
    
    <div class="image-edit-form__field">
      <label for="image-title" class="image-edit-form__label">Название</label>
      <input
        id="image-title"
        v-model="form.title"
        type="text"
        class="image-edit-form__input"
        placeholder="Введите название..."
        :disabled="isSubmitting"
      />
    </div>
    
    <div class="image-edit-form__field">
      <label for="image-description" class="image-edit-form__label">Описание</label>
      <textarea
        id="image-description"
        v-model="form.description"
        class="image-edit-form__textarea"
        placeholder="Добавьте описание..."
        rows="3"
        :disabled="isSubmitting"
      ></textarea>
    </div>
    
    <div class="image-edit-form__field">
      <ImageTagInput
        v-model="form.tags"
        label="Теги"
        :disabled="isSubmitting"
      />
    </div>
    
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

interface FormData {
  title: string
  description: string
  tags: string[]
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false
})

const emit = defineEmits<{
  submit: [data: UpdateImageDto]
  cancel: []
}>()

const form = reactive<FormData>({
  title: props.image.title || '',
  description: props.image.description || '',
  tags: [...(props.image.tags || [])]
})

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

## 3️⃣ Компонент информации об изображении

### Файл: `components/image/Info.vue`

```vue
<template>
  <div class="image-info">
    <h2 class="image-info__title">{{ image.title || 'Без названия' }}</h2>
    
    <p v-if="image.description" class="image-info__description">{{ image.description }}</p>
    <p v-else class="image-info__description image-info__description--empty">Описание не добавлено</p>
    
    <div v-if="image.tags?.length" class="image-info__tags">
      <span v-for="tag in image.tags" :key="tag" class="image-info__tag">#{{ tag }}</span>
    </div>
    
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

## 4️⃣ Компонент действий с изображением

### Файл: `components/image/Actions.vue`

```vue
<template>
  <div class="image-actions">
    <button class="image-actions__btn" title="Редактировать" @click="$emit('edit')">
      ✏️ Редактировать
    </button>
    
    <button class="image-actions__btn" title="Скачать" @click="handleDownload">
      📥 Скачать
    </button>
    
    <button class="image-actions__btn" title="Открыть в новой вкладке" @click="handleOpenInNewTab">
      🔗 Открыть
    </button>
    
    <button class="image-actions__btn image-actions__btn--danger" title="Удалить" @click="$emit('delete')">
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
    window.open(props.image.url, '_blank')
  }
}

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

## 5️⃣ Главный компонент модального окна

### Файл: `components/image/Modal.vue`

Ключевые особенности реализации:
- Кнопка закрытия расположена внутри `__content` с primary-color стилизацией
- Кнопки навигации расположены внутри `__image-container` и центрированы вертикально
- Изображение заполняет весь контейнер (`width: 100%`, `height: 100%`, `object-fit: contain`)
- Используются SASS миксины (`@include mobile`, `@include tablet`, `@include laptop`) вместо raw media queries

```vue
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen" 
        class="image-modal"
        @click.self="handleClose"
      >
        <div class="image-modal__content">
          <!-- Кнопка закрытия внутри content -->
          <button class="image-modal__close" @click="handleClose">✕</button>

          <div class="image-modal__image-container">
            <!-- Навигация внутри image-container -->
            <button
              v-if="viewContext.hasPrev"
              class="image-modal__nav image-modal__nav--prev"
              @click="handlePrev"
            >
              ‹
            </button>

            <button
              v-if="viewContext.hasNext"
              class="image-modal__nav image-modal__nav--next"
              @click="handleNext"
            >
              ›
            </button>

            <img
              :src="image.url"
              :alt="image.title || 'Image'"
              class="image-modal__image"
            />
            
            <div v-if="viewContext.totalImages > 1" class="image-modal__counter">
              {{ viewContext.currentIndex + 1 }} / {{ viewContext.totalImages }}
            </div>
          </div>

          <aside class="image-modal__sidebar">
            <template v-if="!isEditing">
              <ImageInfo :image="image" />
              <div class="image-modal__divider"></div>
              <ImageActions
                :image="image"
                @edit="startEditing"
                @delete="handleDelete"
              />
            </template>

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

  <CommonConfirmModal
    :is-open="isDeleteModalOpen"
    title="Удалить изображение?"
    message="Это действие нельзя отменить. Изображение будет удалено навсегда."
    confirm-text="Удалить"
    type="danger"
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

const isEditing = ref(false)
const isSubmitting = ref(false)
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)

const handleClose = () => {
  if (isEditing.value) {
    cancelEditing()
  }
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

const startEditing = () => {
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
}

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

const handleDelete = () => {
  isDeleteModalOpen.value = true
}

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

const cancelDelete = () => {
  isDeleteModalOpen.value = false
}

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
})
</script>
```


### Стили Modal.vue

```sass
<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.image-modal
  position: fixed
  inset: 0
  background: rgba(0, 0, 0, 0.9)
  display: flex
  align-items: center
  justify-content: center
  z-index: $z-index-modal
  padding: 24px

  @include mobile
    padding: 0

  &__content
    position: relative
    display: flex
    max-width: 1400px
    width: 100%
    max-height: 90vh
    background: white
    border-radius: $radius-lg
    overflow: hidden

    @include tablet
      flex-direction: column
      max-height: 95vh

  // Кнопка закрытия - внутри content, primary-color стилизация
  &__close
    position: absolute
    top: 16px
    right: 16px
    width: 48px
    height: 48px
    background: $primary-color
    border: none
    border-radius: 50%
    color: white
    font-size: 20px
    cursor: pointer
    transition: all $transition-fast
    z-index: 10
    display: flex
    align-items: center
    justify-content: center

    @include mobile
      width: 36px
      height: 36px
      font-size: 22px

    &:hover
      background: darken($primary-color, 10%)
      transform: translateY(-2px)
      box-shadow: $shadow-md

    &:active
      transform: translateY(0)

    &:focus
      outline: none
      box-shadow: 0 0 0 3px rgba($primary-color, 0.3)

  &__image-container
    flex: 1
    position: relative
    display: flex
    align-items: center
    justify-content: center
    background: $secondary-color
    min-height: 400px

    @include tablet
      min-height: 330px
      max-height: 50vh

    @include mobile
      min-height: 320px
      max-height: 45vh

  // Кнопки навигации - внутри image-container, центрированы вертикально
  &__nav
    position: absolute
    top: 50%
    transform: translateY(-50%)
    width: 48px
    height: 48px
    background: rgba(white, 0.9)
    border: none
    border-radius: 50%
    color: $text-light
    font-size: 28px
    cursor: pointer
    transition: all $transition-fast
    z-index: 5
    display: flex
    align-items: center
    justify-content: center
    box-shadow: $shadow-sm

    @include mobile
      width: 36px
      height: 36px
      font-size: 22px

    &:hover
      background: white
      transform: translateY(-50%) scale(1.1)
      box-shadow: $shadow-md

    &:active
      transform: translateY(-50%) scale(1)

    &--prev
      left: 16px

    &--next
      right: 16px

  // Изображение заполняет весь контейнер
  &__image
    width: 100%
    height: 100%
    object-fit: contain

    @include tablet
      width: 69%
      height: 69%

    @include mobile
      width: 100%
      max-height: 320px

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

    @include mobile
      bottom: 8px
      padding: 6px 12px
      font-size: 12px

  &__sidebar
    width: 360px
    padding: 24px
    overflow-y: auto
    flex-shrink: 0

    @include laptop
      width: 320px
      padding: 20px

    @include tablet
      width: auto
      max-height: 45vh
      padding: 16px
      flex-shrink: 1

    @include mobile
      max-height: 50vh

  &__divider
    height: 1px
    background: $gray-200
    margin: 20px 0

    @include mobile
      margin: 16px 0

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

## 6️⃣ Структура файлов этапа

```
frontend/
├── app.vue                   # Импорт reset.sass
├── assets/
│   └── styles/
│       ├── reset.sass        # CSS reset
│       ├── variables.sass    # SASS переменные
│       └── mixins.sass       # SASS миксины (mobile, tablet, laptop)
├── components/
│   └── image/
│       ├── Modal.vue         # Модальное окно просмотра
│       ├── Info.vue          # Информация об изображении
│       ├── EditForm.vue      # Форма редактирования
│       ├── Actions.vue       # Кнопки действий
│       └── TagInput.vue      # Компонент ввода тегов
├── types/
│   └── image.ts              # Типы (Image, UpdateImageDto, ImageViewContext)
└── pages/
    └── boards/
        └── [id].vue          # Страница доски с интеграцией модалки
```

---

## 📱 Адаптивные миксины

Используйте миксины из `assets/styles/mixins.sass` вместо raw media queries:

```sass
@import '@/assets/styles/mixins'

.component
  padding: 24px
  
  @include laptop
    padding: 20px
    
  @include tablet
    padding: 16px
    
  @include mobile
    padding: 12px
```

Доступные миксины:
- `@include desktop` - max-width: 1440px
- `@include laptop` - max-width: 1024px
- `@include tablet` - max-width: 768px
- `@include mobile` - max-width: 576px

---

## ⌨️ Keyboard Shortcuts

| Клавиша | Действие |
|---------|----------|
| `Escape` | Закрыть модалку |
| `←` (ArrowLeft) | Предыдущее изображение |
| `→` (ArrowRight) | Следующее изображение |

---

## ✅ Чеклист выполнения

### Типы и интерфейсы
- [x] Интерфейс `Image`
- [x] Интерфейс `UpdateImageDto`
- [x] Интерфейс `ImageViewContext`

### Компоненты
- [x] `ImageModal` - модальное окно просмотра
- [x] `ImageInfo` - информация об изображении
- [x] `ImageEditForm` - форма редактирования
- [x] `ImageActions` - кнопки действий
- [x] `ImageTagInput` - ввод тегов

### Функционал
- [x] Открытие модалки по клику на изображение
- [x] Просмотр полноразмерного изображения
- [x] Отображение метаданных (название, описание, теги, размер, дата)
- [x] Редактирование названия и описания
- [x] Управление тегами (добавление/удаление)
- [x] Навигация между изображениями (prev/next)
- [x] Keyboard shortcuts (←, →, Escape)
- [x] Скачивание изображения
- [x] Открытие в новой вкладке
- [x] Удаление изображения с подтверждением
- [x] Счётчик изображений (1/10)

### Стилизация
- [x] Кнопка закрытия внутри `__content` с primary-color
- [x] Кнопки навигации внутри `__image-container`, центрированы вертикально
- [x] Изображение заполняет контейнер (object-fit: contain)
- [x] SASS миксины вместо raw media queries
- [x] CSS reset в app.vue

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
8. **Адаптивность** - корректное отображение на всех устройствах с использованием SASS миксинов

---

## 🔜 Следующий этап

**Этап 9: Поиск и фильтрация**
- Компонент поиска
- Фильтры по категориям/тегам
- Сортировка результатов
- Debounce для поиска
- История поиска

Готов к следующему этапу! 🚀
