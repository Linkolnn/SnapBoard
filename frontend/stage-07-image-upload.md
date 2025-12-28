# Этап 7: Загрузка изображений (Image Upload) SnapBoard

## 🎯 Цель этапа
Реализовать полноценный функционал загрузки изображений: Drag & Drop, загрузка по URL, превью перед загрузкой, progress bar, множественная загрузка и обработка ошибок.

---

## 📋 Чеклист этапа
- [ ] Обновление типов и интерфейсов для загрузки
- [ ] Pinia Store для управления изображениями
- [ ] Composable для работы с изображениями
- [ ] Компонент Drag & Drop зоны (DropZone)
- [ ] Компонент загрузки по URL (UrlUpload)
- [ ] Компонент превью изображения (ImagePreview)
- [ ] Компонент Progress Bar (UploadProgress)
- [ ] Модальное окно загрузки (UploadModal)
- [ ] Интеграция с страницей доски

---

## 🗂️ Структура данных

### Обновлённые интерфейсы

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
  size?: number          // размер в байтах
  mimeType?: string
  createdAt: string
}

/**
 * DTO для создания изображения
 */
export interface CreateImageDto {
  boardId: string
  title?: string
  description?: string
  tags?: string[]
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
 * Статус загрузки файла
 */
export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error'

/**
 * Элемент очереди загрузки
 */
export interface UploadQueueItem {
  id: string
  file?: File              // для загрузки файла
  url?: string             // для загрузки по URL
  previewUrl: string       // превью для отображения
  name: string
  size: number
  status: UploadStatus
  progress: number         // 0-100
  error?: string
  boardId: string
  title?: string
  description?: string
  tags?: string[]
}

/**
 * Результат валидации файла
 */
export interface FileValidationResult {
  valid: boolean
  error?: string
}

/**
 * Настройки загрузки
 */
export interface UploadConfig {
  maxFileSize: number      // в байтах
  maxFiles: number
  allowedTypes: string[]
  allowedExtensions: string[]
}
```

---

## 1️⃣ Утилиты для работы с файлами

### Файл: `utils/fileHelpers.ts`

```typescript
import type { FileValidationResult, UploadConfig } from '~/types/image'

/**
 * Конфигурация загрузки по умолчанию
 */
export const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
}

/**
 * Валидация файла
 */
