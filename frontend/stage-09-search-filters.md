# Этап 9: Поиск и фильтрация (Search & Filters) SnapBoard

## 🎯 Цель этапа
Реализовать систему поиска и фильтрации изображений с debounce, историей поиска, фильтрами по тегам и сортировкой результатов.

---

## 📋 Чеклист этапа
- [ ] Типы для поиска и фильтрации
- [ ] Store для поиска (searchStore)
- [ ] Composable useSearch
- [ ] Компонент поисковой строки (SearchInput)
- [ ] Компонент фильтров по тегам (TagFilter)
- [ ] Компонент сортировки (SortSelect)
- [ ] Компонент истории поиска (SearchHistory)
- [ ] Компонент результатов поиска (SearchResults)
- [ ] Интеграция с существующими страницами
- [ ] Debounce для поиска
- [ ] Сохранение истории в localStorage

---

## 🗂️ Структура данных

### Файл: `types/search.ts`

```typescript
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
 * Опции сортировки
 */
export type SortOption = 'newest' | 'oldest' | 'title_asc' | 'title_desc'

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
```

---

## 1️⃣ Store для поиска

### Файл: `store/search.ts`

```typescript
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
    // State
    query,
    selectedTags,
    sortBy,
    isSearching,
    history,
    // Getters
    hasActiveFilters,
    activeFiltersCount,
    // Actions
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
```

---

## 2️⃣ Composable для поиска

### Файл: `composables/useSearch.ts`

```typescript
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSearchStore } from '~/store/search'
import { useImagesStore } from '~/store/images'
import type { Image } from '~/types/image'
import type { SortOption } from '~/types/search'

/**
 * Composable для поиска и фильтрации изображений
 */
export const useSearch = (boardId?: string) => {
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
   * Получение всех уникальных тегов из изображений
   */
  const availableTags = computed(() => {
    const images = boardId 
      ? imagesStore.imagesByBoard(boardId)
      : imagesStore.images

    const tagsSet = new Set<string>()
    images.forEach(img => {
      img.tags?.forEach(tag => tagsSet.add(tag))
    })
    
    return Array.from(tagsSet).sort()
  })

  /**
   * Фильтрация изображений
   */
  const filteredImages = computed(() => {
    let images = boardId 
      ? imagesStore.imagesByBoard(boardId)
      : imagesStore.images

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
    // State
    query,
    selectedTags,
    sortBy,
    isSearching,
    history,
    hasActiveFilters,
    activeFiltersCount,
    // Computed
    availableTags,
    filteredImages,
    resultsCount,
    // Actions
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
```

---

## 3️⃣ Утилита debounce

### Файл: `utils/debounce.ts`

```typescript
/**
 * Создаёт debounced версию функции
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }
}

/**
 * Composable для debounced значения
 */
export function useDebouncedRef<T>(initialValue: T, delay: number = 300) {
  const value = ref(initialValue) as Ref<T>
  const debouncedValue = ref(initialValue) as Ref<T>

  let timeoutId: ReturnType<typeof setTimeout> | null = null

  watch(value, (newValue) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      debouncedValue.value = newValue
      timeoutId = null
    }, delay)
  })

  return {
    value,
    debouncedValue
  }
}
```

---

## 4️⃣ Компонент поисковой строки

### Файл: `components/search/SearchInput.vue`

