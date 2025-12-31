import { ref } from 'vue'
import type { Image } from '~/types/image'
import { useAuthStore } from '~/store/auth'
import { useApi } from '~/composables/useApi'

interface FavoritesResponse {
  items: Image[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasMore: boolean
}

interface FavoriteCheckResponse {
  results: Record<string, boolean>
}

const isLoading = ref(false)

/**
 * Composable для работы с избранными изображениями
 * Все данные только с backend, без локального кеша
 */
export function useFavorites() {
  const { get, post, del } = useApi()
  const authStore = useAuthStore()

  /**
   * Проверить статус избранного для одного изображения через API
   */
  const checkIsFavorite = async (imageId: string): Promise<boolean> => {
    if (!authStore.isAuthenticated) return false
    
    try {
      const response = await get<FavoriteCheckResponse>(
        `/favorites/check?imageIds=${imageId}`
      )
      return response.results[imageId] || false
    } catch (e) {
      console.error('Check favorite error:', e)
      return false
    }
  }
  
  /**
   * Добавить в избранное
   * Возвращает true если успешно добавлено или уже было в избранном
   */
  const addFavorite = async (imageId: string): Promise<boolean> => {
    if (!authStore.isAuthenticated) return false
    
    try {
      await post(`/favorites/${imageId}`, {})
      return true
    } catch (e: any) {
      // Если 400 "уже в избранном" - считаем успехом
      if (e?.statusCode === 400 || e?.data?.statusCode === 400) {
        return true
      }
      console.error('Add favorite error:', e)
      return false
    }
  }
  
  /**
   * Удалить из избранного
   * Возвращает true если успешно удалено или уже не было в избранном
   */
  const removeFavorite = async (imageId: string): Promise<boolean> => {
    if (!authStore.isAuthenticated) return false
    
    try {
      await del(`/favorites/${imageId}`)
      return true
    } catch (e: any) {
      // Если 400 "не в избранном" - считаем успехом
      if (e?.statusCode === 400 || e?.data?.statusCode === 400) {
        return true
      }
      console.error('Remove favorite error:', e)
      return false
    }
  }

  /**
   * Переключить статус избранного
   * Принимает текущий статус как параметр (из UI)
   */
  const toggleFavorite = async (
    imageId: string, 
    currentIsFavorite: boolean
  ): Promise<{ success: boolean; isFavorite: boolean }> => {
    if (!authStore.isAuthenticated) {
      return { success: false, isFavorite: currentIsFavorite }
    }
    
    try {
      if (currentIsFavorite) {
        // Удаляем из избранного
        const success = await removeFavorite(imageId)
        return { success, isFavorite: success ? false : currentIsFavorite }
      } else {
        // Добавляем в избранное
        const success = await addFavorite(imageId)
        return { success, isFavorite: success ? true : currentIsFavorite }
      }
    } catch (e: any) {
      console.error('Toggle favorite error:', e)
      return { success: false, isFavorite: currentIsFavorite }
    }
  }

  /**
   * Загрузить список избранного
   */
  const fetchFavorites = async (page = 1, pageSize = 12): Promise<FavoritesResponse | null> => {
    if (!authStore.isAuthenticated) return null
    
    isLoading.value = true
    try {
      const response = await get<FavoritesResponse>(
        `/favorites?page=${page}&pageSize=${pageSize}`
      )
      return response
    } catch (e) {
      console.error('Fetch favorites error:', e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Batch проверка статуса избранного
   */
  const checkFavorites = async (imageIds: string[]): Promise<Record<string, boolean>> => {
    if (!authStore.isAuthenticated || !imageIds.length) return {}
    
    try {
      const response = await get<FavoriteCheckResponse>(
        `/favorites/check?imageIds=${imageIds.join(',')}`
      )
      return response.results
    } catch (e) {
      console.error('Check favorites error:', e)
      return {}
    }
  }
  
  return {
    checkIsFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    fetchFavorites,
    checkFavorites,
    isLoading
  }
}