export const validateFile = (
  file: File, 
  config: UploadConfig = DEFAULT_UPLOAD_CONFIG
): FileValidationResult => {
  // Проверка типа
  if (!config.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Неподдерживаемый формат. Разрешены: ${config.allowedExtensions.join(', ')}`
    }
  }

  // Проверка размера
  if (file.size > config.maxFileSize) {
    const maxSizeMB = config.maxFileSize / (1024 * 1024)
    return {
      valid: false,
      error: `Файл слишком большой. Максимум: ${maxSizeMB}MB`
    }
  }

  return { valid: true }
}

/**
 * Валидация URL изображения
 */
export const validateImageUrl = (url: string): FileValidationResult => {
  // Проверка формата URL
  try {
    new URL(url)
  } catch {
    return { valid: false, error: 'Некорректный URL' }
  }

  // Проверка расширения
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  const hasValidExtension = extensions.some(ext => 
    url.toLowerCase().includes(ext)
  )

  if (!hasValidExtension) {
    return { 
      valid: false, 
      error: 'URL должен вести на изображение (jpg, png, gif, webp)' 
    }
  }

  return { valid: true }
}

/**
 * Форматирование размера файла
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Создание превью из File
 */
export const createFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Получение размеров изображения
 */
export const getImageDimensions = (
  src: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => resolve({ width: img.width, height: img.height })
    img.onerror = reject
    img.src = src
  })
}

/**
 * Генерация уникального ID
 */
export const generateUploadId = (): string => {
  return `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
```

---

## 2️⃣ Pinia Store для изображений

### Файл: `store/images.ts`

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Image, 
  CreateImageDto, 
  UpdateImageDto,
  UploadQueueItem,
  UploadStatus 
} from '~/types/image'
import { 
  generateUploadId, 
  createFilePreview,
  validateFile,
  validateImageUrl,
  DEFAULT_UPLOAD_CONFIG 
} from '~/utils/fileHelpers'

export const useImagesStore = defineStore('images', () => {
  // State
  const images = ref<Image[]>([])
  const uploadQueue = ref<UploadQueueItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const imagesByBoard = computed(() => (boardId: string) =>
    images.value.filter(img => img.boardId === boardId)
  )

  const pendingUploads = computed(() =>
    uploadQueue.value.filter(item => item.status === 'pending')
  )

  const uploadingItems = computed(() =>
    uploadQueue.value.filter(item => item.status === 'uploading')
  )

  const hasActiveUploads = computed(() =>
    uploadQueue.value.some(item => 
      item.status === 'pending' || item.status === 'uploading'
    )
  )

  const totalUploadProgress = computed(() => {
    if (!uploadQueue.value.length) return 0
    const total = uploadQueue.value.reduce((sum, item) => sum + item.progress, 0)
    return Math.round(total / uploadQueue.value.length)
  })

  // Actions

  /**
   * Загрузка изображений доски
   */
  const fetchBoardImages = async (boardId: string) => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Заменить на реальный API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock данные
      images.value = getMockImages(boardId)
    } catch (e) {
      error.value = 'Не удалось загрузить изображения'
      console.error('Error fetching images:', e)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Добавление файлов в очередь загрузки
   */
  const addFilesToQueue = async (files: File[], boardId: string) => {
    const validFiles: UploadQueueItem[] = []

    for (const file of files) {
      // Проверка лимита
      if (uploadQueue.value.length >= DEFAULT_UPLOAD_CONFIG.maxFiles) {
        error.value = `Максимум ${DEFAULT_UPLOAD_CONFIG.maxFiles} файлов`
        break
      }

      // Валидация
      const validation = validateFile(file)
      if (!validation.valid) {
        console.warn(`File ${file.name} rejected:`, validation.error)
        continue
      }

      // Создание превью
      const previewUrl = await createFilePreview(file)

      validFiles.push({
        id: generateUploadId(),
        file,
        previewUrl,
        name: file.name,
        size: file.size,
        status: 'pending',
        progress: 0,
        boardId
      })
    }

    uploadQueue.value.push(...validFiles)
    return validFiles
  }

  /**
   * Добавление URL в очередь загрузки
   */
  const addUrlToQueue = (url: string, boardId: string): UploadQueueItem | null => {
    // Валидация
    const validation = validateImageUrl(url)
    if (!validation.valid) {
      error.value = validation.error || 'Некорректный URL'
      return null
    }

    const item: UploadQueueItem = {
      id: generateUploadId(),
      url,
      previewUrl: url,
      name: url.split('/').pop() || 'image',
      size: 0,
      status: 'pending',
      progress: 0,
      boardId
    }

    uploadQueue.value.push(item)
    return item
  }

  /**
   * Обновление метаданных элемента очереди
   */
  const updateQueueItem = (
    id: string, 
    data: Partial<UploadQueueItem>
  ) => {
    const index = uploadQueue.value.findIndex(item => item.id === id)
    if (index !== -1) {
      uploadQueue.value[index] = { ...uploadQueue.value[index], ...data }
    }
  }

  /**
   * Удаление из очереди
   */
  const removeFromQueue = (id: string) => {
    const index = uploadQueue.value.findIndex(item => item.id === id)
    if (index !== -1) {
      // Освобождаем URL превью если это был blob
      const item = uploadQueue.value[index]
      if (item.previewUrl.startsWith('data:')) {
        // Data URL не нужно revoke
      }
      uploadQueue.value.splice(index, 1)
    }
  }

  /**
   * Очистка очереди
   */
  const clearQueue = () => {
    uploadQueue.value = []
  }

  /**
   * Загрузка одного элемента
   */
  const uploadItem = async (id: string): Promise<Image | null> => {
    const item = uploadQueue.value.find(i => i.id === id)
    if (!item) return null

    updateQueueItem(id, { status: 'uploading', progress: 0 })

    try {
      // Симуляция загрузки с прогрессом
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        updateQueueItem(id, { progress })
      }

      // TODO: Заменить на реальный API
      // const formData = new FormData()
      // if (item.file) formData.append('file', item.file)
      // if (item.url) formData.append('url', item.url)
      // formData.append('boardId', item.boardId)
      // const response = await $fetch('/api/images', { method: 'POST', body: formData })

      const newImage: Image = {
        id: `img-${Date.now()}`,
        url: item.previewUrl,
        title: item.title || item.name,
        description: item.description,
        boardId: item.boardId,
        userId: 'current-user',
        tags: item.tags,
        size: item.size,
        createdAt: new Date().toISOString()
      }

      images.value.unshift(newImage)
      updateQueueItem(id, { status: 'success', progress: 100 })

      return newImage
    } catch (e) {
      updateQueueItem(id, { 
        status: 'error', 
        error: 'Ошибка загрузки' 
      })
      console.error('Upload error:', e)
      return null
    }
  }

  /**
   * Загрузка всех pending элементов
   */
  const uploadAll = async () => {
    const pending = uploadQueue.value.filter(item => item.status === 'pending')
    
    for (const item of pending) {
      await uploadItem(item.id)
    }
  }

  /**
   * Удаление изображения
   */
  const deleteImage = async (id: string): Promise<boolean> => {
    try {
      // TODO: Заменить на реальный API
      await new Promise(resolve => setTimeout(resolve, 300))
      
      images.value = images.value.filter(img => img.id !== id)
      return true
    } catch (e) {
      error.value = 'Не удалось удалить изображение'
      console.error('Error deleting image:', e)
      return false
    }
  }

  /**
   * Обновление изображения
   */
  const updateImage = async (
    id: string, 
    data: UpdateImageDto
  ): Promise<Image | null> => {
    try {
      // TODO: Заменить на реальный API
      await new Promise(resolve => setTimeout(resolve, 300))

      const index = images.value.findIndex(img => img.id === id)
      if (index === -1) return null

      images.value[index] = { ...images.value[index], ...data }
      return images.value[index]
    } catch (e) {
      error.value = 'Не удалось обновить изображение'
      console.error('Error updating image:', e)
      return null
    }
  }

  /**
   * Очистка ошибки
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    images,
    uploadQueue,
    isLoading,
    error,

    // Getters
    imagesByBoard,
    pendingUploads,
    uploadingItems,
    hasActiveUploads,
    totalUploadProgress,

    // Actions
    fetchBoardImages,
    addFilesToQueue,
    addUrlToQueue,
    updateQueueItem,
    removeFromQueue,
    clearQueue,
    uploadItem,
    uploadAll,
    deleteImage,
    updateImage,
    clearError
  }
})

/**
 * Mock данные
 */
function getMockImages(boardId: string): Image[] {
  return [
    {
      id: 'img-1',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600',
      title: 'Горный пейзаж',
      description: 'Удивительный вид на горы',
      boardId,
      userId: 'current-user',
      tags: ['природа', 'горы'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'img-2',
      url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300',
      title: 'Городская архитектура',
      boardId,
      userId: 'current-user',
      tags: ['город', 'архитектура'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'img-3',
      url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&h=500',
      title: 'Лесное озеро',
      boardId,
      userId: 'current-user',
      tags: ['природа', 'озеро'],
      createdAt: new Date().toISOString()
    }
  ]
}
```

---

## 3️⃣ Composable для работы с изображениями

### Файл: `composables/useImages.ts`

```typescript
import { storeToRefs } from 'pinia'
import { useImagesStore } from '~/store/images'
import type { UpdateImageDto } from '~/types/image'

/**
 * Composable для работы с изображениями
 */
export const useImages = () => {
  const store = useImagesStore()

  const {
    images,
    uploadQueue,
    isLoading,
    error,
    pendingUploads,
    uploadingItems,
    hasActiveUploads,
    totalUploadProgress
  } = storeToRefs(store)

  /**
   * Загрузка изображений доски
   */
  const loadBoardImages = async (boardId: string) => {
    await store.fetchBoardImages(boardId)
  }

  /**
   * Получение изображений доски
   */
  const getBoardImages = (boardId: string) => {
    return store.imagesByBoard(boardId)
  }

  /**
   * Добавление файлов в очередь
   */
  const addFiles = async (files: File[], boardId: string) => {
    return await store.addFilesToQueue(files, boardId)
  }

  /**
   * Добавление URL в очередь
   */
  const addUrl = (url: string, boardId: string) => {
    return store.addUrlToQueue(url, boardId)
  }

  /**
   * Обновление элемента очереди
   */
  const updateQueueItem = (id: string, data: any) => {
    store.updateQueueItem(id, data)
  }

  /**
   * Удаление из очереди
   */
  const removeFromQueue = (id: string) => {
    store.removeFromQueue(id)
  }

  /**
   * Очистка очереди
   */
  const clearQueue = () => {
    store.clearQueue()
  }

  /**
   * Загрузка одного элемента
   */
  const uploadItem = async (id: string) => {
    return await store.uploadItem(id)
  }

  /**
   * Загрузка всех
   */
  const uploadAll = async () => {
    await store.uploadAll()
  }

  /**
   * Удаление изображения
   */
  const deleteImage = async (id: string) => {
    return await store.deleteImage(id)
  }

  /**
   * Обновление изображения
   */
  const updateImage = async (id: string, data: UpdateImageDto) => {
    return await store.updateImage(id, data)
  }

  /**
   * Очистка ошибки
   */
  const clearError = () => {
    store.clearError()
  }

  return {
    // State
    images,
    uploadQueue,
    isLoading,
    error,

    // Computed
    pendingUploads,
    uploadingItems,
    hasActiveUploads,
    totalUploadProgress,

    // Methods
    loadBoardImages,
    getBoardImages,
    addFiles,
    addUrl,
    updateQueueItem,
    removeFromQueue,
    clearQueue,
    uploadItem,
    uploadAll,
    deleteImage,
    updateImage,
    clearError
  }
}
```

---


## 4️⃣ Компонент Drag & Drop зоны

### Файл: `components/upload/DropZone.vue`

```vue
<template>
  <div
    class="drop-zone"
    :class="{
      'drop-zone--active': isDragOver,
      'drop-zone--disabled': disabled
    }"
    @dragenter.prevent="handleDragEnter"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    @click="openFileDialog"
  >
    <!-- Скрытый input для выбора файлов -->
    <input
      ref="fileInputRef"
      type="file"
      :accept="acceptTypes"
      :multiple="multiple"
      class="drop-zone__input"
      @change="handleFileSelect"
    />

    <!-- Контент зоны -->
    <div class="drop-zone__content">
      <div class="drop-zone__icon">
        {{ isDragOver ? '📥' : '📤' }}
      </div>
      
      <p class="drop-zone__title">
        {{ isDragOver ? 'Отпустите файлы' : 'Перетащите изображения сюда' }}
      </p>
      
      <p class="drop-zone__subtitle">
        или <span class="drop-zone__link">выберите файлы</span>
      </p>
      
      <p class="drop-zone__hint">
        {{ hintText }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DEFAULT_UPLOAD_CONFIG } from '~/utils/fileHelpers'

interface Props {
  multiple?: boolean
  disabled?: boolean
  maxFiles?: number
  maxFileSize?: number
  acceptTypes?: string
}

const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  disabled: false,
  maxFiles: DEFAULT_UPLOAD_CONFIG.maxFiles,
  maxFileSize: DEFAULT_UPLOAD_CONFIG.maxFileSize,
  acceptTypes: 'image/jpeg,image/png,image/gif,image/webp'
})

const emit = defineEmits<{
  files: [files: File[]]
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
const dragCounter = ref(0)

/**
 * Текст подсказки
 */
const hintText = computed(() => {
  const maxSizeMB = props.maxFileSize / (1024 * 1024)
  return `JPG, PNG, GIF, WebP до ${maxSizeMB}MB`
})

/**
 * Открытие диалога выбора файлов
 */
const openFileDialog = () => {
  if (props.disabled) return
  fileInputRef.value?.click()
}

/**
 * Обработка выбора файлов через input
 */
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    emitFiles(Array.from(input.files))
    input.value = '' // Сброс для повторного выбора того же файла
  }
}

/**
 * Drag enter
 */
const handleDragEnter = (event: DragEvent) => {
  if (props.disabled) return
  dragCounter.value++
  
  if (event.dataTransfer?.types.includes('Files')) {
    isDragOver.value = true
  }
}

/**
 * Drag over
 */
const handleDragOver = (event: DragEvent) => {
  if (props.disabled) return
  event.dataTransfer!.dropEffect = 'copy'
}

/**
 * Drag leave
 */
const handleDragLeave = () => {
  dragCounter.value--
  if (dragCounter.value === 0) {
    isDragOver.value = false
  }
}

/**
 * Drop
 */
const handleDrop = (event: DragEvent) => {
  if (props.disabled) return
  
  isDragOver.value = false
  dragCounter.value = 0

  const files = event.dataTransfer?.files
  if (files?.length) {
    emitFiles(Array.from(files))
  }
}

/**
 * Эмит файлов с фильтрацией
 */
const emitFiles = (files: File[]) => {
  // Фильтруем только изображения
  const imageFiles = files.filter(file => 
    file.type.startsWith('image/')
  )

  // Ограничиваем количество
  const limitedFiles = props.multiple 
    ? imageFiles.slice(0, props.maxFiles)
    : imageFiles.slice(0, 1)

  if (limitedFiles.length) {
    emit('files', limitedFiles)
  }
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.drop-zone
  position: relative
  border: 2px dashed $gray-300
  border-radius: $radius-lg
  padding: 48px 24px
  text-align: center
  cursor: pointer
  transition: all $transition-fast
  background: $gray-50

  &:hover:not(&--disabled)
    border-color: $primary-color
    background: rgba($primary-color, 0.05)

  &--active
    border-color: $primary-color
    background: rgba($primary-color, 0.1)
    border-style: solid

    .drop-zone__icon
      transform: scale(1.2)

  &--disabled
    opacity: 0.5
    cursor: not-allowed

  &__input
    position: absolute
    width: 0
    height: 0
    opacity: 0
    pointer-events: none

  &__content
    pointer-events: none

  &__icon
    font-size: 48px
    margin-bottom: 16px
    transition: transform $transition-fast

  &__title
    font-size: 18px
    font-weight: 600
    color: $text-light
    margin-bottom: 8px

  &__subtitle
    font-size: 14px
    color: $gray-500
    margin-bottom: 16px

  &__link
    color: $primary-color
    font-weight: 500
    text-decoration: underline
    cursor: pointer

  &__hint
    font-size: 12px
    color: $gray-400
</style>
```

---

## 5️⃣ Компонент загрузки по URL

### Файл: `components/upload/UrlInput.vue`

```vue
<template>
  <div class="url-input">
    <div class="url-input__field">
      <input
        v-model="url"
        type="url"
        class="url-input__input"
        :class="{ 'url-input__input--error': errorMessage }"
        placeholder="Вставьте URL изображения..."
        :disabled="disabled"
        @keydown.enter="handleSubmit"
        @input="clearError"
      />
      
      <button
        class="url-input__btn"
        :disabled="disabled || !url.trim()"
        @click="handleSubmit"
      >
        <span v-if="isLoading" class="url-input__spinner"></span>
        <span v-else>Добавить</span>
      </button>
    </div>

    <!-- Ошибка -->
    <p v-if="errorMessage" class="url-input__error">
      {{ errorMessage }}
    </p>

    <!-- Превью -->
    <div v-if="previewUrl" class="url-input__preview">
      <img 
        :src="previewUrl" 
        alt="Preview"
        @load="handlePreviewLoad"
        @error="handlePreviewError"
      />
      <button 
        class="url-input__preview-remove"
        @click="clearPreview"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { validateImageUrl } from '~/utils/fileHelpers'

interface Props {
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  submit: [url: string]
}>()

const url = ref('')
const previewUrl = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

/**
 * Очистка ошибки
 */
const clearError = () => {
  errorMessage.value = ''
}

/**
 * Очистка превью
 */
const clearPreview = () => {
  previewUrl.value = ''
  url.value = ''
  clearError()
}

/**
 * Обработка отправки
 */
const handleSubmit = async () => {
  if (!url.value.trim() || props.disabled) return

  clearError()
  isLoading.value = true

  try {
    // Валидация URL
    const validation = validateImageUrl(url.value)
    if (!validation.valid) {
      errorMessage.value = validation.error || 'Некорректный URL'
      return
    }

    // Показываем превью для проверки
    previewUrl.value = url.value
  } finally {
    isLoading.value = false
  }
}

/**
 * Превью загружено успешно
 */
const handlePreviewLoad = () => {
  emit('submit', url.value)
  clearPreview()
}

/**
 * Ошибка загрузки превью
 */
const handlePreviewError = () => {
  errorMessage.value = 'Не удалось загрузить изображение по этому URL'
  previewUrl.value = ''
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.url-input
  &__field
    display: flex
    gap: 8px

  &__input
    flex: 1
    padding: 12px 16px
    font-size: 14px
    border: 2px solid $gray-200
    border-radius: $radius
    background: white
    transition: all $transition-fast

    &:focus
      outline: none
      border-color: $primary-color

    &--error
      border-color: $error-color

    &::placeholder
      color: $gray-400

    &:disabled
      background: $gray-100
      cursor: not-allowed

  &__btn
    padding: 12px 24px
    background: $primary-color
    color: white
    border: none
    border-radius: $radius
    font-weight: 600
    cursor: pointer
    transition: all $transition-fast
    display: flex
    align-items: center
    gap: 8px
    white-space: nowrap

    &:hover:not(:disabled)
      background: darken($primary-color, 8%)

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

  &__error
    margin-top: 8px
    font-size: 13px
    color: $error-color

  &__preview
    position: relative
    margin-top: 16px
    border-radius: $radius
    overflow: hidden
    max-width: 200px

    img
      width: 100%
      height: auto
      display: block

    &-remove
      position: absolute
      top: 8px
      right: 8px
      width: 24px
      height: 24px
      background: rgba(0, 0, 0, 0.7)
      color: white
      border: none
      border-radius: 50%
      cursor: pointer
      font-size: 12px
      display: flex
      align-items: center
      justify-content: center

      &:hover
        background: $error-color

@keyframes spin
  to
    transform: rotate(360deg)
</style>
```

---

## 6️⃣ Компонент превью изображения в очереди

### Файл: `components/upload/QueueItem.vue`

```vue
<template>
  <article class="queue-item" :class="`queue-item--${item.status}`">
    <!-- Превью -->
    <div class="queue-item__preview">
      <img :src="item.previewUrl" :alt="item.name" />
      
      <!-- Оверлей статуса -->
      <div v-if="item.status !== 'pending'" class="queue-item__overlay">
        <span v-if="item.status === 'uploading'" class="queue-item__progress-text">
          {{ item.progress }}%
        </span>
        <span v-else-if="item.status === 'success'" class="queue-item__status-icon">
          ✓
        </span>
        <span v-else-if="item.status === 'error'" class="queue-item__status-icon queue-item__status-icon--error">
          ✕
        </span>
      </div>
    </div>

    <!-- Информация -->
    <div class="queue-item__info">
      <input
        v-model="localTitle"
        type="text"
        class="queue-item__title-input"
        placeholder="Название..."
        :disabled="item.status !== 'pending'"
        @blur="updateTitle"
      />
      
      <p class="queue-item__meta">
        {{ formatFileSize(item.size) }}
        <span v-if="item.error" class="queue-item__error">
          • {{ item.error }}
        </span>
      </p>

      <!-- Progress bar -->
      <div v-if="item.status === 'uploading'" class="queue-item__progress">
        <div 
          class="queue-item__progress-bar"
          :style="{ width: item.progress + '%' }"
        ></div>
      </div>
    </div>

    <!-- Действия -->
    <div class="queue-item__actions">
      <button
        v-if="item.status === 'pending'"
        class="queue-item__action"
        title="Удалить"
        @click="handleRemove"
      >
        🗑️
      </button>
      
      <button
        v-if="item.status === 'error'"
        class="queue-item__action"
        title="Повторить"
        @click="handleRetry"
      >
        🔄
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { UploadQueueItem } from '~/types/image'
import { formatFileSize } from '~/utils/fileHelpers'

interface Props {
  item: UploadQueueItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  remove: [id: string]
  retry: [id: string]
  update: [id: string, data: Partial<UploadQueueItem>]
}>()

const localTitle = ref(props.item.title || '')

watch(() => props.item.title, (newTitle) => {
  localTitle.value = newTitle || ''
})

const updateTitle = () => {
  if (localTitle.value !== props.item.title) {
    emit('update', props.item.id, { title: localTitle.value })
  }
}

const handleRemove = () => {
  emit('remove', props.item.id)
}

const handleRetry = () => {
  emit('retry', props.item.id)
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.queue-item
  display: flex
  gap: 12px
  padding: 12px
  background: white
  border-radius: $radius
  border: 1px solid $gray-200
  transition: all $transition-fast

  &--success
    border-color: $success-color
    background: rgba($success-color, 0.05)

  &--error
    border-color: $error-color
    background: rgba($error-color, 0.05)

  &__preview
    position: relative
    width: 80px
    height: 80px
    border-radius: $radius-sm
    overflow: hidden
    flex-shrink: 0

    img
      width: 100%
      height: 100%
      object-fit: cover

  &__overlay
    position: absolute
    inset: 0
    background: rgba(0, 0, 0, 0.5)
    display: flex
    align-items: center
    justify-content: center

  &__progress-text
    color: white
    font-weight: 600
    font-size: 14px

  &__status-icon
    width: 32px
    height: 32px
    background: $success-color
    color: white
    border-radius: 50%
    display: flex
    align-items: center
    justify-content: center
    font-size: 16px

    &--error
      background: $error-color

  &__info
    flex: 1
    min-width: 0

  &__title-input
    width: 100%
    padding: 4px 0
    border: none
    background: transparent
    font-size: 14px
    font-weight: 500
    color: $text-light

    &:focus
      outline: none

    &::placeholder
      color: $gray-400

    &:disabled
      color: $gray-500

  &__meta
    font-size: 12px
    color: $gray-400
    margin-top: 4px

  &__error
    color: $error-color

  &__progress
    height: 4px
    background: $gray-200
    border-radius: 2px
    margin-top: 8px
    overflow: hidden

  &__progress-bar
    height: 100%
    background: $primary-color
    border-radius: 2px
    transition: width 0.3s ease

  &__actions
    display: flex
    flex-direction: column
    gap: 4px

  &__action
    width: 32px
    height: 32px
    border: none
    background: $gray-100
    border-radius: 50%
    cursor: pointer
    font-size: 14px
    display: flex
    align-items: center
    justify-content: center
    transition: all $transition-fast

    &:hover
      background: $gray-200
</style>
```

---

## 7️⃣ Модальное окно загрузки

### Файл: `components/upload/UploadModal.vue`

```vue
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen" 
        class="upload-modal"
        @click.self="handleClose"
      >
        <div class="upload-modal__content">
          <!-- Header -->
          <header class="upload-modal__header">
            <h2 class="upload-modal__title">Загрузить изображения</h2>
            <button 
              class="upload-modal__close"
              @click="handleClose"
              :disabled="hasActiveUploads"
            >
              ✕
            </button>
          </header>

          <!-- Tabs -->
          <div class="upload-modal__tabs">
            <button
              class="upload-modal__tab"
              :class="{ 'upload-modal__tab--active': activeTab === 'file' }"
              @click="activeTab = 'file'"
            >
              📁 Файлы
            </button>
            <button
              class="upload-modal__tab"
              :class="{ 'upload-modal__tab--active': activeTab === 'url' }"
              @click="activeTab = 'url'"
            >
              🔗 По URL
            </button>
          </div>

          <!-- Content -->
          <div class="upload-modal__body">
            <!-- Tab: Files -->
            <div v-show="activeTab === 'file'">
              <UploadDropZone
                :disabled="hasActiveUploads"
                @files="handleFilesSelected"
              />
            </div>

            <!-- Tab: URL -->
            <div v-show="activeTab === 'url'">
              <UploadUrlInput
                :disabled="hasActiveUploads"
                @submit="handleUrlSubmit"
              />
            </div>

            <!-- Queue -->
            <div v-if="uploadQueue.length" class="upload-modal__queue">
              <div class="upload-modal__queue-header">
                <h3>Очередь загрузки ({{ uploadQueue.length }})</h3>
                <button
                  v-if="!hasActiveUploads"
                  class="upload-modal__clear-btn"
                  @click="clearQueue"
                >
                  Очистить
                </button>
              </div>

              <div class="upload-modal__queue-list">
                <UploadQueueItem
                  v-for="item in uploadQueue"
                  :key="item.id"
                  :item="item"
                  @remove="removeFromQueue"
                  @retry="retryUpload"
                  @update="updateQueueItem"
                />
              </div>
            </div>
          </div>

          <!-- Footer -->
          <footer class="upload-modal__footer">
            <button
              class="upload-modal__btn upload-modal__btn--secondary"
              @click="handleClose"
              :disabled="hasActiveUploads"
            >
              Отмена
            </button>
            <button
              class="upload-modal__btn upload-modal__btn--primary"
              :disabled="!pendingUploads.length || hasActiveUploads"
              @click="handleUploadAll"
            >
              <span v-if="hasActiveUploads" class="upload-modal__spinner"></span>
              {{ hasActiveUploads ? `Загрузка ${totalUploadProgress}%` : `Загрузить (${pendingUploads.length})` }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useImages } from '~/composables/useImages'

interface Props {
  isOpen: boolean
  boardId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  uploaded: []
}>()

const {
  uploadQueue,
  pendingUploads,
  uploadingItems,
  totalUploadProgress,
  addFiles,
  addUrl,
  updateQueueItem,
  removeFromQueue,
  clearQueue,
  uploadItem,
  uploadAll
} = useImages()

const activeTab = ref<'file' | 'url'>('file')
const isUploading = ref(false)

/**
 * Проверяем есть ли активные загрузки (только uploading, не pending)
 * 
 * ВАЖНО: Используем локальный computed вместо store.hasActiveUploads,
 * чтобы кнопка не показывала "Загрузка 0%" когда файлы только добавлены
 * в очередь, но загрузка ещё не началась.
 */
const hasActiveUploads = computed(() => uploadingItems.value.length > 0 || isUploading.value)

/**
 * Обработка выбора файлов
 */
const handleFilesSelected = async (files: File[]) => {
  await addFiles(files, props.boardId)
}

/**
 * Обработка URL
 */
const handleUrlSubmit = (url: string) => {
  addUrl(url, props.boardId)
}

/**
 * Повторная загрузка
 */
const retryUpload = async (id: string) => {
  updateQueueItem(id, { status: 'pending', progress: 0, error: undefined })
  await uploadItem(id)
}

/**
 * Загрузка всех
 */
const handleUploadAll = async () => {
  isUploading.value = true
  try {
    await uploadAll()
    
    // Проверяем успешность
    const allSuccess = uploadQueue.value.every(item => item.status === 'success')
    if (allSuccess) {
      emit('uploaded')
      clearQueue()
      emit('close')
    }
  } finally {
    isUploading.value = false
  }
}

/**
 * Закрытие модалки
 */
const handleClose = () => {
  if (hasActiveUploads.value) return
  
  clearQueue()
  emit('close')
}

// Блокируем скролл при открытии
watch(() => props.isOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.upload-modal
  position: fixed
  inset: 0
  background: rgba(0, 0, 0, 0.5)
  display: flex
  align-items: center
  justify-content: center
  z-index: $z-index-modal
  padding: 16px

  &__content
    background: white
    border-radius: $radius-lg
    width: 100%
    max-width: 600px
    max-height: 90vh
    display: flex
    flex-direction: column
    overflow: hidden

  &__header
    display: flex
    align-items: center
    justify-content: space-between
    padding: 20px 24px
    border-bottom: 1px solid $gray-200

  &__title
    font-size: 20px
    font-weight: 700
    color: $text-light

  &__close
    width: 32px
    height: 32px
    border: none
    background: $gray-100
    border-radius: 50%
    cursor: pointer
    font-size: 16px
    transition: all $transition-fast

    &:hover:not(:disabled)
      background: $gray-200

    &:disabled
      opacity: 0.5
      cursor: not-allowed

  &__tabs
    display: flex
    padding: 0 24px
    border-bottom: 1px solid $gray-200

  &__tab
    padding: 12px 16px
    background: none
    border: none
    font-size: 14px
    font-weight: 500
    color: $gray-500
    cursor: pointer
    position: relative
    transition: color $transition-fast

    &:hover
      color: $text-light

    &--active
      color: $primary-color

      &::after
        content: ''
        position: absolute
        bottom: -1px
        left: 0
        right: 0
        height: 2px
        background: $primary-color

  &__body
    flex: 1
    padding: 24px
    overflow-y: auto

  &__queue
    margin-top: 24px

    &-header
      display: flex
      align-items: center
      justify-content: space-between
      margin-bottom: 12px

      h3
        font-size: 14px
        font-weight: 600
        color: $text-light

    &-list
      display: flex
      flex-direction: column
      gap: 8px
      max-height: 300px
      overflow-y: auto

  &__clear-btn
    padding: 4px 12px
    background: none
    border: 1px solid $gray-300
    border-radius: $radius-sm
    font-size: 12px
    color: $gray-500
    cursor: pointer
    transition: all $transition-fast

    &:hover
      border-color: $error-color
      color: $error-color

  &__footer
    display: flex
    gap: 12px
    padding: 20px 24px
    border-top: 1px solid $gray-200

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

// Анимации
.modal-enter-active,
.modal-leave-active
  transition: all 0.3s ease

.modal-enter-from,
.modal-leave-to
  opacity: 0

  .upload-modal__content
    transform: scale(0.9)

@keyframes spin
  to
    transform: rotate(360deg)
</style>
```

---


## 8️⃣ Интеграция с страницей доски

### Обновление `pages/boards/[id].vue`

Добавляем кнопку загрузки и модальное окно:

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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useBoards } from '~/composables/useBoards'
import { useImages } from '~/composables/useImages'
import type { Image } from '~/types'
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
  // Изображения уже добавлены в store через uploadAll
  // Можно показать уведомление
  console.log('Images uploaded successfully')
}