```vue
<template>
  <div class="search-input" :class="{ 'search-input--focused': isFocused }">
    <div class="search-input__icon">🔍</div>
    
    <input
      ref="inputRef"
      v-model="localQuery"
      type="text"
      class="search-input__field"
      :placeholder="placeholder"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown.enter="handleSubmit"
      @keydown.escape="handleClear"
    />
    
    <button
      v-if="localQuery"
      class="search-input__clear"
      type="button"
      @click="handleClear"
    >
      ✕
    </button>
    
    <div v-if="isLoading" class="search-input__loader"></div>
    
    <!-- Dropdown с историей -->
    <Transition name="dropdown">
      <div 
        v-if="showHistory && history.length > 0" 
        class="search-input__dropdown"
      >
        <div class="search-input__dropdown-header">
          <span>Недавние поиски</span>
          <button 
            class="search-input__dropdown-clear"
            @click.stop="$emit('clear-history')"
          >
            Очистить
          </button>
        </div>
        
        <ul class="search-input__dropdown-list">
          <li 
            v-for="item in history" 
            :key="item.id"
            class="search-input__dropdown-item"
            @click="selectHistoryItem(item.query)"
          >
            <span class="search-input__dropdown-icon">🕐</span>
            <span class="search-input__dropdown-text">{{ item.query }}</span>
            <button
              class="search-input__dropdown-remove"
              @click.stop="$emit('remove-history', item.id)"
            >
              ✕
            </button>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { SearchHistoryItem } from '~/types/search'
import { debounce } from '~/utils/debounce'

interface Props {
  modelValue: string
  placeholder?: string
  isLoading?: boolean
  history?: SearchHistoryItem[]
  debounceMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Поиск изображений...',
  isLoading: false,
  history: () => [],
  debounceMs: 300
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [query: string]
  'clear-history': []
  'remove-history': [id: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const localQuery = ref(props.modelValue)
const isFocused = ref(false)

const showHistory = computed(() => 
  isFocused.value && !localQuery.value && props.history.length > 0
)

// Debounced emit
const debouncedEmit = debounce((value: string) => {
  emit('update:modelValue', value)
  emit('search', value)
}, props.debounceMs)

watch(localQuery, (newValue) => {
  debouncedEmit(newValue)
})

watch(() => props.modelValue, (newValue) => {
  if (newValue !== localQuery.value) {
    localQuery.value = newValue
  }
})

const handleFocus = () => {
  isFocused.value = true
}

const handleBlur = () => {
  // Задержка для обработки клика по dropdown
  setTimeout(() => {
    isFocused.value = false
  }, 200)
}

const handleSubmit = () => {
  emit('search', localQuery.value)
}

const handleClear = () => {
  localQuery.value = ''
  emit('update:modelValue', '')
  emit('search', '')
  inputRef.value?.focus()
}

const selectHistoryItem = (query: string) => {
  localQuery.value = query
  emit('update:modelValue', query)
  emit('search', query)
}

const focus = () => {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.search-input
  position: relative
  display: flex
  align-items: center
  gap: 12px
  padding: 12px 16px
  background: white
  border: 2px solid $gray-200
  border-radius: $radius
  transition: all $transition-fast

  &--focused
    border-color: $primary-color
    box-shadow: 0 0 0 3px rgba($primary-color, 0.1)

  &__icon
    font-size: 18px
    color: $gray-400
    flex-shrink: 0

  &__field
    flex: 1
    border: none
    background: transparent
    font-size: 15px
    color: $text-light
    outline: none

    &::placeholder
      color: $gray-400

  &__clear
    display: flex
    align-items: center
    justify-content: center
    width: 24px
    height: 24px
    background: $gray-100
    border: none
    border-radius: 50%
    color: $gray-500
    font-size: 12px
    cursor: pointer
    transition: all $transition-fast

    &:hover
      background: $gray-200
      color: $text-light

  &__loader
    width: 20px
    height: 20px
    border: 2px solid $gray-200
    border-top-color: $primary-color
    border-radius: 50%
    animation: spin 0.8s linear infinite

  &__dropdown
    position: absolute
    top: calc(100% + 8px)
    left: 0
    right: 0
    background: white
    border: 1px solid $gray-200
    border-radius: $radius
    box-shadow: $shadow-lg
    z-index: $z-index-dropdown
    overflow: hidden

    &-header
      display: flex
      justify-content: space-between
      align-items: center
      padding: 12px 16px
      border-bottom: 1px solid $gray-100
      font-size: 13px
      color: $gray-500

    &-clear
      background: none
      border: none
      color: $primary-color
      font-size: 13px
      cursor: pointer

      &:hover
        text-decoration: underline

    &-list
      list-style: none
      max-height: 240px
      overflow-y: auto

    &-item
      display: flex
      align-items: center
      gap: 12px
      padding: 12px 16px
      cursor: pointer
      transition: background $transition-fast

      &:hover
        background: $gray-50

    &-icon
      font-size: 14px
      color: $gray-400

    &-text
      flex: 1
      font-size: 14px
      color: $text-light

    &-remove
      display: flex
      align-items: center
      justify-content: center
      width: 20px
      height: 20px
      background: transparent
      border: none
      color: $gray-400
      font-size: 10px
      cursor: pointer
      opacity: 0
      transition: all $transition-fast

      &:hover
        color: $error-color

    &-item:hover &-remove
      opacity: 1

// Анимации
.dropdown-enter-active,
.dropdown-leave-active
  transition: all 0.2s ease

.dropdown-enter-from,
.dropdown-leave-to
  opacity: 0
  transform: translateY(-8px)

@keyframes spin
  to
    transform: rotate(360deg)
</style>
```

