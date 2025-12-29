<template>
  <main class="favorites-page">
    <div class="favorites-page__container">
      <header class="favorites-page__header">
        <h1 class="favorites-page__title">Избранное</h1>
        <p class="favorites-page__subtitle">
          {{ favoritesCount > 0 
            ? `${favoritesCount} ${pluralize(favoritesCount, 'изображение', 'изображения', 'изображений')}`
            : 'Ваши сохранённые изображения'
          }}
        </p>
      </header>

      <!-- Загрузка -->
      <div v-if="isLoading" class="favorites-page__loading">
        <CommonBaseLoader size="large" />
        <span>Загрузка избранного...</span>
      </div>

      <!-- Пустое состояние -->
      <div v-else-if="favoriteImages.length === 0" class="favorites-page__empty">
        <div class="favorites-page__empty-icon">⭐</div>
        <h2>Пока пусто</h2>
        <p>Добавляйте изображения в избранное, чтобы они появились здесь</p>
        <NuxtLink to="/" class="favorites-page__btn">
          Смотреть изображения
        </NuxtLink>
      </div>

      <!-- Сетка изображений -->
      <div v-else class="favorites-page__content">
        <ImageMasonryGrid
          :images="favoriteImages"
          :is-loading="false"
          @image-click="handleImageClick"
        />
      </div>
    </div>

    <!-- Fullscreen модал -->
    <ImageFullscreenModal
      :is-open="isFullscreenOpen"
      :image="selectedImage"
      :view-context="viewContext"
      :all-images="favoriteImages"
      @close="closeFullscreen"
      @next="goToNext"
      @prev="goToPrev"
      @image-select="handleImageSelect"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useFavorites } from '~/composables/useFavorites'
import { useImagesStore } from '~/store/images'
import type { Image, ImageViewContext } from '~/types/image'

definePageMeta({
  middleware: ['auth']
})

useHead({
  title: 'Избранное - SnapBoard'
})

const { favoriteIds, favoritesCount, removeFavorite } = useFavorites()
const imagesStore = useImagesStore()

const isLoading = ref(true)
const favoriteImages = ref<Image[]>([])
const isFullscreenOpen = ref(false)
const selectedImage = ref<Image | null>(null)
const currentIndex = ref(0)

const viewContext = computed<ImageViewContext>(() => ({
  currentIndex: currentIndex.value,
  totalImages: favoriteImages.value.length,
  hasPrev: currentIndex.value > 0,
  hasNext: currentIndex.value < favoriteImages.value.length - 1
}))

const pluralize = (count: number, one: string, few: string, many: string): string => {
  const mod10 = count % 10
  const mod100 = count % 100
  
  if (mod100 >= 11 && mod100 <= 19) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}

const loadFavoriteImages = async () => {
  isLoading.value = true
  
  try {
    // Получаем все изображения из store
    const allImages = imagesStore.images
    
    // Если изображений нет в store, загружаем mock данные
    if (allImages.length === 0) {
      // Загружаем изображения (mock)
      const response = await imagesStore.fetchPagedImages({ page: 1, pageSize: 50 })
      imagesStore.setImages(response.items)
    }
    
    // Фильтруем по избранным ID
    const ids = favoriteIds.value
    favoriteImages.value = imagesStore.images.filter(img => ids.includes(img.id))
  } catch (e) {
    console.error('Error loading favorites:', e)
  } finally {
    isLoading.value = false
  }
}

const handleImageClick = (image: Image) => {
  const index = favoriteImages.value.findIndex(img => img.id === image.id)
  currentIndex.value = index >= 0 ? index : 0
  selectedImage.value = image
  isFullscreenOpen.value = true
}

const handleImageSelect = (image: Image) => {
  const index = favoriteImages.value.findIndex(img => img.id === image.id)
  if (index >= 0) {
    currentIndex.value = index
    selectedImage.value = image
  }
}

const closeFullscreen = () => {
  isFullscreenOpen.value = false
  selectedImage.value = null
}

const goToNext = () => {
  if (currentIndex.value < favoriteImages.value.length - 1) {
    currentIndex.value++
    selectedImage.value = favoriteImages.value[currentIndex.value] || null
  }
}

const goToPrev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    selectedImage.value = favoriteImages.value[currentIndex.value] || null
  }
}

// Следим за изменениями избранного
watch(favoriteIds, () => {
  const ids = favoriteIds.value
  favoriteImages.value = imagesStore.images.filter(img => ids.includes(img.id))
}, { deep: true })

onMounted(() => {
  loadFavoriteImages()
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.favorites-page
  min-height: 100vh
  background: var(--bg-primary)
  padding: 32px 0

  &__container
    max-width: $breakpoint-desktop
    margin: 0 auto
    padding: 0 24px
    
    @include mobile
      padding: 0 16px

  &__header
    margin-bottom: 32px

  &__title
    font-size: 32px
    font-weight: 700
    color: var(--text-primary)
    margin-bottom: 8px
    
    @include mobile
      font-size: 24px

  &__subtitle
    font-size: 16px
    color: var(--text-secondary)

  &__loading
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    gap: 16px
    padding: 64px 24px
    color: var(--text-muted)

  &__empty
    text-align: center
    padding: 64px 24px
    background: var(--card-bg)
    border-radius: $radius-lg
    border: 1px solid var(--card-border)

    &-icon
      font-size: 64px
      margin-bottom: 16px

    h2
      font-size: 24px
      color: var(--text-primary)
      margin-bottom: 8px

    p
      color: var(--text-muted)
      margin-bottom: 24px

  &__btn
    display: inline-block
    padding: 12px 24px
    background: var(--accent-color)
    color: var(--text-inverse)
    text-decoration: none
    border-radius: $radius
    font-weight: 600
    transition: background 0.2s

    &:hover
      background: var(--accent-hover)

  &__content
    background: var(--card-bg)
    border-radius: $radius-lg
    padding: 24px
    border: 1px solid var(--card-border)
    
    @include mobile
      padding: 16px
</style>
