import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Image, 
  UpdateImageDto,
  UploadQueueItem
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
      await new Promise(resolve => setTimeout(resolve, 500))
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
      if (uploadQueue.value.length >= DEFAULT_UPLOAD_CONFIG.maxFiles) {
        error.value = `Максимум ${DEFAULT_UPLOAD_CONFIG.maxFiles} файлов`
        break
      }

      const validation = validateFile(file)
      if (!validation.valid) {
        console.warn(`File ${file.name} rejected:`, validation.error)
        continue
      }

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
  const updateQueueItem = (id: string, data: Partial<Omit<UploadQueueItem, 'id'>>) => {
    const index = uploadQueue.value.findIndex(item => item.id === id)
    if (index !== -1) {
      const current = uploadQueue.value[index]
      if (current) {
        uploadQueue.value[index] = { ...current, ...data }
      }
    }
  }

  /**
   * Удаление из очереди
   */
  const removeFromQueue = (id: string) => {
    const index = uploadQueue.value.findIndex(item => item.id === id)
    if (index !== -1) {
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
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        updateQueueItem(id, { progress })
      }

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
      updateQueueItem(id, { status: 'error', error: 'Ошибка загрузки' })
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
  const updateImage = async (id: string, data: UpdateImageDto): Promise<Image | null> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const index = images.value.findIndex(img => img.id === id)
      if (index === -1) return null
      const current = images.value[index]
      if (!current) return null
      images.value[index] = { ...current, ...data }
      return images.value[index] ?? null
    } catch (e) {
      error.value = 'Не удалось обновить изображение'
      console.error('Error updating image:', e)
      return null
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    images,
    uploadQueue,
    isLoading,
    error,
    imagesByBoard,
    pendingUploads,
    uploadingItems,
    hasActiveUploads,
    totalUploadProgress,
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