---

## 5️⃣ Компонент фильтра по тегам

### Файл: `components/search/TagFilter.vue`

```vue
<template>
  <div class="tag-filter">
    <div class="tag-filter__header">
      <span class="tag-filter__title">{{ title }}</span>
      <button
        v-if="selectedTags.length > 0"
        class="tag-filter__clear"
        @click="clearTags"
      >
        Сбросить
      </button>
    </div>
    
    <div class="tag-filter__tags">
      <button
        v-for="tag in displayedTags"
        :key="tag"
        class="tag-filter__tag"
        :class="{ 'tag-filter__tag--active': selectedTags.includes(tag) }"
        @click="toggleTag(tag)"
      >
        #{{ tag }}
      </button>
      
      <button
        v-if="hasMoreTags"
        class="tag-filter__more"
        @click="showAll = !showAll"
      >
        {{ showAll ? 'Свернуть' : `+${hiddenTagsCount} ещё` }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  tags: string[]
  selectedTags: string[]
  title?: string
  maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Теги',
  maxVisible: 8
})

const emit = defineEmits<{
  'update:selectedTags': [tags: string[]]
  'toggle': [tag: string]
}>()

const showAll = ref(false)

const displayedTags = computed(() => {
  if (showAll.value || props.tags.length <= props.maxVisible) {
    return props.tags
  }
  return props.tags.slice(0, props.maxVisible)
})

const hasMoreTags = computed(() => props.tags.length > props.maxVisible)

const hiddenTagsCount = computed(() => 
  props.tags.length - props.maxVisible
)

const toggleTag = (tag: string) => {
  emit('toggle', tag)
  
  const newTags = props.selectedTags.includes(tag)
    ? props.selectedTags.filter(t => t !== tag)
    : [...props.selectedTags, tag]
  
  emit('update:selectedTags', newTags)
}

const clearTags = () => {
  emit('update:selectedTags', [])
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.tag-filter
  &__header
    display: flex
    justify-content: space-between
    align-items: center
    margin-bottom: 12px

  &__title
    font-size: 14px
    font-weight: 600
    color: $text-light

  &__clear
    background: none
    border: none
    color: $primary-color
    font-size: 13px
    cursor: pointer

    &:hover
      text-decoration: underline

  &__tags
    display: flex
    flex-wrap: wrap
    gap: 8px

  &__tag
    padding: 6px 12px
    background: $gray-100
    border: 2px solid transparent
    border-radius: $radius-full
    font-size: 13px
    font-weight: 500
    color: $gray-600
    cursor: pointer
    transition: all $transition-fast

    &:hover
      background: $gray-200

    &--active
      background: rgba($primary-color, 0.1)
      border-color: $primary-color
      color: $primary-color

  &__more
    padding: 6px 12px
    background: transparent
    border: 2px dashed $gray-300
    border-radius: $radius-full
    font-size: 13px
    color: $gray-500
    cursor: pointer
    transition: all $transition-fast

    &:hover
      border-color: $primary-color
      color: $primary-color
</style>
```

---

## 6️⃣ Компонент сортировки

### Файл: `components/search/SortSelect.vue`

