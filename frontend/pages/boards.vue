<template>
  <div class="boards-page">
    <!-- Breadcrumbs для навигации -->
    <LayoutBreadcrumbs :crumbs="breadcrumbs" />
    
    <!-- Layout с сеткой: Sidebar + Контент -->
    <div class="boards-page__layout">
      <!-- Sidebar с фильтрами -->
      <LayoutSideBar title="Фильтры">
        <!-- Здесь будут фильтры - пока заглушка -->
        <div class="filter-section">
          <h4>Категории</h4>
          <ul>
            <li>Дизайн</li>
            <li>Путешествия</li>
            <li>Рецепты</li>
            <li>Мода</li>
          </ul>
        </div>
      </LayoutSideBar>
      
      <!-- Основной контент -->
      <section class="boards-page__content">
        <h1>Мои доски</h1>
        <p>Здесь будет список досок с изображениями</p>
        
        <!-- Grid с досками - будет реализовано позже -->
        <div class="boards-grid">
          <CommonBaseCard v-for="i in 6" :key="i" :clickable="true">
            <div class="board-card">
              <div class="board-card__preview">
                <!-- Здесь будут изображения -->
                <div class="board-card__placeholder"></div>
              </div>
              <div class="board-card__info">
                <h3>Доска {{ i }}</h3>
                <p>12 изображений</p>
              </div>
            </div>
          </CommonBaseCard>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Хлебные крошки для этой страницы
 */
const breadcrumbs = [
  { text: 'Главная', link: '/' },
  { text: 'Мои доски', link: '/boards' }
]
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.boards-page
  // Layout с сеткой: sidebar слева, контент справа
  &__layout
    display: grid
    grid-template-columns: auto 1fr
    gap: 32px
    
    // На планшетах убираем sidebar (он скрыт через @include tablet)
    @include tablet
      grid-template-columns: 1fr
  
  // Основной контент справа от sidebar
  &__content
    min-width: 0 // чтобы grid не переполнялся
    
    h1
      font-size: 32px
      margin-bottom: 24px
      color: $text-light

// Grid с досками
.boards-grid
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))
  gap: 24px
  margin-top: 32px

// Карточка доски (пример)
.board-card
  &__preview
    height: 200px
    background: $gray-200
    border-radius: $radius-sm
    overflow: hidden
  
  &__placeholder
    width: 100%
    height: 100%
    background: linear-gradient(135deg, $gray-200 0%, $gray-300 100%)
  
  &__info
    padding: 16px
    
    h3
      font-size: 18px
      margin-bottom: 8px
      color: $text-light
    
    p
      font-size: 14px
      color: $gray-500
      margin: 0

// Секция фильтров в sidebar (заглушка)
.filter-section
  h4
    font-size: 14px
    font-weight: 600
    margin-bottom: 8px
    color: $text-light
  
  ul
    list-style: none
    display: flex
    flex-direction: column
    gap: 8px
    
    li
      font-size: 14px
      color: $gray-500
      cursor: pointer
      transition: color $transition-fast
      
      &:hover
        color: $primary-color
</style>