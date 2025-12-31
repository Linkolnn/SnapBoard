import { ref, computed, watch, onMounted, onUnmounted, type Ref, type ComputedRef, unref, isRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useImagesStore } from '~/store/images'
import { useSearchStore } from '~/store/search'
import type { Image } from '~/types/image'
import type { InfiniteScrollConfig, LoadingState, PageRequest } from '~/types/pagination'
import { DEFAULT_INFINITE_SCROLL_CONFIG } from '~/types/pagination'

interface UseInfiniteScrollOptions {
  boardId?: string | Ref<string>
  config?: InfiniteScrollConfig
}

interface UseInfiniteScrollReturn {
  items: ComputedRef<Image[]>
  isLoading: ComputedRef<boolean>
  hasMore: ComputedRef<boolean>
  error: ComputedRef<string | null>
  page: ComputedRef<number>
  loadingState: ComputedRef<LoadingState>
  loadMore: () => Promise<void>
  reset: () => Promise<void>
  retry: () => Promise<void>
  sentinelRef: Ref<HTMLElement | null>
  observerActive: Ref<boolean>
}

/**
 * Composable для бесконечного скролла
 */
export function useInfiniteScroll(options: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const { boardId, config = {} } = options
  const mergedConfig = { ...DEFAULT_INFINITE_SCROLL_CONFIG, ...config }
  
  // Получаем текущее значение boardId (поддержка реактивных и обычных значений)
  const getCurrentBoardId = () => {
    const id = unref(boardId)
    return id === 'home' || !id ? undefined : id
  }
  
  const imagesStore = useImagesStore()
  const searchStore = useSearchStore()
  
  const { pagination, images } = storeToRefs(imagesStore)
  const { query, selectedTags, sortBy } = storeToRefs(searchStore)
  
  const sentinelRef = ref<HTMLElement | null>(null)
  const observerActive = ref(true)
  const observer = ref<IntersectionObserver | null>(null)
  const isLoadingLock = ref(false) // Защита от множественных вызовов
  const isInitialized = ref(false) // Флаг первой загрузки
  const isResetting = ref(false) // Защита от множественных reset
  
  const items = computed(() => images.value)
  const isLoading = computed(() => pagination.value.isLoading)
  const hasMore = computed(() => pagination.value.hasMore)
  const error = computed(() => pagination.value.error)
  const page = computed(() => pagination.value.page)
  
  const loadingState = computed<LoadingState>(() => {
    if (pagination.value.isLoading) return 'loading'
    if (pagination.value.error) return 'error'
    if (!pagination.value.hasMore) return 'end'
    return 'idle'
  })

  const createPageRequest = (pageNum: number): PageRequest => ({
    page: pageNum,
    pageSize: mergedConfig.pageSize!,
    boardId: getCurrentBoardId(),
    query: query.value || undefined,
    tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
    sortBy: sortBy.value
  })

  const loadMore = async (): Promise<void> => {
    // Защита от множественных одновременных вызовов
    if (isLoadingLock.value || pagination.value.isLoading || !pagination.value.hasMore) {
      return
    }

    // Устанавливаем блокировку СРАЗУ, синхронно
    isLoadingLock.value = true
    imagesStore.updatePagination({ isLoading: true })

    try {
      const request = createPageRequest(pagination.value.page)
      const response = await imagesStore.fetchPagedImages(request)
      
      imagesStore.appendImages(response.items)
      
      imagesStore.updatePagination({
        page: pagination.value.page + 1,
        hasMore: response.hasMore,
        isLoading: false
      })
      
      if (!response.hasMore) {
        stopObserver()
      }
    } catch (e) {
      console.error('Error loading more images:', e)
      imagesStore.updatePagination({ isLoading: false })
    } finally {
      isLoadingLock.value = false
    }
  }

  const reset = async (): Promise<void> => {
    // Защита от множественных reset
    if (isResetting.value) {
      return
    }
    isResetting.value = true
    
    // Останавливаем observer перед сбросом
    stopObserver()
    isLoadingLock.value = false
    
    imagesStore.resetPagination()
    
    // Перезапускаем observer
    startObserver()
    
    if (mergedConfig.initialLoad) {
      await loadMore()
    }
    
    isResetting.value = false
  }

  const retry = async (): Promise<void> => {
    imagesStore.setPaginationError(null)
    await loadMore()
  }

  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    const entry = entries[0]
    if (entry?.isIntersecting && observerActive.value) {
      loadMore()
    }
  }

  const startObserver = () => {
    if (!sentinelRef.value || observer.value) return
    
    observer.value = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: `${mergedConfig.threshold}px`,
      threshold: 0
    })
    
    observer.value.observe(sentinelRef.value)
    observerActive.value = true
  }

  const stopObserver = () => {
    if (observer.value) {
      observer.value.disconnect()
      observer.value = null
    }
    observerActive.value = false
  }

  // Убран watch на selectedTags/sortBy - reset вызывается явно из компонентов
  // чтобы избежать множественных вызовов

  watch(sentinelRef, (newRef) => {
    if (newRef) {
      startObserver()
    } else {
      stopObserver()
    }
  })

  onMounted(() => {
    if (mergedConfig.initialLoad && !isInitialized.value) {
      isInitialized.value = true
      loadMore()
    }
  })

  onUnmounted(() => {
    stopObserver()
  })

  return {
    items,
    isLoading,
    hasMore,
    error,
    page,
    loadingState,
    loadMore,
    reset,
    retry,
    sentinelRef,
    observerActive
  }
}
