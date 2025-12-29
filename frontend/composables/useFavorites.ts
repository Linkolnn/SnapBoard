import { ref, computed } from 'vue'

const favorites = ref<Set<string>>(new Set())

// Загрузка из localStorage при инициализации
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('snapboard_favorites')
  if (saved) {
    try {
      favorites.value = new Set(JSON.parse(saved))
    } catch (e) {
      console.error('Failed to parse favorites:', e)
    }
  }
}

/**
 * Сохранить избранное в localStorage
 */
function saveFavorites() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      'snapboard_favorites',
      JSON.stringify([...favorites.value])
    )
  }
}

/**
 * Composable для работы с избранными изображениями
 */
export function useFavorites() {
  /**
   * Проверить, находится ли изображение в избранном
   */
  const isFavorite = (imageId: string): boolean => {
    return favorites.value.has(imageId)
  }
  
  /**
   * Переключить статус избранного
   */
  const toggleFavorite = (imageId: string) => {
    if (favorites.value.has(imageId)) {
      favorites.value.delete(imageId)
    } else {
      favorites.value.add(imageId)
    }
    saveFavorites()
  }
  
  /**
   * Добавить в избранное
   */
  const addFavorite = (imageId: string) => {
    favorites.value.add(imageId)
    saveFavorites()
  }
  
  /**
   * Удалить из избранного
   */
  const removeFavorite = (imageId: string) => {
    favorites.value.delete(imageId)
    saveFavorites()
  }
  
  /**
   * Список ID избранных изображений
   */
  const favoriteIds = computed(() => [...favorites.value])
  
  /**
   * Количество избранных
   */
  const favoritesCount = computed(() => favorites.value.size)
  
  return {
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    favoriteIds,
    favoritesCount
  }
}