```vue
<template>
  <div class="sort-select" :class="{ 'sort-select--open': isOpen }">
    <button 
      class="sort-select__trigger"
      @click="toggleDropdown"
    >
      <span class="sort-select__icon">{{ currentOption?.icon }}</span>
      <span class="sort-select__label">{{ currentOption?.label }}</span>
      <span class="sort-select__arrow">▼</span>
    </button>
    
    <Transition name="dropdown">
      <div v-if="isOpen" class="sort-select__dropdown">
        <button
          v-for="option in options"
          :key="option.value"
          class="sort-select__option"
          :class="{ 'sort-select__option--active': modelValue === option.value }"
          @click="selectOption(option.value)"
        >
          <span class="sort-select__option-icon">{{ option.icon }}</span>
          <span class="sort-select__option-label">{{ option.label }}</span>
          <span 
            v-if="modelValue === option.value" 
            class="sort-select__option-check"
          >
            ✓
          </span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { SortOption, SortConfig } from '~/types/search'

interface Props {
  modelValue: SortOption
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: SortOption]
}>()

const isOpen = ref(false)

const options: SortConfig[] = [
  { value: 'newest', label: 'Сначала новые', icon: '🕐' },
  { value: 'oldest', label: 'Сначала старые', icon: '📅' },
  { value: 'title_asc', label: 'По названию (А-Я)', icon: '🔤' },
  { value: 'title_desc', label: 'По названию (Я-А)', icon: '🔠' }
]

const currentOption = computed(() => 
  options.find(opt => opt.value === props.modelValue)
)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (value: SortOption) => {
  emit('update:modelValue', value)
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.sort-select')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.sort-select
  position: relative

  &__trigger
    display: flex
    align-items: center
    gap: 8px
    padding: 10px 16px
    background: white
    border: 2px solid $gray-200
    border-radius: $radius
    font-size: 14px
    color: $text-light
    cursor: pointer
    transition: all $transition-fast

    &:hover
      border-color: $gray-300

  &--open &__trigger
    border-color: $primary-color

  &__icon
    font-size: 16px

  &__label
    font-weight: 500

  &__arrow
    font-size: 10px
    color: $gray-400
    transition: transform $transition-fast

  &--open &__arrow
    transform: rotate(180deg)

  &__dropdown
    position: absolute
    top: calc(100% + 8px)
    right: 0
    min-width: 200px
    background: white
    border: 1px solid $gray-200
    border-radius: $radius
    box-shadow: $shadow-lg
    z-index: $z-index-dropdown
    overflow: hidden

  &__option
    display: flex
    align-items: center
    gap: 12px
    width: 100%
    padding: 12px 16px
    background: transparent
    border: none
    font-size: 14px
    color: $text-light
    cursor: pointer
    transition: background $transition-fast
    text-align: left

    &:hover
      background: $gray-50

    &--active
      background: rgba($primary-color, 0.05)
      color: $primary-color

    &-icon
      font-size: 16px

    &-label
      flex: 1

    &-check
      color: $primary-color
      font-weight: 600

// Анимации
.dropdown-enter-active,
.dropdown-leave-active
  transition: all 0.2s ease

.dropdown-enter-from,
.dropdown-leave-to
  opacity: 0
  transform: translateY(-8px)
</style>
```

---

## 7️⃣ Компонент панели поиска (объединяющий)

### Файл: `components/search/SearchPanel.vue`

```vue
<template>
  <div class="search-panel">
    <div class="search-panel__main">
      <SearchInput
        v-model="query"
        :is-loading="isSearching"
        :history="history"
        @search="handleSearch"
        @clear-history="clearHistory"
        @remove-history="removeFromHistory"
      />
      
      <SearchSortSelect
        v-model="sortBy"
      />
    </div>
    
    <div v-if="availableTags.length > 0" class="search-panel__filters">
      <SearchTagFilter
        :tags="availableTags"
        :selected-tags="selectedTags"
        @update:selected-tags="setTags"
        @toggle="toggleTag"
      />
    </div>
    
    <div v-if="hasActiveFilters" class="search-panel__status">
      <span class="search-panel__results">
        Найдено: {{ resultsCount }} изображений
      </span>
      <button 
        class="search-panel__clear-all"
        @click="clearFilters"
      >
        Сбросить фильтры
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSearch } from '~/composables/useSearch'

interface Props {
  boardId?: string
}

const props = defineProps<Props>()

const {
  query,
  selectedTags,
  sortBy,
  isSearching,
  history,
  hasActiveFilters,
  availableTags,
  resultsCount,
  search,
  setTags,
  toggleTag,
  removeFromHistory,
  clearHistory,
  clearFilters
} = useSearch(props.boardId)

const handleSearch = (searchQuery: string) => {
  search(searchQuery)
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.search-panel
  display: flex
  flex-direction: column
  gap: 16px
  padding: 20px
  background: white
  border-radius: $radius-lg
  box-shadow: $shadow-sm

  @include mobile
    padding: 16px
    border-radius: $radius

  &__main
    display: flex
    gap: 12px

    @include mobile
      flex-direction: column

  &__filters
    padding-top: 16px
    border-top: 1px solid $gray-100

  &__status
    display: flex
    justify-content: space-between
    align-items: center
    padding-top: 12px
    border-top: 1px solid $gray-100

    @include mobile
      flex-direction: column
      gap: 12px
      align-items: flex-start

  &__results
    font-size: 14px
    color: $gray-500

  &__clear-all
    background: none
    border: none
    color: $primary-color
    font-size: 14px
    font-weight: 500
    cursor: pointer

    &:hover
      text-decoration: underline
</style>
```

