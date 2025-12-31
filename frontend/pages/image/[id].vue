<template>
  <main class="image-page">
    <div class="image-page__container">
      <!-- Загрузка -->
      <div v-if="isLoading" class="image-page__loading">
        <CommonBaseLoader size="large" />
        <span>Загрузка изображения...</span>
      </div>

      <!-- Ошибка -->
      <div v-else-if="error" class="image-page__error">
        <div class="image-page__error-icon">😕</div>
        <h2>Изображение не найдено</h2>
        <p>{{ error }}</p>
        <NuxtLink to="/" class="image-page__btn">
          На главную
        </NuxtLink>
      </div>

      <!-- Контент -->
      <div v-else-if="image" class="image-page__content">
        <div class="image-page__image-wrapper">
          <img
            :src="image.url"
            :alt="image.title || 'Image'"
            class="image-page__image"
          />
        </div>

        <div class="image-page__info">
          <h1 class="image-page__title">{{ image.title || 'Без названия' }}</h1>
          
          <p v-if="image.description" class="image-page__description">
            {{ image.description }}
          </p>

          <div v-if="image.tags?.length" class="image-page__tags">
            <span 
              v-for="tag in image.tags" 
              :key="tag"
              class="image-page__tag"
            >
              #{{ tag }}
            </span>
          </div>

          <div class="image-page__actions">
            <CommonBaseIconButton 
              :variant="isFavoriteImage ? 'danger' : 'ghost'"
              size="lg"
              @click="handleToggleFavorite"
            >
              {{ isFavoriteImage ? '❤️' : '🤍' }}
            </CommonBaseIconButton>
            
            <CommonBaseIconButton 
              variant="ghost"
              size="lg"
              @click="downloadImage"
            >
              ⬇️
            </CommonBaseIconButton>
            
            <CommonBaseIconButton 
              variant="ghost"
              size="lg"
              @click="shareImage"
            >
              ↗️
            </CommonBaseIconButton>
          </div>
        </div>

        <!-- Похожие изображения -->
        <div v-if="recommendations.length" class="image-page__recommendations">
          <h2>Похожие изображения</h2>
          <ImageMasonryGrid
            :images="recommendations"
            :is-loading="false"
            @image-click="handleRecommendationClick"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFavorites } from '~/composables/useFavorites'
import { useAuthActions } from '~/composables/useAuthActions'
import { useToast } from '~/composables/useToast'
import { useImagesStore } from '~/store/images'
import type { Image } from '~/types/image'

const route = useRoute()
const router = useRouter()
const imagesStore = useImagesStore()
const { checkIsFavorite, toggleFavorite } = useFavorites()
const { requireAuth } = useAuthActions()
const toast = useToast()

const isLoading = ref(true)
const error = ref<string | null>(null)
const image = ref<Image | null>(null)
const recommendations = ref<Image[]>([])
const isFavoriteImage = ref(false)

// Загрузка статуса избранного
const loadFavoriteStatus = async () => {
  if (!image.value) return
  isFavoriteImage.value = await checkIsFavorite(image.value.id)
}

useHead(() => ({
  title: image.value?.title 
    ? `${image.value.title} - SnapBoard` 
    : 'Изображение - SnapBoard'
}))

const loadImage = async () => {
  isLoading.value = true
  error.value = null

  try {
    const imageId = route.params.id as string
    
    // Загружаем изображения если их нет
    if (imagesStore.images.length === 0) {
      const response = await imagesStore.fetchPagedImages({ page: 1, pageSize: 50 })
      imagesStore.setImages(response.items)
    }

    // Ищем изображение по ID
    const found = imagesStore.images.find(img => img.id === imageId)
    
    if (!found) {
      error.value = 'Изображение не найдено или было удалено'
      return
    }

    image.value = found
    loadRecommendations()
    loadFavoriteStatus()
  } catch (e) {
    error.value = 'Не удалось загрузить изображение'
    console.error('Error loading image:', e)
  } finally {
    isLoading.value = false
  }
}

