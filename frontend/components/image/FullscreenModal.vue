<template>
  <Teleport to="body">
    <Transition name="fullscreen">
      <div 
        v-if="isOpen && image" 
        class="fullscreen-modal"
        @click.self="handleClose"
      >
        <!-- Основной контент -->
        <div class="fullscreen-modal__content" ref="contentRef">
          <!-- Изображение на весь экран -->
          <div class="fullscreen-modal__image-section">
            <!-- Кнопка закрытия -->
            <CommonBaseIconButton 
              class="fullscreen-modal__close" 
              variant="ghost"
              size="lg"
              @click="handleClose"
            >
              ✕
            </CommonBaseIconButton>
            
            <!-- Навигация -->
            <CommonBaseIconButton
              v-if="viewContext.hasPrev"
              class="fullscreen-modal__nav fullscreen-modal__nav--prev"
              variant="ghost"
              size="lg"
              @click="handlePrev"
            >
              ‹
            </CommonBaseIconButton>
            
            <CommonBaseIconButton
              v-if="viewContext.hasNext"
              class="fullscreen-modal__nav fullscreen-modal__nav--next"
              variant="ghost"
              size="lg"
              @click="handleNext"
            >
              ›
            </CommonBaseIconButton>
            
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
              <p class="fullscreen-modal__description"> {{ image.description || 'Нет описания' }} </p>
              <div v-if="image.tags?.length" class="fullscreen-modal__tags">
                <span 
                  v-for="(tag, index) in image.tags.slice(0, 5)" 
                  :key="`tag-${index}-${tag}`"
                  class="fullscreen-modal__tag"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>
            
            <div class="fullscreen-modal__actions-right">
              <CommonBaseIconButton 
                :variant="isFavoriteImage ? 'danger' : 'ghost'"
                size="lg"
                class="fullscreen-modal__btn"
                @click="handleToggleFavorite"
              >
                {{ isFavoriteImage ? '🤍' : '❤️' }}
              </CommonBaseIconButton>
              
              <CommonBaseIconButton 
                variant="ghost"
                size="lg"
                class="fullscreen-modal__btn"
                @click="downloadImage"
              >
                ⬇️
              </CommonBaseIconButton>
              
              <CommonBaseIconButton 
                variant="ghost"
                size="lg"
                class="fullscreen-modal__btn"
                @click="shareImage"
              >
                ↗️
              </CommonBaseIconButton>
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
              <CommonBaseLoader size="medium" />
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
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { Image, ImageViewContext } from '~/types/image'
import { useFavorites } from '~/composables/useFavorites'
import { useRecommendations } from '~/composables/useRecommendations'
import { useAuthActions } from '~/composables/useAuthActions'
import { useToast } from '~/composables/useToast'

interface Props {
  isOpen: boolean
  image: Image | null
  viewContext: ImageViewContext
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  next: []
  prev: []
  imageSelect: [image: Image]
}>()

const { checkIsFavorite, toggleFavorite } = useFavorites()
const { recommendations, isLoading: isLoadingRecommendations, loadRecommendations } = useRecommendations()
const { requireAuth } = useAuthActions()
const toast = useToast()

const contentRef = ref<HTMLElement | null>(null)
const isFavoriteImage = ref(false)

// Загрузка статуса избранного
const loadFavoriteStatus = async () => {
  if (!props.image) {
    isFavoriteImage.value = false
    return
  }
  isFavoriteImage.value = await checkIsFavorite(props.image.id)
}

// Загружаем рекомендации и статус избранного при смене изображения
watch(() => props.image?.id, async (newId) => {
  if (props.isOpen && newId) {
    await loadRecommendations(newId, 12)
    await loadFavoriteStatus()
    // Скроллим контент наверх
    if (contentRef.value) {
      contentRef.value.scrollTop = 0
    }
  }
}, { immediate: true })

