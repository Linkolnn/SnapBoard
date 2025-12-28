import { storeToRefs } from 'pinia'
import { useBoardsStore } from '~/store/boards'
import type { CreateBoardDto, UpdateBoardDto } from '~/types/board'

export function useBoards() {
  const store = useBoardsStore()
  const { boards, currentBoard, isLoading, error, totalBoards } = storeToRefs(store)

  const loadBoards = async () => {
    await store.fetchBoards()
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
    clearCurrentBoard
  }
}
