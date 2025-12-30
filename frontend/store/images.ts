import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Image, 
  UpdateImageDto,
  UploadQueueItem
} from '~/types/image'
import type { 
  PaginationState, 
  PageRequest, 
  PaginatedResponse 
} from '~/types/pagination'
import { 
  generateUploadId, 
  createFilePreview,
  validateFile,
  validateImageUrl,
  DEFAULT_UPLOAD_CONFIG 
} from '~/utils/fileHelpers'

interface ImageResponse {
  id: string
  url: string
  title?: string
  description?: string
  tags?: string[]
  width?: number
  height?: number
  size?: number
  boardId?: string
  userId: string
  isFavorite?: boolean
  user?: {
    id: string
    username: string
    avatar?: string
  }
  createdAt: string
  updatedAt?: string
}

interface UploadResponse {
  image: ImageResponse
  message: string
}

export const useImagesStore = defineStore('images', () => {
  const images = ref<Image[]>([])
  const uploadQueue = ref<UploadQueueItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const pagination = ref<PaginationState>({
    page: 1,
    pageSize: 12,
    hasMore: true,
    isLoading: false,
    error: null
  })

  const { get, put, del, upload } = useApi()

  // Преобразование ответа API
  const mapImageResponse = (data: ImageResponse): Image => ({
    id: data.id,
    url: data.url,
    title: data.title || '',
    description: data.description,
    tags: data.tags,
    width: data.width,
    height: data.height,
    size: data.size,
    boardId: data.boardId,
    userId: data.userId,
    isFavorite: data.isFavorite,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  })

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

  const fetchBoardImages = async (boardId: string, page = 1, pageSize = 12) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await get<PaginatedResponse<ImageResponse>>(
        `/boards/${boardId}/images?page=${page}&pageSize=${pageSize}`
      )
      images.value = response.items.map(mapImageResponse)
      pagination.value = {
        page: response.page,
        pageSize: response.pageSize,
        hasMore: response.hasMore,
        isLoading: false,
        error: null
      }
    } catch (e: any) {
      error.value = e.data?.message || 'Не удалось загрузить изображения'
      console.error('Error fetching images:', e)
    } finally {
      isLoading.value = false
    }
  }

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

  const updateQueueItem = (id: string, data: Partial<Omit<UploadQueueItem, 'id'>>) => {
    const index = uploadQueue.value.findIndex(item => item.id === id)
    if (index !== -1) {
      const current = uploadQueue.value[index]
      if (current) {
        uploadQueue.value[index] = { ...current, ...data }
      }
    }
  }

  const removeFromQueue = (id: string) => {
    const index = uploadQueue.value.findIndex(item => item.id === id)
    if (index !== -1) {
      uploadQueue.value.splice(index, 1)
    }
  }

  const clearQueue = () => {
    uploadQueue.value = []
  }

  const uploadItem = async (id: string): Promise<Image | null> => {
    const item = uploadQueue.value.find(i => i.id === id)
    if (!item) return null

    updateQueueItem(id, { status: 'uploading', progress: 0 })

    try {
      let response: UploadResponse

      if (item.file) {
        // Загрузка файла
        const formData = new FormData()
        formData.append('file', item.file)
        if (item.title) formData.append('title', item.title)
        if (item.description) formData.append('description', item.description)
        if (item.tags?.length) formData.append('tags', item.tags.join(','))
        if (item.boardId) formData.append('boardId', item.boardId)

        response = await upload<UploadResponse>(
          '/upload/file',
          formData,
          (progress: number) => updateQueueItem(id, { progress })
        )
      } else if (item.url) {
        // Загрузка по URL
        const { post } = useApi()
        response = await post<UploadResponse>('/upload/url', {
          url: item.url,
          title: item.title,
          description: item.description,
          tags: item.tags,
          boardId: item.boardId
        })
        updateQueueItem(id, { progress: 100 })
      } else {
        throw new Error('No file or URL provided')
      }

      const newImage = mapImageResponse(response.image)
      images.value.unshift(newImage)
      updateQueueItem(id, { status: 'success', progress: 100 })

      return newImage
    } catch (e: any) {
      const errorMsg = e.data?.message || e.message || 'Ошибка загрузки'
      updateQueueItem(id, { status: 'error', error: errorMsg })
      console.error('Upload error:', e)
      return null
    }
  }

  const uploadAll = async () => {
    const pending = uploadQueue.value.filter(item => item.status === 'pending')
    for (const item of pending) {
      await uploadItem(item.id)
    }
  }

  const deleteImage = async (id: string): Promise<boolean> => {
    try {
      await del(`/images/${id}`)
      images.value = images.value.filter(img => img.id !== id)
      return true
    } catch (e: any) {
      error.value = e.data?.message || 'Не удалось удалить изображение'
      console.error('Error deleting image:', e)
      return false
    }
  }

  const updateImage = async (id: string, data: UpdateImageDto): Promise<Image | null> => {
    try {
      const response = await put<ImageResponse>(`/images/${id}`, data)
      const updated = mapImageResponse(response)
      
      const index = images.value.findIndex(img => img.id === id)
      if (index !== -1) {
        images.value[index] = updated
      }
      return updated
    } catch (e: any) {
      error.value = e.data?.message || 'Не удалось обновить изображение'
      console.error('Error updating image:', e)
      return null
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Pagination
  const paginationState = computed(() => pagination.value)
  const canLoadMore = computed(() => pagination.value.hasMore && !pagination.value.isLoading)

  const fetchPagedImages = async (request: PageRequest): Promise<PaginatedResponse<Image>> => {
    pagination.value.isLoading = true
    pagination.value.error = null

    try {
      const params = new URLSearchParams({
        page: String(request.page),
        pageSize: String(request.pageSize)
      })
      if (request.boardId) params.append('boardId', request.boardId)
      if (request.query) params.append('query', request.query)
      if (request.tags?.length) params.append('tags', request.tags.join(','))
      if (request.sortBy) params.append('sortBy', request.sortBy)

      const response = await get<PaginatedResponse<ImageResponse>>(`/images?${params}`)
      
      return {
        items: response.items.map(mapImageResponse),
        page: response.page,
        pageSize: response.pageSize,
        totalItems: response.totalItems,
        totalPages: response.totalPages,
        hasMore: response.hasMore
      }
    } catch (e: any) {
      const errorMessage = e.data?.message || 'Не удалось загрузить изображения'
      pagination.value.error = errorMessage
      throw new Error(errorMessage)
    } finally {
      pagination.value.isLoading = false
    }
  }

  const appendImages = (newImages: Image[]) => {
    images.value = [...images.value, ...newImages]
  }

  const setImages = (newImages: Image[]) => {
    images.value = newImages
  }

  const resetPagination = () => {
    pagination.value = {
      page: 1,
      pageSize: 12,
      hasMore: true,
      isLoading: false,
      error: null
    }
    images.value = []
  }

  const updatePagination = (updates: Partial<PaginationState>) => {
    pagination.value = { ...pagination.value, ...updates }
  }

  const setPaginationError = (errorMessage: string | null) => {
    pagination.value.error = errorMessage
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
    clearError,
    pagination,
    paginationState,
    canLoadMore,
    fetchPagedImages,
    appendImages,
    setImages,
    resetPagination,
    updatePagination,
    setPaginationError
  }
})
