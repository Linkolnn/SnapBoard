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

  const loadBoardImages = async (boardId: string) => {
    await store.fetchBoardImages(boardId)
  }

  const getBoardImages = (boardId: string) => {
    return store.imagesByBoard(boardId)
  }

  const addFiles = async (files: File[], boardId: string) => {
    return await store.addFilesToQueue(files, boardId)
  }

  const addUrl = (url: string, boardId: string) => {
    return store.addUrlToQueue(url, boardId)
  }

  const updateQueueItem = (id: string, data: any) => {
    store.updateQueueItem(id, data)
  }

  const removeFromQueue = (id: string) => {
    store.removeFromQueue(id)
  }

  const clearQueue = () => {
    store.clearQueue()
  }

  const uploadItem = async (id: string) => {
    return await store.uploadItem(id)
  }

  const uploadAll = async () => {
    await store.uploadAll()
  }

  const deleteImage = async (id: string) => {
    return await store.deleteImage(id)
  }

  const updateImage = async (id: string, data: UpdateImageDto) => {
    return await store.updateImage(id, data)
  }

  const clearError = () => {
    store.clearError()
  }

  return {
    images,
    uploadQueue,
    isLoading,
    error,
    pendingUploads,
    uploadingItems,
    hasActiveUploads,
    totalUploadProgress,
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
