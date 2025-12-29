import { ref, computed } from 'vue'

const favorites = ref<string[]>([])

// Загрузка из localStorage при инициализации
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('snapboard_favorites')
  if (saved) {
    try {
      favorites.value = JSON.parse(saved)
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
      JSON.stringify(favorites.value)
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
    return favorites.value.includes(imageId)
  }
  
  /**
   * Переключить статус избранного
   */
  const toggleFavorite = (imageId: string) => {
    const index = favorites.value.indexOf(imageId)
    if (index > -1) {
      favorites.value.splice(index, 1)
    } else {
      favorites.value.push(imageId)
    }
    saveFavorites()
  }
  
  /**
   * Добавить в избранное
   */
  const addFavorite = (imageId: string) => {
    if (!favorites.value.includes(imageId)) {
      favorites.value.push(imageId)
      saveFavorites()
    }
  }
  
  /**
   * Удалить из избранного
   */
  const removeFavorite = (imageId: string) => {
    const index = favorites.value.indexOf(imageId)
    if (index > -1) {
      favorites.value.splice(index, 1)
      saveFavorites()
    }
  }
  
  /**
   * Список ID избранных изображений
   */
  const favoriteIds = computed(() => [...favorites.value])
  
  /**
   * Количество избранных
   */
  const favoritesCount = computed(() => favorites.value.length)
  
  return {
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    favoriteIds,
    favoritesCount
  }
}
