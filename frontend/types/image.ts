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
  file?: File
  url?: string
  previewUrl: string
  name: string
  size: number
  status: UploadStatus
  progress: number
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
  maxFileSize: number
  maxFiles: number
  allowedTypes: string[]
  allowedExtensions: string[]
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