---

## 8️⃣ Интеграция с страницей доски

### Обновление `pages/boards/[id].vue`

Добавляем панель поиска в страницу доски:

```vue
<template>
  <main class="board-page">
    <div class="board-page__container">
      <!-- ... существующий header ... -->

      <template v-if="currentBoard">
        <!-- Панель поиска -->
        <SearchPanel 
          :board-id="boardId" 
          class="board-page__search"
        />

        <!-- Галерея с отфильтрованными изображениями -->
        <section class="board-page__gallery">
          <div v-if="filteredImages.length" class="board-page__images">
            <article 
              v-for="image in filteredImages" 
              :key="image.id" 
              class="board-page__image"
              @click="handleImageClick(image)"
            >
              <img :src="image.url" :alt="image.title" loading="lazy" />
            </article>
          </div>

          <!-- Пустое состояние при поиске -->
          <div v-else-if="hasActiveFilters" class="board-page__no-results">
            <div class="board-page__no-results-icon">🔍</div>
            <h2>Ничего не найдено</h2>
            <p>Попробуйте изменить параметры поиска</p>
            <button 
              class="board-page__clear-btn"
              @click="clearFilters"
            >
              Сбросить фильтры
            </button>
          </div>

          <!-- Пустое состояние без изображений -->
          <div v-else class="board-page__empty">
            <!-- ... существующий код ... -->
          </div>
        </section>
      </template>
    </div>
    
    <!-- ... остальные модалки ... -->
  </main>
</template>

<script setup lang="ts">
import { useSearch } from '~/composables/useSearch'

// ... существующий код ...

const boardId = computed(() => route.params.id as string)

// Используем useSearch для фильтрации
const { 
  filteredImages, 
  hasActiveFilters, 
  clearFilters 
} = useSearch(boardId.value)

// Обновляем handleImageClick для работы с filteredImages
const handleImageClick = (image: Image) => {
  selectedImage.value = image
  selectedImageIndex.value = filteredImages.value.findIndex(img => img.id === image.id)
  isImageModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

// Обновляем imageViewContext
const imageViewContext = computed<ImageViewContext>(() => ({
  currentIndex: selectedImageIndex.value,
  totalImages: filteredImages.value.length,
  hasNext: selectedImageIndex.value < filteredImages.value.length - 1,
  hasPrev: selectedImageIndex.value > 0
}))

// Обновляем навигацию
const nextImage = () => {
  if (imageViewContext.value.hasNext) {
    selectedImageIndex.value++
    selectedImage.value = filteredImages.value[selectedImageIndex.value] ?? null
  }
}

const prevImage = () => {
  if (imageViewContext.value.hasPrev) {
    selectedImageIndex.value--
    selectedImage.value = filteredImages.value[selectedImageIndex.value] ?? null
  }
}
</script>

<style lang="sass" scoped>
// Добавляем стили для поиска
.board-page
  &__search
    margin-bottom: 24px

  &__no-results
    text-align: center
    padding: 64px 24px
    background: white
    border-radius: $radius-lg

    &-icon
      font-size: 64px
      margin-bottom: 16px

    h2
      font-size: 24px
      color: $text-light
      margin-bottom: 8px

    p
      color: $gray-400
      margin-bottom: 24px

  &__clear-btn
    padding: 12px 24px
    background: $primary-color
    color: white
    border: none
    border-radius: $radius
    font-size: 16px
    font-weight: 600
    cursor: pointer
</style>
```

---

## 9️⃣ Глобальная страница поиска (опционально)

### Файл: `pages/search.vue`

