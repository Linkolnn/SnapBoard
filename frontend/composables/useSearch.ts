import { computed, type Ref, type ComputedRef, isRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useSearchStore } from '~/store/search'
import { useImagesStore } from '~/store/images'
import type { Image } from '~/types/image'
import type { SortOption } from '~/types/search'

/**
 * Composable для поиска и фильтрации изображений
 */
export const useSearch = (boardId?: string, externalImages?: Ref<Image[]> | ComputedRef<Image[]>) => {
  const searchStore = useSearchStore()
  const imagesStore = useImagesStore()

  const {
    query,
    selectedTags,
    sortBy,
    isSearching,
    history,
    hasActiveFilters,
    activeFiltersCount
  } = storeToRefs(searchStore)

  /**
   * Получение базовых изображений для фильтрации
   */
  const baseImages = computed(() => {
    // Если переданы внешние изображения, используем их
    if (externalImages && isRef(externalImages)) {
      return externalImages.value
    }
    // Иначе используем изображения из store
    return boardId 
      ? imagesStore.imagesByBoard(boardId)
      : imagesStore.images
  })

  /**
   * Получение всех уникальных тегов из изображений
   */
  const availableTags = computed(() => {
    const tagsSet = new Set<string>()
    baseImages.value.forEach(img => {
      img.tags?.forEach(tag => tagsSet.add(tag))
    })
    
    return Array.from(tagsSet).sort()
  })

  /**
   * Сортировка изображений
   */
  const sortImages = (images: Image[], sort: SortOption): Image[] => {
    const sorted = [...images]
    
    switch (sort) {
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      case 'oldest':
        return sorted.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      case 'title_asc':
        return sorted.sort((a, b) => 
          (a.title || '').localeCompare(b.title || '')
        )
      case 'title_desc':
        return sorted.sort((a, b) => 
          (b.title || '').localeCompare(a.title || '')
        )
      default:
        return sorted
    }
  }

  /**
   * Фильтрация изображений
   */
  const filteredImages = computed(() => {
    let images = baseImages.value

    // Фильтр по поисковому запросу
    if (query.value.trim()) {
      const searchLower = query.value.toLowerCase().trim()
      images = images.filter(img => 
        img.title?.toLowerCase().includes(searchLower) ||
        img.description?.toLowerCase().includes(searchLower) ||
        img.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Фильтр по тегам
    if (selectedTags.value.length > 0) {
      images = images.filter(img =>
        selectedTags.value.every(tag => img.tags?.includes(tag))
      )
    }

    // Сортировка
    images = sortImages(images, sortBy.value)

    return images
  })

  /**
   * Количество результатов
   */
  const resultsCount = computed(() => filteredImages.value.length)

  /**
   * Выполнение поиска с добавлением в историю
   */
  const search = (searchQuery: string) => {
    searchStore.setQuery(searchQuery)
    if (searchQuery.trim()) {
      searchStore.addToHistory(searchQuery)
    }
  }

  /**
   * Применение поиска из истории
   */
  const applyFromHistory = (historyQuery: string) => {
    searchStore.setQuery(historyQuery)
  }

  return {
    query,
    selectedTags,
    sortBy,
    isSearching,
    history,
    hasActiveFilters,
    activeFiltersCount,
    availableTags,
    filteredImages,
    resultsCount,
    search,
    applyFromHistory,
    setQuery: searchStore.setQuery,
    setTags: searchStore.setTags,
    toggleTag: searchStore.toggleTag,
    setSortBy: searchStore.setSortBy,
    setSearching: searchStore.setSearching,
    removeFromHistory: searchStore.removeFromHistory,
    clearHistory: searchStore.clearHistory,
    clearFilters: searchStore.clearFilters
  }
}