/**
 * Клик по изображению
 */
const handleImageClick = (image: Image) => {
  // TODO: Открыть модалку просмотра (этап 8)
  console.log('Image clicked:', image)
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
    transition: all $transition-fast
    
    &:hover
      background: darken($primary-color, 8%)
  
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
    transition: all $transition-fast
    
    &:hover
      background: darken($primary-color, 8%)
  
  // Модальное окно
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

## 9️⃣ Структура файлов этапа

```
frontend/
├── components/
│   └── upload/
│       ├── DropZone.vue      # Drag & Drop зона
│       ├── UrlInput.vue      # Загрузка по URL
│       ├── QueueItem.vue     # Элемент очереди
│       └── UploadModal.vue   # Модальное окно загрузки
├── composables/
│   └── useImages.ts          # Composable для изображений
├── store/
│   └── images.ts             # Pinia store изображений
├── types/
│   └── image.ts              # Обновлённые типы
├── utils/
│   └── fileHelpers.ts        # Утилиты для файлов
└── pages/
    └── boards/
        └── [id].vue          # Обновлённая страница доски
```

---

## ✅ Чеклист выполнения

### Типы и интерфейсы
- [ ] Обновлённый интерфейс `Image`
- [ ] DTO `CreateImageDto`
- [ ] DTO `UpdateImageDto`
- [ ] Тип `UploadStatus`
- [ ] Интерфейс `UploadQueueItem`
- [ ] Интерфейс `FileValidationResult`
- [ ] Интерфейс `UploadConfig`

### Утилиты
- [ ] `validateFile` - валидация файла
- [ ] `validateImageUrl` - валидация URL
- [ ] `formatFileSize` - форматирование размера
- [ ] `createFilePreview` - создание превью
- [ ] `getImageDimensions` - получение размеров
- [ ] `generateUploadId` - генерация ID

### Store и Composables
- [ ] Pinia Store `useImagesStore`
- [ ] Composable `useImages`
- [ ] Очередь загрузки
- [ ] Прогресс загрузки
- [ ] CRUD операции (mock)

### Компоненты
- [ ] `DropZone` - Drag & Drop зона
- [ ] `UrlInput` - загрузка по URL
- [ ] `QueueItem` - элемент очереди
- [ ] `UploadModal` - модальное окно

### Функционал
- [ ] Drag & Drop файлов
- [ ] Выбор файлов через диалог
- [ ] Загрузка по URL
- [ ] Превью перед загрузкой
- [ ] Progress bar
- [ ] Множественная загрузка
- [ ] Валидация файлов
- [ ] Обработка ошибок
- [ ] Повторная загрузка при ошибке

---

## 🐛 Известные проблемы и решения

### Проблема: Кнопка показывает "Загрузка 0%" при добавлении файлов

**Симптом:** При добавлении файлов в очередь (до нажатия кнопки "Загрузить") кнопка показывала "Загрузка 0%" вместо "Загрузить (N)".

**Причина:** Store-овский `hasActiveUploads` проверял статусы `pending` и `uploading`, поэтому сразу после добавления файлов (со статусом `pending`) кнопка считала что загрузка активна.

**Решение:** В `UploadModal.vue` используем локальный `computed` вместо store-овского:

```typescript
const isUploading = ref(false)

// Проверяем только uploading статус, не pending
const hasActiveUploads = computed(() => uploadingItems.value.length > 0 || isUploading.value)

const handleUploadAll = async () => {
  isUploading.value = true
  try {
    await uploadAll()
    // ...
  } finally {
    isUploading.value = false
  }
}
```

Теперь кнопка показывает "Загрузка X%" только когда загрузка реально началась.

---

## 🎯 Результат этапа

После выполнения этого этапа у вас будет:

1. **Drag & Drop загрузка** - перетаскивание файлов в зону
2. **Загрузка по URL** - добавление изображений по ссылке
3. **Очередь загрузки** - управление несколькими файлами
4. **Progress bar** - отображение прогресса загрузки
5. **Превью** - предпросмотр перед загрузкой
6. **Валидация** - проверка типа и размера файлов
7. **Обработка ошибок** - информативные сообщения
8. **Множественная загрузка** - до 10 файлов одновременно

---

## 🔜 Следующий этап

**Этап 8: Детальный просмотр изображений**
- Модальный компонент просмотра
- Добавление описаний и заметок
- Система тегов
- Действия: редактировать, удалить, поделиться

Готов к следующему этапу! 🚀
