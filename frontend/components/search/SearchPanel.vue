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
