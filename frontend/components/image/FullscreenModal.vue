<template>
  <Teleport to="body">
    <Transition name="fullscreen">
      <div 
        v-if="isOpen && image" 
        class="fullscreen-modal"
        @click.self="handleClose"
      >
        <!-- Кнопка закрытия -->
        <button class="fullscreen-modal__close" @click="handleClose">
          ✕
        </button>
        
        <!-- Навигация -->
        <button
          v-if="viewContext.hasPrev"
          class="fullscreen-modal__nav fullscreen-modal__nav--prev"
          @click="handlePrev"
        >
          ‹
        </button>
        
        <button
          v-if="viewContext.hasNext"
          class="fullscreen-modal__nav fullscreen-modal__nav--next"
          @click="handleNext"
        >
          ›
        </button>
        
        <!-- Основной контент -->
        <div class="fullscreen-modal__content" ref="contentRef">
          <!-- Изображение на весь экран -->
          <div class="fullscreen-modal__image-section">
            <img
              :src="image.url"
              :alt="image.title || 'Image'"
              class="fullscreen-modal__image"
            />
          </div>
          
          <!-- Панель действий внизу -->
          <div class="fullscreen-modal__actions">
            <div class="fullscreen-modal__actions-left">
              <h3 class="fullscreen-modal__title">{{ image.title || 'Без названия' }}</h3>
              <div v-if="image.tags?.length" class="fullscreen-modal__tags">
                <span 
                  v-for="tag in image.tags.slice(0, 5)" 
                  :key="tag"
                  class="fullscreen-modal__tag"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>
            
            <div class="fullscreen-modal__actions-right">
              <button 
                class="fullscreen-modal__btn"
                :class="{ 'fullscreen-modal__btn--active': isFavoriteImage }"
                @click="handleToggleFavorite"
              >
                <span>{{ isFavoriteImage ? '❤️' : '🤍' }}</span>
              </button>
              
              <button 
                class="fullscreen-modal__btn"
                @click="openSaveModal"
              >
                <span>📌</span>
              </button>
              
              <button 
                class="fullscreen-modal__btn"
                @click="shareImage"
              >
                <span>↗️</span>
              </button>
            </div>
          </div>
          
          <!-- Секция рекомендаций -->
          <div class="fullscreen-modal__recommendations">
            <h4>Похожие изображения</h4>
            
            <ImageMasonryGrid
              v-if="recommendations.length"
              :images="recommendations"
              :is-loading="isLoadingRecommendations"
              @image-click="handleRecommendationClick"
            />
            
            <div v-else-if="isLoadingRecommendations" class="fullscreen-modal__loading">
              <span>Загрузка рекомендаций...</span>
            </div>
            
            <div v-else class="fullscreen-modal__no-recommendations">
              <span>Нет похожих изображений</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { Image, ImageViewContext } from '~/types/image'
import { useFavorites } from '~/composables/useFavorites'

interface Props {
  isOpen: boolean
  image: Image | null
  viewContext: ImageViewContext
  allImages: Image[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  next: []
  prev: []
  imageSelect: [image: Image]
}>()

const { isFavorite, toggleFavorite } = useFavorites()

const contentRef = ref<HTMLElement | null>(null)
const isLoadingRecommendations = ref(false)
const recommendations = ref<Image[]>([])

// Проверка избранного
const isFavoriteImage = computed(() => {
  if (!props.image) return false
  return isFavorite(props.image.id)
})

/**
 * Получить рекомендации на основе тегов и названия
 */
const loadRecommendations = () => {
  if (!props.image) {
    recommendations.value = []
    return
  }
  
  isLoadingRecommendations.value = true
  
  try {
    const currentTags = props.image.tags || []
    const currentTitle = (props.image.title || '').toLowerCase()
    const titleWords = currentTitle.split(/\s+/).filter(w => w.length > 2)
    
    // Фильтруем изображения по совпадению тегов или слов из названия
    const filtered = props.allImages.filter(img => {
      if (img.id === props.image!.id) return false
      
      const imgTags = img.tags || []
      const imgTitle = (img.title || '').toLowerCase()
      
      const hasMatchingTag = currentTags.some(tag => imgTags.includes(tag))
      const hasMatchingWord = titleWords.some(word => imgTitle.includes(word))
      
      return hasMatchingTag || hasMatchingWord
    })
    
    // Сортируем по количеству совпадений
    const scored = filtered.map(img => {
      const imgTags = img.tags || []
      const imgTitle = (img.title || '').toLowerCase()
      
      let score = 0
      currentTags.forEach(tag => {
        if (imgTags.includes(tag)) score += 2
      })
      titleWords.forEach(word => {
        if (imgTitle.includes(word)) score += 1
      })
      
      return { img, score }
    })
    
    recommendations.value = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map(item => item.img)
      
  } finally {
    isLoadingRecommendations.value = false
  }
}

// Загружаем рекомендации при смене изображения
watch(() => props.image?.id, () => {
  if (props.isOpen && props.image) {
    loadRecommendations()
    // Скроллим контент наверх
    if (contentRef.value) {
      contentRef.value.scrollTop = 0
    }
  }
}, { immediate: true })

watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.image) {
    loadRecommendations()
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const handleClose = () => {
  emit('close')
}

const handleNext = () => {
  if (props.viewContext.hasNext) {
    emit('next')
  }
}

const handlePrev = () => {
  if (props.viewContext.hasPrev) {
    emit('prev')
  }
}

const handleToggleFavorite = () => {
  if (props.image) {
    toggleFavorite(props.image.id)
  }
}

const openSaveModal = () => {
  console.log('Save to board:', props.image?.id)
  // TODO: Открыть модал выбора доски
}

const shareImage = async () => {
  if (!props.image) return
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: props.image.title || 'SnapBoard Image',
        url: props.image.url
      })
    } catch (err) {
      console.log('Share cancelled')
    }
  } else {
    await navigator.clipboard.writeText(props.image.url)
    // TODO: Показать toast "Ссылка скопирована"
  }
}

