<template>
    <!-- 
      Карточка изображения для Masonry Grid
      - Lazy loading (загружается только когда в зоне видимости)
      - Skeleton loader пока загружается
      - Hover эффекты
      - Клик для открытия детального просмотра
    -->
    <article 
      ref="cardRef"
      class="image-card"
      :class="{ 'image-card--loaded': isLoaded }"
      @click="handleClick"
    >
      <!-- Skeleton loader пока изображение загружается -->
      <ImageSkeleton 
        v-if="!isLoaded"
        :height="estimatedHeight"
      />
      
      <!-- Само изображение -->
      <img
        v-show="isLoaded"
        :src="image.url"
        :alt="image.title || 'Image'"
        class="image-card__img"
        loading="lazy"
        @load="handleImageLoad"
        @error="handleImageError"
      />
      
      <!-- Overlay с информацией (показывается при hover) -->
      <div v-if="isLoaded" class="image-card__overlay">
        <div class="image-card__info">
          <h3 v-if="image.title" class="image-card__title">
            {{ image.title }}
          </h3>
          <p v-if="image.description" class="image-card__desc">
            {{ image.description }}
          </p>
          
          <!-- Теги -->
          <div v-if="image.tags && image.tags.length > 0" class="image-card__tags">
            <span 
              v-for="tag in image.tags.slice(0, 3)" 
              :key="tag"
              class="image-card__tag"
            >
              #{{ tag }}
            </span>
          </div>
        </div>
      </div>
    </article>
  </template>
  
  <script setup lang="ts">
  import type { Image } from '~/types'
  
  /**
   * Пропсы компонента
   */
  interface Props {
    image: Image           // данные изображения
    estimatedHeight?: number  // примерная высота для skeleton
  }
  
  const props = withDefaults(defineProps<Props>(), {
    estimatedHeight: 300
  })
  
  /**
   * Эмиты компонента
   */
  const emit = defineEmits<{
    click: [image: Image]      // клик по карточке
    load: [height: number]     // изображение загрузилось
  }>()
  
  /**
   * Ссылка на DOM элемент карточки
   */
  const cardRef = ref<HTMLElement | null>(null)
  
  /**
   * Состояние загрузки изображения
   */
  const isLoaded = ref(false)
  
  /**
   * Высота загруженного изображения
   */
  const imageHeight = ref(0)
  
  /**
   * Обработчик загрузки изображения
   * Вычисляем высоту и сообщаем родителю
   */
  const handleImageLoad = (event: Event) => {
    const img = event.target as HTMLImageElement
    
    // Получаем реальную высоту изображения
    imageHeight.value = img.naturalHeight
    isLoaded.value = true
    
    // Сообщаем родителю высоту для Masonry layout
    emit('load', img.offsetHeight)
  }
  
  /**
   * Обработчик ошибки загрузки изображения
   */
  const handleImageError = (event: Event) => {
    console.error('Failed to load image:', props.image.url)
    // Можно показать placeholder вместо изображения
    isLoaded.value = true
  }
  
  /**
   * Обработчик клика по карточке
   */
  const handleClick = () => {
    if (isLoaded.value) {
      emit('click', props.image)
    }
  }
  </script>
  
  <style lang="sass" scoped>
  @import '@/assets/styles/variables'
  
  .image-card
    position: relative
    width: 100%
    border-radius: $radius
    overflow: hidden
    cursor: pointer
    background: $gray-200
    // Плавный переход для всех изменений
    transition: all $transition-normal
    
    // При наведении поднимаем карточку
    &:hover
      transform: translateY(-4px)
      box-shadow: $shadow-lg
      
      // Показываем overlay при hover
      .image-card__overlay
        opacity: 1
    
    // Изображение
    &__img
      width: 100%
      height: auto
      display: block
      // Плавное появление изображения
      animation: fadeIn 0.3s ease-in
    
    // Overlay с информацией
    &__overlay
      position: absolute
      top: 0
      left: 0
      right: 0
      bottom: 0
      background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.7) 100%)
      display: flex
      align-items: flex-end
      padding: 16px
      // Скрыт по умолчанию
      opacity: 0
      transition: opacity $transition-normal
    
    &__info
      width: 100%
      color: white
    
    &__title
      font-size: 16px
      font-weight: 600
      margin-bottom: 4px
      // Ограничиваем 2 строками
      display: -webkit-box
      -webkit-line-clamp: 2
      -webkit-box-orient: vertical
      overflow: hidden
    
    &__desc
      font-size: 14px
      margin-bottom: 8px
      opacity: 0.9
      // Ограничиваем 2 строками
      display: -webkit-box
      -webkit-line-clamp: 2
      -webkit-box-orient: vertical
      overflow: hidden
    
    &__tags
      display: flex
      gap: 8px
      flex-wrap: wrap
    
    &__tag
      font-size: 12px
      padding: 4px 8px
      background: rgba(255, 255, 255, 0.2)
      border-radius: $radius-sm
      backdrop-filter: blur(4px)
  
  // Анимация появления изображения
  @keyframes fadeIn
    from
      opacity: 0
    to
      opacity: 1
  </style>