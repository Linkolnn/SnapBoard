<template>
  <div class="home-page">
    <section class="home-page__hero">
      <h1>Добро пожаловать в SnapBoard</h1>
      <p>Ваша визуальная доска вдохновения</p>
    </section>
    
    <section class="home-page__gallery">
      <h2>Популярные изображения</h2>
      
      <!-- Masonry Grid с изображениями -->
      <ImageMasonryGrid
        :images="mockImages"
        :is-loading="isLoading"
        @image-click="handleImageClick"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Image } from '~/types'

/**
 * Состояние загрузки
 */
const isLoading = ref(true)

/**
 * Mock данные изображений для демонстрации
 * В реальном приложении будут загружаться с API
 */
const mockImages = ref<Image[]>([
  {
    id: '1',
    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaA23Orn8cIauyUDtC-hmrUTguMwW9q5kyvg&s',
    title: 'Красивый пейзаж',
    description: 'Удивительный вид на горы',
    boardId: '1',
    userId: '1',
    tags: ['природа', 'горы', 'пейзаж'],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    url: 'https://picsum.photos/400/300',
    title: 'Архитектура',
    description: 'Современное здание',
    boardId: '1',
    userId: '1',
    tags: ['архитектура', 'дизайн'],
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    url: 'https://picsum.photos/400/500',
    title: 'Интерьер',
    boardId: '1',
    userId: '1',
    tags: ['интерьер', 'дизайн', 'уют'],
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    url: 'https://picsum.photos/400/400',
    title: 'Еда',
    description: 'Вкусная еда',
    boardId: '1',
    userId: '1',
    tags: ['еда', 'рецепты'],
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    url: 'https://picsum.photos/400/550',
    title: 'Мода',
    boardId: '1',
    userId: '1',
    tags: ['мода', 'стиль'],
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    url: 'https://picsum.photos/400/350',
    title: 'Искусство',
    boardId: '1',
    userId: '1',
    tags: ['искусство'],
    createdAt: new Date().toISOString()
  }
])

/**
 * Обработчик клика по изображению
 * Здесь можно открыть модальное окно с деталями
 */
const handleImageClick = (image: Image) => {
  console.log('Image clicked:', image)
  // В следующем этапе откроем модальное окно
}

/**
 * Имитация загрузки данных
 */
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.home-page
  padding: 32px 0
  
  &__hero
    text-align: center
    margin-bottom: 48px
    
    h1
      font-size: 42px
      font-weight: 700
      color: $text-light
      margin-bottom: 16px
    
    p
      font-size: 18px
      color: $gray-500
  
  &__gallery
    h2
      font-size: 28px
      font-weight: 700
      color: $text-light
      margin-bottom: 32px
</style>