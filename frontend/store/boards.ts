import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Board, CreateBoardDto, UpdateBoardDto } from '~/types/board'

interface PaginatedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasMore: boolean
}

interface BoardResponse {
  id: string
  title: string
  description?: string
  coverImage?: string
  isPrivate: boolean
  imagesCount: number
  user?: {
    id: string
    username: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
}

export const useBoardsStore = defineStore('boards', () => {
  const boards = ref<Board[]>([])
  const currentBoard = ref<Board | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    pageSize: 12,
    totalItems: 0,
    totalPages: 0,
    hasMore: false
  })

  const totalBoards = computed(() => pagination.value.totalItems || boards.value.length)

  const { get, post, put, del } = useApi()

  // Преобразование ответа API в формат Board
  const mapBoardResponse = (data: BoardResponse): Board => ({
    id: data.id,
    title: data.title,
    description: data.description,
    coverImage: data.coverImage,
    isPrivate: data.isPrivate,
    imageCount: data.imagesCount,
    userId: data.user?.id || '',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  })

  const fetchBoards = async (page = 1, pageSize = 12) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await get<PaginatedResponse<BoardResponse>>(
        `/boards?page=${page}&pageSize=${pageSize}`
      )
      boards.value = response.items.map(mapBoardResponse)
      pagination.value = {
        page: response.page,
        pageSize: response.pageSize,
        totalItems: response.totalItems,
        totalPages: response.totalPages,
        hasMore: response.hasMore
      }
    } catch (e: any) {
      error.value = e.data?.message || 'Не удалось загрузить доски'
      console.error('Error fetching boards:', e)
    } finally {
      isLoading.value = false
    }
  }

  const fetchBoard = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await get<BoardResponse>(`/boards/${id}`)
      currentBoard.value = mapBoardResponse(response)
      return currentBoard.value
    } catch (e: any) {
      error.value = e.data?.message || 'Не удалось загрузить доску'
      console.error('Error fetching board:', e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const createBoard = async (data: CreateBoardDto): Promise<Board | null> => {
    isLoading.value = true
    error.value = null
    try {
      const response = await post<BoardResponse>('/boards', data)
      const newBoard = mapBoardResponse(response)
      boards.value.unshift(newBoard)
      return newBoard
    } catch (e: any) {
      error.value = e.data?.message || 'Не удалось создать доску'
      console.error('Error creating board:', e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updateBoard = async (id: string, data: UpdateBoardDto): Promise<Board | null> => {
    isLoading.value = true
    error.value = null
    try {
      const response = await put<BoardResponse>(`/boards/${id}`, data)
      const updated = mapBoardResponse(response)
      
      const index = boards.value.findIndex(b => b.id === id)
      if (index !== -1) {
        boards.value[index] = updated
      }
      
      if (currentBoard.value?.id === id) {
        currentBoard.value = updated
      }
      return updated
    } catch (e: any) {
      error.value = e.data?.message || 'Не удалось обновить доску'
      console.error('Error updating board:', e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const deleteBoard = async (id: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null
    try {
      await del(`/boards/${id}`)
      boards.value = boards.value.filter(b => b.id !== id)
      if (currentBoard.value?.id === id) {
        currentBoard.value = null
      }
      return true
    } catch (e: any) {
      error.value = e.data?.message || 'Не удалось удалить доску'
      console.error('Error deleting board:', e)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Сохранение изображения на доску
  const addImageToBoard = async (boardId: string, imageId: string): Promise<boolean> => {
    try {
      await post(`/boards/${boardId}/images`, { imageId })
      return true
    } catch (e: any) {
      error.value = e.data?.message || 'Не удалось сохранить изображение'
      console.error('Error adding image to board:', e)
      return false
    }
  }

  // Удаление изображения с доски
  const removeImageFromBoard = async (boardId: string, imageId: string): Promise<boolean> => {
    try {
      await del(`/boards/${boardId}/images`, { imageId })
      return true
    } catch (e: any) {
      error.value = e.data?.message || 'Не удалось удалить изображение'
      console.error('Error removing image from board:', e)
      return false
    }
  }

  const clearCurrentBoard = () => {
    currentBoard.value = null
  }

  return {
    boards,
    currentBoard,
    isLoading,
    error,
    pagination,
    totalBoards,
    fetchBoards,
    fetchBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    addImageToBoard,
    removeImageFromBoard,
    clearCurrentBoard
  }
})
