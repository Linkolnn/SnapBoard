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