watch(() => props.isOpen, async (isOpen) => {
  if (isOpen && props.image) {
    await loadRecommendations(props.image.id, 12)
    await loadFavoriteStatus()
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

const handleToggleFavorite = async () => {
  if (!props.image) return
  
  // Проверка авторизации
  requireAuth(async () => {
    const result = await toggleFavorite(props.image!.id, isFavoriteImage.value)
    
    if (result.success) {
      isFavoriteImage.value = result.isFavorite
      if (result.isFavorite) {
        toast.success('Добавлено в избранное')
      } else {
        toast.info('Удалено из избранного')
      }
    } else {
      toast.error('Не удалось обновить избранное')
    }
  })
}

const downloadImage = async () => {
  if (!props.image) return

  const currentImage = props.image
  
  try {
    const response = await fetch(currentImage.url)
    const blob = await response.blob()
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Получаем расширение из URL или используем jpg по умолчанию
    const urlParts = currentImage.url.split('.')
    const lastPart = urlParts[urlParts.length - 1] || 'jpg'
    const extension = lastPart.split('?')[0] || 'jpg'
    const filename = currentImage.title 
      ? `${currentImage.title.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}.${extension}`
      : `image.${extension}`
    
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast.success('Изображение скачано')
  } catch (err) {
    console.error('Download error:', err)
    toast.error('Не удалось скачать изображение')
  }
}

const shareImage = async () => {
  if (!props.image) return
  
  const shareUrl = `${window.location.origin}/image/${props.image.id}`
  
  // Пробуем Web Share API
  if (navigator.share) {
    try {
      await navigator.share({
        title: props.image.title || 'SnapBoard Image',
        text: props.image.description || 'Посмотрите это изображение на SnapBoard',
        url: shareUrl
      })
      toast.success('Поделились успешно')
    } catch (err: any) {
      // Пользователь отменил или ошибка
      if (err.name !== 'AbortError') {
        // Fallback на копирование
        await copyToClipboard(shareUrl)
      }
    }
  } else {
    // Fallback на копирование
    await copyToClipboard(shareUrl)
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Ссылка скопирована')
  } catch (err) {
    toast.error('Не удалось скопировать ссылку')
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
  background: var(--bg-primary)
  z-index: $z-index-modal
  overflow-y: auto
  
  &__content
    max-width: 1200px
    margin: 0 auto
    padding: 40px 80px
    
    @include tablet
      padding: 32px 40px
    
    @include mobile
      padding: 24px 16px
  
  &__image-section
    position: relative
    display: flex
    justify-content: center
    margin-bottom: 24px
  
  &__close
    position: absolute
    top: 8px
    right: 8px
    z-index: 10
    color: var(--text-primary)
    background: var(--bg-secondary)
    border-radius: $radius-full
    
    &:hover
      background: var(--bg-tertiary)
    
    @include mobile
      top: 4px
      right: 4px
  
  &__nav
    position: absolute
    top: 50%
    transform: translateY(-50%)
    z-index: 10
    color: var(--text-primary)
    background: var(--bg-secondary)
    border-radius: $radius-full
    font-size: 32px
    
    &:hover
      background: var(--bg-tertiary)
    
    &--prev
      left: 8px
    
    &--next
      right: 8px
    
    @include mobile
      font-size: 24px
      
      &--prev
        left: 4px
      
      &--next
        right: 4px
  
  &__image
    max-width: 100%
    max-height: 70vh
    object-fit: contain
    border-radius: $radius
  
  &__actions
    display: flex
    justify-content: space-between
    align-items: center
    padding: 20px 24px
    background: var(--bg-secondary)
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
    width: 100%
  
  &__actions-right
    display: flex
    gap: 12px
    
    @include mobile
      justify-content: center
      flex-wrap: wrap
  
  &__title
    color: var(--text-primary)
    font-size: 20px
    font-weight: 600
    margin: 0 0 8px
    
    @include mobile
      font-size: 18px
      text-align: center

  &__description
    color: var(--text-primary)
    font-size: 14px

  
  &__tags
    display: flex
    gap: 8px
    flex-wrap: wrap
    
    @include mobile
      justify-content: center
  
  &__tag
    color: var(--text-muted)
    font-size: 14px
    
    @include mobile
      font-size: 12px
  
  &__btn
    color: var(--text-primary)
    
    @include mobile
      font-size: 13px
  
  &__recommendations
    h4
      color: var(--text-primary)
      font-size: 24px
      font-weight: 600
      margin-bottom: 24px
      
      @include mobile
        font-size: 20px
        margin-bottom: 16px
  
  &__loading,
  &__no-recommendations
    display: flex
    flex-direction: column
    align-items: center
    gap: 16px
    text-align: center
    padding: 48px 24px
    color: var(--text-muted)
    font-size: 16px

// Анимации
.fullscreen-enter-active,
.fullscreen-leave-active
  transition: all 0.3s ease

.fullscreen-enter-from,
.fullscreen-leave-to
  opacity: 0
</style>