```vue
<template>
  <main class="search-page">
    <div class="search-page__container">
      <header class="search-page__header">
        <h1 class="search-page__title">Поиск</h1>
      </header>

      <SearchPanel class="search-page__panel" />

      <section class="search-page__results">
        <div v-if="isSearching" class="search-page__loading">
          <div class="search-page__spinner"></div>
          <p>Поиск...</p>
        </div>

        <div v-else-if="filteredImages.length" class="search-page__grid">
          <article 
            v-for="image in filteredImages" 
            :key="image.id" 
            class="search-page__image"
            @click="handleImageClick(image)"
          >
            <img :src="image.url" :alt="image.title" loading="lazy" />
            <div class="search-page__image-overlay">
              <h3>{{ image.title || 'Без названия' }}</h3>
              <div v-if="image.tags?.length" class="search-page__image-tags">
                <span v-for="tag in image.tags.slice(0, 3)" :key="tag">#{{ tag }}</span>
              </div>
            </div>
          </article>
        </div>

        <div v-else-if="hasActiveFilters" class="search-page__empty">
          <div class="search-page__empty-icon">🔍</div>
          <h2>Ничего не найдено</h2>
          <p>Попробуйте изменить параметры поиска</p>
        </div>

        <div v-else class="search-page__empty">
          <div class="search-page__empty-icon">🖼️</div>
          <h2>Начните поиск</h2>
          <p>Введите запрос или выберите теги для поиска изображений</p>
        </div>
      </section>
    </div>

    <ImageModal
      v-if="selectedImage"
      :is-open="isImageModalOpen"
      :image="selectedImage"
      :view-context="imageViewContext"
      @close="closeImageModal"
      @next="nextImage"
      @prev="prevImage"
      @update="handleImageUpdate"
      @delete="handleImageDelete"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSearch } from '~/composables/useSearch'
import { useImages } from '~/composables/useImages'
import type { Image, ImageViewContext } from '~/types/image'

const { loadBoardImages } = useImages()
const { 
  filteredImages, 
  isSearching, 
  hasActiveFilters 
} = useSearch()

const isImageModalOpen = ref(false)
const selectedImage = ref<Image | null>(null)
const selectedImageIndex = ref(-1)

const imageViewContext = computed<ImageViewContext>(() => ({
  currentIndex: selectedImageIndex.value,
  totalImages: filteredImages.value.length,
  hasNext: selectedImageIndex.value < filteredImages.value.length - 1,
  hasPrev: selectedImageIndex.value > 0
}))

const handleImageClick = (image: Image) => {
  selectedImage.value = image
  selectedImageIndex.value = filteredImages.value.findIndex(img => img.id === image.id)
  isImageModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeImageModal = () => {
  isImageModalOpen.value = false
  selectedImage.value = null
  selectedImageIndex.value = -1
  document.body.style.overflow = ''
}

const nextImage = () => {
  if (imageViewContext.value.hasNext) {
    selectedImageIndex.value++
    selectedImage.value = filteredImages.value[selectedImageIndex.value] ?? null
  }
}

const prevImage = () => {
  if (imageViewContext.value.hasPrev) {
    selectedImageIndex.value--
    selectedImage.value = filteredImages.value[selectedImageIndex.value] ?? null
  }
}

const handleImageUpdate = (updatedImage: Image) => {
  selectedImage.value = updatedImage
}

const handleImageDelete = () => {
  if (filteredImages.value.length <= 1) {
    closeImageModal()
  } else if (selectedImageIndex.value >= filteredImages.value.length - 1) {
    selectedImageIndex.value--
    selectedImage.value = filteredImages.value[selectedImageIndex.value] ?? null
  } else {
    selectedImage.value = filteredImages.value[selectedImageIndex.value] ?? null
  }
}

onMounted(() => {
  // Загружаем все изображения для глобального поиска
  // В реальном приложении здесь будет API запрос
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.search-page
  min-height: 100vh
  background: $gray-50
  padding: 32px 0

  @include mobile
    padding: 16px 0

  &__container
    max-width: $breakpoint-desktop
    margin: 0 auto
    padding: 0 24px

    @include mobile
      padding: 0 16px

  &__header
    margin-bottom: 24px

  &__title
    font-size: 32px
    font-weight: 700
    color: $text-light

    @include mobile
      font-size: 28px

  &__panel
    margin-bottom: 32px

  &__loading
    text-align: center
    padding: 64px 24px

  &__spinner
    width: 48px
    height: 48px
    border: 3px solid $gray-200
    border-top-color: $primary-color
    border-radius: 50%
    margin: 0 auto 16px
    animation: spin 1s linear infinite

  &__grid
    display: grid
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))
    gap: 16px

    @include mobile
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr))
      gap: 12px

  &__image
    position: relative
    border-radius: $radius
    overflow: hidden
    cursor: pointer
    transition: transform $transition-fast

    img
      width: 100%
      height: auto
      display: block

    &:hover
      transform: translateY(-4px)

      .search-page__image-overlay
        opacity: 1

  &__image-overlay
    position: absolute
    inset: 0
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 50%)
    display: flex
    flex-direction: column
    justify-content: flex-end
    padding: 16px
    opacity: 0
    transition: opacity $transition-fast

    @include mobile
      opacity: 1

    h3
      color: white
      font-size: 14px
      font-weight: 600
      margin-bottom: 8px

  &__image-tags
    display: flex
    flex-wrap: wrap
    gap: 6px

    span
      padding: 2px 8px
      background: rgba(white, 0.2)
      color: white
      border-radius: $radius-sm
      font-size: 12px

  &__empty
    text-align: center
    padding: 64px 24px
    background: white
    border-radius: $radius-lg

    &-icon
      font-size: 64px
      margin-bottom: 16px

    h2
      font-size: 24px
      color: $text-light
      margin-bottom: 8px

    p
      color: $gray-400

@keyframes spin
  to
    transform: rotate(360deg)
</style>
```