const loadRecommendations = () => {
  if (!image.value) return

  const currentTags = image.value.tags || []
  const currentTitle = (image.value.title || '').toLowerCase()
  const titleWords = currentTitle.split(/\s+/).filter(w => w.length > 2)

  const filtered = imagesStore.images.filter(img => {
    if (img.id === image.value!.id) return false

    const imgTags = img.tags || []
    const imgTitle = (img.title || '').toLowerCase()

    const hasMatchingTag = currentTags.some(tag => imgTags.includes(tag))
    const hasMatchingWord = titleWords.some(word => imgTitle.includes(word))

    return hasMatchingTag || hasMatchingWord
  })

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
}

const handleToggleFavorite = async () => {
  if (!image.value) return

  requireAuth(async () => {
    const result = await toggleFavorite(image.value!.id, isFavoriteImage.value)
    
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
  if (!image.value) return

  const currentImage = image.value
  
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
  if (!image.value) return

  const shareUrl = window.location.href

  if (navigator.share) {
    try {
      await navigator.share({
        title: image.value.title || 'SnapBoard Image',
        text: image.value.description || 'Посмотрите это изображение на SnapBoard',
        url: shareUrl
      })
      toast.success('Поделились успешно')
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        await copyToClipboard(shareUrl)
      }
    }
  } else {
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

const handleRecommendationClick = (img: Image) => {
  router.push(`/image/${img.id}`)
}

// Перезагрузка при изменении ID в URL
watch(() => route.params.id, (newId) => {
  if (newId) {
    loadImage()
  }
})

onMounted(() => {
  loadImage()
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.image-page
  min-height: 100vh
  background: var(--bg-primary)
  padding: 32px 0

  &__container
    max-width: $breakpoint-desktop
    margin: 0 auto
    padding: 0 24px

    @include mobile
      padding: 0 16px

  &__loading,
  &__error
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    gap: 16px
    padding: 64px 24px
    text-align: center
    color: var(--text-secondary)

  &__error
    background: var(--card-bg)
    border: 1px solid var(--card-border)
    border-radius: $radius-lg

    &-icon
      font-size: 64px

    h2
      font-size: 24px
      color: var(--text-primary)
      margin: 0

    p
      color: var(--text-muted)
      margin: 0

  &__btn
    display: inline-block
    padding: 12px 24px
    background: var(--accent-color)
    color: var(--text-inverse)
    text-decoration: none
    border-radius: $radius
    font-weight: 600
    margin-top: 16px
    transition: background 0.2s

    &:hover
      background: var(--accent-hover)

  &__content
    display: flex
    flex-direction: column
    gap: 32px

  &__image-wrapper
    background: var(--card-bg)
    border: 1px solid var(--card-border)
    border-radius: $radius-lg
    padding: 24px
    display: flex
    justify-content: center

    @include mobile
      padding: 16px

  &__image
    max-width: 100%
    max-height: 70vh
    object-fit: contain
    border-radius: $radius

  &__info
    background: var(--card-bg)
    border: 1px solid var(--card-border)
    border-radius: $radius-lg
    padding: 24px

    @include mobile
      padding: 16px

  &__title
    font-size: 28px
    font-weight: 700
    color: var(--text-primary)
    margin: 0 0 16px

    @include mobile
      font-size: 22px

  &__description
    font-size: 16px
    color: var(--text-secondary)
    margin: 0 0 16px
    line-height: 1.6

  &__tags
    display: flex
    gap: 8px
    flex-wrap: wrap
    margin-bottom: 24px

  &__tag
    color: var(--accent-color)
    font-size: 14px
    background: var(--accent-light)
    padding: 4px 12px
    border-radius: 16px

  &__actions
    display: flex
    gap: 12px

  &__recommendations
    h2
      font-size: 24px
      font-weight: 600
      color: var(--text-primary)
      margin-bottom: 24px

      @include mobile
        font-size: 20px
        margin-bottom: 16px
</style>
