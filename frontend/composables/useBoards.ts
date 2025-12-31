import { storeToRefs } from 'pinia'
import { useBoardsStore } from '~/store/boards'
import { useAuthStore } from '~/store/auth'
import type { CreateBoardDto, UpdateBoardDto } from '~/types/board'

export function useBoards() {
  const store = useBoardsStore()
  const authStore = useAuthStore()
  const { boards, currentBoard, isLoading, error, totalBoards } = storeToRefs(store)

  // Загрузка досок текущего пользователя
  const loadBoards = async () => {
    const userId = authStore.user?.id
    await store.fetchBoards(1, 12, userId)
  }

  const loadBoard = async (id: string) => {
    await store.fetchBoard(id)
  }

  const createBoard = async (data: CreateBoardDto) => {
    return await store.createBoard(data)
  }

  const updateBoard = async (id: string, data: UpdateBoardDto) => {
    return await store.updateBoard(id, data)
  }

  const deleteBoard = async (id: string) => {
    return await store.deleteBoard(id)
  }

  const clearCurrentBoard = () => {
    store.clearCurrentBoard()
  }

  const clearBoards = () => {
    store.clearBoards()
  }

  return {
    boards,
    currentBoard,
    isLoading,
    error,
    totalBoards,
    loadBoards,
    loadBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    clearCurrentBoard,
    clearBoards
  }
}
