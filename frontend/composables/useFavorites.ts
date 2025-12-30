import { ref, computed } from 'vue'
import type { Image } from '~/types/image'
import { useAuthStore } from '~/store/auth'

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

const favorites = ref<Set<string>>(new Set())
const isLoading = ref(false)

/**
 * Composable для работы с избранными изображениями
 */
export function useFavorites() {
  const { get, post, del } = useApi()
  const authStore = useAuthStore()

  /**
   * Проверить, находится ли изображение в избранном
   */
  const isFavorite = (imageId: string): boolean => {
    return favorites.value.has(imageId)
  }
  
  /**
   * Переключить статус избранного
   */
  const toggleFavorite = async (imageId: string): Promise<boolean> => {
    if (!authStore.isAuthenticated) return false
    
    try {
      if (favorites.value.has(imageId)) {
        await del(`/favorites/${imageId}`)
        favorites.value.delete(imageId)
      } else {
        await post(`/favorites/${imageId}`, {})
        favorites.value.add(imageId)
      }
      return true
    } catch (e) {
      console.error('Toggle favorite error:', e)
      return false
    }
  }
  
  /**
   * Добавить в избранное
   */
  const addFavorite = async (imageId: string): Promise<boolean> => {
    if (!authStore.isAuthenticated) return false
    if (favorites.value.has(imageId)) return true
    
    try {
      await post(`/favorites/${imageId}`, {})
      favorites.value.add(imageId)
      return true
    } catch (e) {
      console.error('Add favorite error:', e)
      return false
    }
  }
  
  /**
   * Удалить из избранного
   */
  const removeFavorite = async (imageId: string): Promise<boolean> => {
    if (!authStore.isAuthenticated) return false
    
    try {
      await del(`/favorites/${imageId}`)
      favorites.value.delete(imageId)
      return true
    } catch (e) {
      console.error('Remove favorite error:', e)
      return false
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
      // Обновляем локальный кэш
      response.items.forEach((img: Image) => favorites.value.add(img.id))
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
      // Обновляем локальный кэш
      Object.entries(response.results).forEach(([id, isFav]) => {
        if (isFav) {
          favorites.value.add(id)
        } else {
          favorites.value.delete(id)
        }
      })
      return response.results
    } catch (e) {
      console.error('Check favorites error:', e)
      return {}
    }
  }

  /**
   * Очистить локальный кэш (при logout)
   */
  const clearFavorites = () => {
    favorites.value.clear()
  }
  
  /**
   * Список ID избранных изображений
   */
  const favoriteIds = computed(() => Array.from(favorites.value))
  
  /**
   * Количество избранных
   */
  const favoritesCount = computed(() => favorites.value.size)
  
  return {
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    fetchFavorites,
    checkFavorites,
    clearFavorites,
    favoriteIds,
    favoritesCount,
    isLoading
  }
}
