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
        v-model="sortByModel"
      />
    </div>
    
    <div v-if="availableTags.length > 0" class="search-panel__filters">
      <CommonBaseTagInput
        mode="filter"
        label="Теги"
        :tags="availableTags"
        :selected-tags="selectedTags"
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
import { toRef, computed } from 'vue'
import { useSearch } from '~/composables/useSearch'
import type { Image } from '~/types/image'
import type { SortOption } from '~/types/search'

interface Props {
  boardId?: string
  images?: Image[]
}

const props = defineProps<Props>()

// Создаём реактивную ссылку на изображения
const imagesRef = toRef(props, 'images')

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
  setSortBy,
  removeFromHistory,
  clearHistory,
  clearFilters
} = useSearch(props.boardId, props.images ? imagesRef as any : undefined)

// Computed для v-model на sortBy
const sortByModel = computed({
  get: () => sortBy.value,
  set: (value: SortOption) => setSortBy(value)
})

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
  background: var(--card-bg)
  border-radius: $radius-lg
  box-shadow: var(--shadow-sm)
  border: 1px solid var(--card-border)

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
    border-top: 1px solid var(--border-light)

  &__status
    display: flex
    justify-content: space-between
    align-items: center
    padding-top: 12px
    border-top: 1px solid var(--border-light)

    @include mobile
      flex-direction: column
      gap: 12px
      align-items: flex-start

  &__results
    font-size: 14px
    color: var(--text-secondary)

  &__clear-all
    background: none
    border: none
    color: var(--accent-color)
    font-size: 14px
    font-weight: 500
    cursor: pointer

    &:hover
      text-decoration: underline
</style>
