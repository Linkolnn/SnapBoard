<template>
  <div class="home-page">
    <!-- Hero секция -->
    <section class="home-page__hero">
      <div class="home-page__container">
        <h1>Добро пожаловать в SnapBoard</h1>
        <p>Ваша визуальная доска вдохновения</p>
      </div>
    </section>
    
    <!-- Галерея с правильным контейнером -->
    <section class="home-page__gallery">
      <div class="home-page__container">
        <h2>Популярные изображения</h2>
        
        <!-- Masonry Grid - занимает всю ширину контейнера -->
        <ImageMasonryGrid
          :images="mockImages"
          :is-loading="isLoading"
          :min-column-width="250"
          :gap="16"
          @image-click="handleImageClick"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Image } from '~/types'

const isLoading = ref(true)

/**
 * Mock изображения с разными URL для тестирования
 */
const mockImages = ref<Image[]>([
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=350',
    title: 'Горный пейзаж',
    description: 'Удивительный вид на горы',
    boardId: '1',
    userId: '1',
    tags: ['природа', 'горы'],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300',
    title: 'Архитектура',
    description: 'Современное здание',
    boardId: '1',
    userId: '1',
    tags: ['архитектура'],
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&h=500',
    title: 'Интерьер',
    boardId: '1',
    userId: '1',
    tags: ['интерьер', 'дизайн'],
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400',
    title: 'Еда',
    description: 'Вкусная еда',
    boardId: '1',
    userId: '1',
    tags: ['еда'],
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=550',
    title: 'Мода',
    boardId: '1',
    userId: '1',
    tags: ['мода'],
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=350',
    title: 'Искусство',
    boardId: '1',
    userId: '1',
    tags: ['искусство'],
    createdAt: new Date().toISOString()
  },
  {
    id: '7',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=450',
    title: 'Путешествия',
    boardId: '1',
    userId: '1',
    tags: ['путешествия'],
    createdAt: new Date().toISOString()
  },
  {
    id: '8',
    url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=350',
    title: 'Природа',
    boardId: '1',
    userId: '1',
    tags: ['природа'],
    createdAt: new Date().toISOString()
  },
  {
    id: '9',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=450',
    title: 'Путешествия',
    boardId: '1',
    userId: '1',
    tags: ['путешествия'],
    createdAt: new Date().toISOString()
  },
])

const handleImageClick = (image: Image) => {
  console.log('Image clicked:', image)
}

onMounted(() => {
  // Имитация загрузки
  isLoading.value = false
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.home-page
  width: 100%
  
  // Контейнер с max-width и padding
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
</style>