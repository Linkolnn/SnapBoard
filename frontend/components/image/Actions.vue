<template>
  <div class="image-actions">
    <CommonBaseButton 
      variant="secondary" 
      full-width 
      title="Редактировать" 
      @click="$emit('edit')"
    >
      ✏️ Редактировать
    </CommonBaseButton>
    
    <CommonBaseButton 
      variant="secondary" 
      full-width 
      title="Скачать" 
      @click="handleDownload"
    >
      📥 Скачать
    </CommonBaseButton>
    
    <CommonBaseButton 
      variant="secondary" 
      full-width 
      title="Открыть в новой вкладке" 
      @click="handleOpenInNewTab"
    >
      🔗 Открыть
    </CommonBaseButton>
    
    <CommonBaseButton 
      variant="danger" 
      full-width 
      title="Удалить" 
      @click="$emit('delete')"
    >
      🗑️ Удалить
    </CommonBaseButton>
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
</style>
