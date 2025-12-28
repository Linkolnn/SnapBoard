<template>
  <article 
    class="img-card"
    :class="{ 'img-card--loaded': isLoaded }"
    @click="handleClick"
  >
    <!-- Skeleton пока не загружено -->
    <ImageSkeleton 
      v-if="!isLoaded"
      :height="estimatedHeight"
    />
    
    <!-- Изображение - используем v-if вместо v-show -->
    <img
      v-if="isLoaded"
      :src="image.url"
      :alt="image.title || 'Image'"
      class="img-card__img"
      loading="lazy"
      @load="handleImageLoad"
      @error="handleImageError"
    />
    
    <!-- Overlay -->
    <div v-if="isLoaded" class="img-card__overlay">
      <div class="img-card__info">
        <h3 v-if="image.title" class="img-card__title">
          {{ image.title }}
        </h3>
        <p v-if="image.description" class="img-card__desc">
          {{ image.description }}
        </p>
        
        <div v-if="image.tags?.length" class="img-card__tags">
          <span 
            v-for="tag in image.tags.slice(0, 3)" 
            :key="tag"
            class="img-card__tag"
          >
            #{{ tag }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Image } from '~/types'

interface Props {
  image: Image
  estimatedHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  estimatedHeight: 300
})

const emit = defineEmits<{
  click: [image: Image]
  load: [height: number]
}>()

const isLoaded = ref(true)

/**
 * Обработчик загрузки изображения
 */
const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
    
  // Эмитим высоту ДО изменения состояния
  emit('load', img.offsetHeight)
  
  // Затем меняем состояние
  isLoaded.value = true
  
}

/**
 * Обработчик ошибки загрузки
 */
const handleImageError = () => {
  console.error('Failed to load image:', props.image.url)
  emit('load', props.estimatedHeight)
  isLoaded.value = true
}

/**
 * Клик по карточке
 */
const handleClick = () => {
  if (isLoaded.value) {
    emit('click', props.image)
  }
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.img-card
  position: relative
  width: 100%
  border-radius: $radius
  overflow: hidden
  cursor: pointer
  background: $gray-200
  transition: all $transition-normal
  
  &:hover
    transform: translateY(-4px)
    box-shadow: $shadow-lg
    
    .img-card__overlay
      opacity: 1
  
  &__img
    width: 100%
    height: auto
    display: block
    animation: fadeIn 0.3s ease-in
  
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
    opacity: 0
    transition: opacity $transition-normal
  
  &__info
    width: 100%
    color: white
  
  &__title
    font-size: 16px
    font-weight: 600
    margin-bottom: 4px
    display: -webkit-box
    -webkit-line-clamp: 2
    -webkit-box-orient: vertical
    overflow: hidden
  
  &__desc
    font-size: 14px
    margin-bottom: 8px
    opacity: 0.9
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

@keyframes fadeIn
  from
    opacity: 0
  to
    opacity: 1
</style>