const handleRecommendationClick = (image: Image) => {
  emit('imageSelect', image)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!props.isOpen) return
  
  switch (event.key) {
    case 'Escape':
      handleClose()
      break
    case 'ArrowLeft':
      handlePrev()
      break
    case 'ArrowRight':
      handleNext()
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.fullscreen-modal
  position: fixed
  inset: 0
  background: rgba(0, 0, 0, 0.95)
  z-index: $z-index-modal
  overflow-y: auto
  
  &__close
    position: fixed
    top: 16px
    right: 16px
    width: 48px
    height: 48px
    background: rgba(255, 255, 255, 0.1)
    border: none
    border-radius: 50%
    color: white
    font-size: 24px
    cursor: pointer
    transition: all $transition-fast
    z-index: 10
    display: flex
    align-items: center
    justify-content: center
    
    &:hover
      background: rgba(255, 255, 255, 0.2)
    
    @include mobile
      width: 40px
      height: 40px
      top: 12px
      right: 12px
  
  &__nav
    position: fixed
    top: 40%
    transform: translateY(-50%)
    width: 56px
    height: 56px
    background: rgba(255, 255, 255, 0.1)
    border: none
    border-radius: 50%
    color: white
    font-size: 32px
    cursor: pointer
    transition: all $transition-fast
    z-index: 10
    display: flex
    align-items: center
    justify-content: center
    
    &:hover
      background: rgba(255, 255, 255, 0.2)
    
    &--prev
      left: 16px
    
    &--next
      right: 16px
    
    @include mobile
      width: 44px
      height: 44px
      font-size: 24px
      
      &--prev
        left: 8px
      
      &--next
        right: 8px
  
  &__content
    max-width: 1200px
    margin: 0 auto
    padding: 80px 80px 40px
    
    @include tablet
      padding: 70px 40px 32px
    
    @include mobile
      padding: 60px 16px 24px
  
  &__image-section
    display: flex
    justify-content: center
    margin-bottom: 24px
  
  &__image
    max-width: 100%
    // max-height: 70vh
    object-fit: contain
    border-radius: $radius
  
  &__actions
    display: flex
    justify-content: space-between
    align-items: center
    padding: 20px 24px
    background: rgba(255, 255, 255, 0.05)
    border-radius: $radius
    margin-bottom: 32px
    gap: 16px
    
    @include tablet
      flex-direction: column
      align-items: stretch
    
    @include mobile
      padding: 16px
      margin-bottom: 24px
  
  &__actions-left
    flex: 1
  
  &__actions-right
    display: flex
    gap: 12px
    
    @include mobile
      justify-content: center
      flex-wrap: wrap
  
  &__title
    color: white
    font-size: 20px
    font-weight: 600
    margin: 0 0 8px
    
    @include mobile
      font-size: 18px
      text-align: center
  
  &__tags
    display: flex
    gap: 8px
    flex-wrap: wrap
    
    @include mobile
      justify-content: center
  
  &__tag
    color: $gray-400
    font-size: 14px
    
    @include mobile
      font-size: 12px
  
  &__btn
    display: flex
    align-items: center
    gap: 8px
    padding: 12px 20px
    background: rgba(255, 255, 255, 0.1)
    border: none
    border-radius: $radius
    color: white
    font-size: 14px
    font-weight: 500
    cursor: pointer
    transition: all $transition-fast
    
    &:hover
      background: rgba(255, 255, 255, 0.2)
    
    &--active
      background: $error-color
      
      &:hover
        background: darken($error-color, 10%)
    
    @include mobile
      padding: 10px 16px
      font-size: 13px
  
  &__recommendations
    h4
      color: white
      font-size: 24px
      font-weight: 600
      margin-bottom: 24px
      
      @include mobile
        font-size: 20px
        margin-bottom: 16px
  
  &__loading,
  &__no-recommendations
    text-align: center
    padding: 48px 24px
    color: $gray-400
    font-size: 16px

// Анимации
.fullscreen-enter-active,
.fullscreen-leave-active
  transition: all 0.3s ease

.fullscreen-enter-from,
.fullscreen-leave-to
  opacity: 0
</style>
