/**
 * Состояние пагинации
 */
export interface PaginationState {
  page: number
  pageSize: number
  hasMore: boolean
  isLoading: boolean
  error: string | null
}

/**
 * Параметры запроса страницы
 */
export interface PageRequest {
  page: number
  pageSize: number
  boardId?: string
  query?: string
  tags?: string[]
  sortBy?: string
}

/**
 * Ответ с пагинированными данными
 */
export interface PaginatedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasMore: boolean
}

/**
 * Конфигурация Infinite Scroll
 */
export interface InfiniteScrollConfig {
  pageSize?: number
  threshold?: number
  initialLoad?: boolean
}

export const DEFAULT_INFINITE_SCROLL_CONFIG: InfiniteScrollConfig = {
  pageSize: 12,
  threshold: 100,
  initialLoad: true
}

/**
 * Состояние загрузки
 */
export type LoadingState = 'idle' | 'loading' | 'error' | 'end'
