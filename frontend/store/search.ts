import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SearchHistoryItem, SortOption } from '~/types/search'

const HISTORY_KEY = 'snapboard_search_history'
const MAX_HISTORY_ITEMS = 10

export const useSearchStore = defineStore('search', () => {
  // State
  const query = ref('')
  const selectedTags = ref<string[]>([])
  const sortBy = ref<SortOption>('newest')
  const isSearching = ref(false)
  const history = ref<SearchHistoryItem[]>([])

  // Getters
  const hasActiveFilters = computed(() => 
    query.value.trim() !== '' || selectedTags.value.length > 0
  )

  const activeFiltersCount = computed(() => {
    let count = 0
    if (query.value.trim()) count++
    count += selectedTags.value.length
    return count
  })

  // Actions
  const setQuery = (value: string) => {
    query.value = value
  }

  const setTags = (tags: string[]) => {
    selectedTags.value = tags
  }

  const toggleTag = (tag: string) => {
    const index = selectedTags.value.indexOf(tag)
    if (index === -1) {
      selectedTags.value.push(tag)
    } else {
      selectedTags.value.splice(index, 1)
    }
  }

  const setSortBy = (option: SortOption) => {
    sortBy.value = option
  }

  const setSearching = (value: boolean) => {
    isSearching.value = value
  }

  const addToHistory = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Удаляем дубликат если есть
    history.value = history.value.filter(item => 
      item.query.toLowerCase() !== searchQuery.toLowerCase()
    )

    // Добавляем в начало
    history.value.unshift({
      id: `search-${Date.now()}`,
      query: searchQuery.trim(),
      timestamp: Date.now()
    })

    // Ограничиваем количество
    if (history.value.length > MAX_HISTORY_ITEMS) {
      history.value = history.value.slice(0, MAX_HISTORY_ITEMS)
    }

    saveHistoryToStorage()
  }

  const removeFromHistory = (id: string) => {
    history.value = history.value.filter(item => item.id !== id)
    saveHistoryToStorage()
  }

  const clearHistory = () => {
    history.value = []
    saveHistoryToStorage()
  }

  const clearFilters = () => {
    query.value = ''
    selectedTags.value = []
    sortBy.value = 'newest'
  }

  const loadHistoryFromStorage = () => {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem(HISTORY_KEY)
      if (stored) {
        history.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Error loading search history:', e)
    }
  }

  const saveHistoryToStorage = () => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
    } catch (e) {
      console.error('Error saving search history:', e)
    }
  }

  // Инициализация
  loadHistoryFromStorage()

  return {
    query,
    selectedTags,
    sortBy,
    isSearching,
    history,
    hasActiveFilters,
    activeFiltersCount,
    setQuery,
    setTags,
    toggleTag,
    setSortBy,
    setSearching,
    addToHistory,
    removeFromHistory,
    clearHistory,
    clearFilters,
    loadHistoryFromStorage
  }
})
