/**
 * Опции сортировки
 */
export type SortOption = 'newest' | 'oldest' | 'title_asc' | 'title_desc'

/**
 * Параметры поиска
 */
export interface SearchParams {
  query: string
  tags: string[]
  sortBy: SortOption
  boardId?: string
}

/**
 * Элемент истории поиска
 */
export interface SearchHistoryItem {
  id: string
  query: string
  timestamp: number
}

/**
 * Состояние поиска
 */
export interface SearchState {
  query: string
  tags: string[]
  sortBy: SortOption
  isSearching: boolean
  history: SearchHistoryItem[]
}

/**
 * Конфигурация сортировки
 */
export interface SortConfig {
  value: SortOption
  label: string
  icon: string
}
