import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Board, CreateBoardDto, UpdateBoardDto } from '~/types/board'

export const useBoardsStore = defineStore('boards', () => {
  const boards = ref<Board[]>([])
  const currentBoard = ref<Board | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const totalBoards = computed(() => boards.value.length)

  const fetchBoards = async () => {
    isLoading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      boards.value = getMockBoards()
    } catch (e) {
      error.value = 'Не удалось загрузить доски'
    } finally {
      isLoading.value = false
    }
  }

  const fetchBoard = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      let board = boards.value.find(b => b.id === id)
      if (!board) {
        const mockBoard = getMockBoards().find(b => b.id === id)
        if (mockBoard) board = mockBoard
      }
      if (!board) throw new Error('Доска не найдена')
      currentBoard.value = board
      return board
    } catch (e) {
      error.value = 'Не удалось загрузить доску'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const createBoard = async (data: CreateBoardDto): Promise<Board | null> => {
    isLoading.value = true
    error.value = null
    try {
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
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updateBoard = async (id: string, data: UpdateBoardDto): Promise<Board | null> => {
    isLoading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const index = boards.value.findIndex(b => b.id === id)
      if (index === -1) throw new Error('Доска не найдена')
      
      const existing = boards.value[index]
      const updated: Board = {
        id: existing.id,
        userId: existing.userId,
        coverImage: existing.coverImage,
        imageCount: existing.imageCount,
        createdAt: existing.createdAt,
        title: data.title ?? existing.title,
        description: data.description ?? existing.description,
        isPrivate: data.isPrivate ?? existing.isPrivate,
        updatedAt: new Date().toISOString()
      }
      boards.value[index] = updated
      
      if (currentBoard.value?.id === id) {
        currentBoard.value = updated
      }
      return updated
    } catch (e) {
      error.value = 'Не удалось обновить доску'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const deleteBoard = async (id: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      boards.value = boards.value.filter(b => b.id !== id)
      if (currentBoard.value?.id === id) {
        currentBoard.value = null
      }
      return true
    } catch (e) {
      error.value = 'Не удалось удалить доску'
      return false
    } finally {
      isLoading.value = false
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
    totalBoards,
    fetchBoards,
    fetchBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    clearCurrentBoard
  }
})

function getMockBoards(): Board[] {
  return [
    {
      id: 'board-1',
      title: 'Вдохновение',
      description: 'Коллекция вдохновляющих изображений',
      userId: 'user-1',
      coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300',
      isPrivate: false,
      imageCount: 24,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-12-20T15:30:00Z'
    },
    {
      id: 'board-2',
      title: 'Дизайн интерьера',
      description: 'Идеи для ремонта квартиры',
      userId: 'user-1',
      coverImage: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&h=300',
      isPrivate: true,
      imageCount: 18,
      createdAt: '2024-02-10T12:00:00Z',
      updatedAt: '2024-12-18T09:15:00Z'
    },
    {
      id: 'board-3',
      title: 'Путешествия',
      description: 'Места, которые хочу посетить',
      userId: 'user-1',
      coverImage: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300',
      isPrivate: false,
      imageCount: 42,
      createdAt: '2024-03-05T08:00:00Z',
      updatedAt: '2024-12-25T11:45:00Z'
    },
    {
      id: 'board-4',
      title: 'Рецепты',
      userId: 'user-1',
      isPrivate: false,
      imageCount: 15,
      createdAt: '2024-04-20T14:00:00Z',
      updatedAt: '2024-12-22T16:20:00Z'
    }
  ]
}
