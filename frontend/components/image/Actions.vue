<template>
  <div class="image-actions">
    <button class="image-actions__btn" title="Редактировать" @click="$emit('edit')">
      ✏️ Редактировать
    </button>
    
    <button class="image-actions__btn" title="Скачать" @click="handleDownload">
      📥 Скачать
    </button>
    
    <button class="image-actions__btn" title="Открыть в новой вкладке" @click="handleOpenInNewTab">
      🔗 Открыть
    </button>
    
    <button class="image-actions__btn image-actions__btn--danger" title="Удалить" @click="$emit('delete')">
      🗑️ Удалить
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Image } from '~/types/image'

interface Props {
  image: Image
}

const props = defineProps<Props>()

defineEmits<{
  edit: []
  delete: []
}>()

const handleDownload = async () => {
  try {
    const response = await fetch(props.image.url)
    const blob = await response.blob()
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = props.image.title || `image-${props.image.id}`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download failed:', error)
    window.open(props.image.url, '_blank')
  }
}

const handleOpenInNewTab = () => {
  window.open(props.image.url, '_blank')
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.image-actions
  display: flex
  flex-direction: column
  gap: 8px

  &__btn
    display: flex
    align-items: center
    gap: 8px
    width: 100%
    padding: 12px 16px
    background: $gray-100
    border: none
    border-radius: $radius
    font-size: 14px
    font-weight: 500
    color: $text-light
    cursor: pointer
    transition: all $transition-fast
    text-align: left

    &:hover
      background: $gray-200

    &--danger
      color: $error-color

      &:hover
        background: rgba($error-color, 0.1)
</style>
