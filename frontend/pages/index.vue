<template>
  <div class="home-page">
    <!-- Hero секция -->
    <section class="home-page__hero">
      <div class="home-page__container">
        <h1>Добро пожаловать в SnapBoard</h1>
        <p>Ваша визуальная доска вдохновения</p>
      </div>
    </section>
    
    <!-- Галерея с бесконечным скроллом -->
    <section class="home-page__gallery">
      <div class="home-page__container">
        <h2>{{ galleryTitle }}</h2>
        
        <!-- Masonry Grid -->
        <ImageMasonryGrid
          :images="displayedImages"
          :is-loading="isLoading && displayedImages.length === 0"
          :min-column-width="250"
          :gap="16"
          @image-click="handleImageClick"
        />
        
        <!-- Пустое состояние при поиске -->
        <div v-if="hasActiveFilters && !isLoading && displayedImages.length === 0" class="home-page__no-results">
          <div class="home-page__no-results-icon">🔍</div>
          <h3>Ничего не найдено</h3>
          <p>Попробуйте изменить параметры поиска</p>
          <button class="home-page__clear-btn" @click="clearFilters">
            Сбросить фильтры
          </button>
        </div>
        
        <!-- Infinite Scroll Loader (только если нет активных фильтров) -->
        <InfiniteScrollLoadMore
          v-if="!hasActiveFilters"
          :is-loading="isLoading"
          :has-more="hasMore"
          :error="error"
          :item-count="items.length"
          @retry="retry"
          @sentinel-mounted="handleSentinelMounted"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useInfiniteScroll } from '~/composables/useInfiniteScroll'
import { useSearch } from '~/composables/useSearch'
import type { Image } from '~/types'

// Используем infinite scroll для главной страницы
const {
  items,
  isLoading,
  hasMore,
  error,
  retry,
  sentinelRef
} = useInfiniteScroll({
  boardId: 'home',
  config: {
    pageSize: 12,
    threshold: 200,
    initialLoad: true
  }
})

// Поиск и фильтрация
const { filteredImages, hasActiveFilters, clearFilters } = useSearch()

// Отображаемые изображения с учётом фильтра
const displayedImages = computed(() => {
  if (hasActiveFilters.value) {
    return filteredImages.value
  }
  return items.value
})

// Заголовок галереи
const galleryTitle = computed(() => {
  if (hasActiveFilters.value) {
    return `Результаты поиска (${displayedImages.value.length})`
  }
  return 'Популярные изображения'
})

const handleSentinelMounted = (element: HTMLElement | null) => {
  sentinelRef.value = element
}

const handleImageClick = (image: Image) => {
  console.log('Image clicked:', image)
  // TODO: Открыть модальное окно с изображением
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.home-page
  width: 100%
  
  &__container
    max-width: $breakpoint-desktop
    margin: 0 auto
    padding: 0 24px
    
    @include mobile
      padding: 0 16px
  
  &__hero
    padding: 48px 0
    text-align: center
    
    h1
      font-size: 42px
      font-weight: 700
      color: $text-light
      margin-bottom: 16px
      
      @include mobile
        font-size: 32px
    
    p
      font-size: 18px
      color: $gray-500
  
  &__gallery
    padding: 32px 0 64px
    
    h2
      font-size: 28px
      font-weight: 700
      color: $text-light
      margin-bottom: 32px
      
      @include mobile
        font-size: 24px
  
  &__no-results
    text-align: center
    padding: 64px 24px
    background: white
    border-radius: $radius-lg
    
    &-icon
      font-size: 64px
      margin-bottom: 16px
    
    h3
      font-size: 24px
      color: $text-light
      margin-bottom: 8px
    
    p
      color: $gray-400
      margin-bottom: 24px
  
  &__clear-btn
    display: inline-flex
    align-items: center
    gap: 8px
    padding: 12px 24px
    background: $primary-color
    color: white
    border: none
    border-radius: $radius
    font-size: 16px
    font-weight: 600
    cursor: pointer
    transition: background $transition-fast
    
    &:hover
      background: darken($primary-color, 8%)
</style>
