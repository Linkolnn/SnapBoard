<template>
  <div class="image-info">
    <h2 class="image-info__title">{{ image.title || 'Без названия' }}</h2>
    
    <p v-if="image.description" class="image-info__description">{{ image.description }}</p>
    <p v-else class="image-info__description image-info__description--empty">Описание не добавлено</p>
    
    <div v-if="image.tags?.length" class="image-info__tags">
      <span v-for="tag in image.tags" :key="tag" class="image-info__tag">#{{ tag }}</span>
    </div>
    
    <div class="image-info__meta">
      <div v-if="image.size" class="image-info__meta-item">
        <span class="image-info__meta-label">Размер:</span>
        <span class="image-info__meta-value">{{ formatFileSize(image.size) }}</span>
      </div>
      
      <div v-if="image.width && image.height" class="image-info__meta-item">
        <span class="image-info__meta-label">Разрешение:</span>
        <span class="image-info__meta-value">{{ image.width }} × {{ image.height }}</span>
      </div>
      
      <div class="image-info__meta-item">
        <span class="image-info__meta-label">Добавлено:</span>
        <span class="image-info__meta-value">{{ formatDate(image.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Image } from '~/types/image'
import { formatFileSize } from '~/utils/fileHelpers'

interface Props {
  image: Image
}

defineProps<Props>()

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.image-info
  &__title
    font-size: 20px
    font-weight: 700
    color: $text-light
    margin-bottom: 12px
    word-break: break-word

  &__description
    font-size: 15px
    color: $gray-600
    line-height: 1.6
    margin-bottom: 16px

    &--empty
      color: $gray-400
      font-style: italic

  &__tags
    display: flex
    flex-wrap: wrap
    gap: 8px
    margin-bottom: 20px

  &__tag
    padding: 4px 12px
    background: rgba($primary-color, 0.1)
    color: $primary-color
    border-radius: $radius-full
    font-size: 13px
    font-weight: 500

  &__meta
    padding-top: 16px
    border-top: 1px solid $gray-200

  &__meta-item
    display: flex
    justify-content: space-between
    padding: 8px 0
    font-size: 14px

    &:not(:last-child)
      border-bottom: 1px solid $gray-100

  &__meta-label
    color: $gray-500

  &__meta-value
    color: $text-light
    font-weight: 500
</style>