---

## 🔟 Структура файлов этапа

```
frontend/
├── types/
│   └── search.ts              # Типы для поиска
├── store/
│   └── search.ts              # Store поиска
├── composables/
│   └── useSearch.ts           # Composable для поиска
├── utils/
│   └── debounce.ts            # Утилита debounce
├── components/
│   └── search/
│       ├── SearchInput.vue    # Поисковая строка
│       ├── TagFilter.vue      # Фильтр по тегам
│       ├── SortSelect.vue     # Выбор сортировки
│       └── SearchPanel.vue    # Объединяющая панель
└── pages/
    ├── search.vue             # Глобальная страница поиска
    └── boards/
        └── [id].vue           # Обновлённая страница доски
```

---

## ⌨️ Keyboard Shortcuts

| Клавиша | Действие |
|---------|----------|
| `Enter` | Выполнить поиск |
| `Escape` | Очистить поисковую строку |
| `/` | Фокус на поисковую строку (опционально) |

---

## ✅ Чеклист выполнения

### Типы и интерфейсы
- [ ] `SearchParams` - параметры поиска
- [ ] `SortOption` - опции сортировки
- [ ] `SearchHistoryItem` - элемент истории
- [ ] `SearchState` - состояние поиска
- [ ] `SortConfig` - конфигурация сортировки

### Store и Composables
- [ ] `useSearchStore` - store для поиска
- [ ] `useSearch` - composable для поиска
- [ ] `debounce` - утилита debounce

### Компоненты
- [ ] `SearchInput` - поисковая строка с историей
- [ ] `TagFilter` - фильтр по тегам
- [ ] `SortSelect` - выбор сортировки
- [ ] `SearchPanel` - объединяющая панель

### Функционал
- [ ] Поиск по названию и описанию
- [ ] Поиск по тегам
- [ ] Фильтрация по выбранным тегам
- [ ] Сортировка результатов
- [ ] Debounce для поиска (300ms)
- [ ] История поиска в localStorage
- [ ] Очистка истории
- [ ] Сброс всех фильтров
- [ ] Счётчик результатов

### Интеграция
- [ ] Интеграция с страницей доски
- [ ] Глобальная страница поиска (опционально)
- [ ] Обновление навигации в модалке

---

## 🎯 Результат этапа

После выполнения этого этапа у вас будет:

1. **Поисковая строка** - с debounce и историей поиска
2. **Фильтр по тегам** - выбор нескольких тегов
3. **Сортировка** - по дате и названию
4. **История поиска** - сохранение в localStorage
5. **Панель поиска** - объединяющий компонент
6. **Интеграция** - работа на странице доски
7. **Адаптивность** - корректное отображение на всех устройствах

---

## 🔜 Следующий этап

**Этап 10: Бесконечный скролл**
- Intersection Observer API
- Пагинация данных
- Loader для подгрузки
- Обработка конца списка
- Виртуализация (опционально)

Готов к следующему этапу! 🚀
