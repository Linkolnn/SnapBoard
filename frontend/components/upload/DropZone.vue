<template>
  <div
    class="drop-zone"
    :class="{
      'drop-zone--active': isDragOver,
      'drop-zone--disabled': disabled
    }"
    @dragenter.prevent="handleDragEnter"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    @click="openFileDialog"
  >
    <input
      ref="fileInputRef"
      type="file"
      :accept="acceptTypes"
      :multiple="multiple"
      class="drop-zone__input"
      @change="handleFileSelect"
    />

    <div class="drop-zone__content">
      <div class="drop-zone__icon">
        {{ isDragOver ? '📥' : '📤' }}
      </div>
      
      <p class="drop-zone__title">
        {{ isDragOver ? 'Отпустите файлы' : 'Перетащите изображения сюда' }}
      </p>
      
      <p class="drop-zone__subtitle">
        или <span class="drop-zone__link">выберите файлы</span>
      </p>
      
      <p class="drop-zone__hint">
        {{ hintText }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DEFAULT_UPLOAD_CONFIG } from '~/utils/fileHelpers'

interface Props {
  multiple?: boolean
  disabled?: boolean
  maxFiles?: number
  maxFileSize?: number
  acceptTypes?: string
}

const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  disabled: false,
  maxFiles: DEFAULT_UPLOAD_CONFIG.maxFiles,
  maxFileSize: DEFAULT_UPLOAD_CONFIG.maxFileSize,
  acceptTypes: 'image/jpeg,image/png,image/gif,image/webp'
})

const emit = defineEmits<{
  files: [files: File[]]
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
const dragCounter = ref(0)

const hintText = computed(() => {
  const maxSizeMB = props.maxFileSize / (1024 * 1024)
  return `JPG, PNG, GIF, WebP до ${maxSizeMB}MB`
})

const openFileDialog = () => {
  if (props.disabled) return
  fileInputRef.value?.click()
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    emitFiles(Array.from(input.files))
    input.value = ''
  }
}

const handleDragEnter = (event: DragEvent) => {
  if (props.disabled) return
  dragCounter.value++
  
  if (event.dataTransfer?.types.includes('Files')) {
    isDragOver.value = true
  }
}

const handleDragOver = (event: DragEvent) => {
  if (props.disabled) return
  event.dataTransfer!.dropEffect = 'copy'
}

const handleDragLeave = () => {
  dragCounter.value--
  if (dragCounter.value === 0) {
    isDragOver.value = false
  }
}

const handleDrop = (event: DragEvent) => {
  if (props.disabled) return
  
  isDragOver.value = false
  dragCounter.value = 0

  const files = event.dataTransfer?.files
  if (files?.length) {
    emitFiles(Array.from(files))
  }
}

const emitFiles = (files: File[]) => {
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  const limitedFiles = props.multiple 
    ? imageFiles.slice(0, props.maxFiles)
    : imageFiles.slice(0, 1)

  if (limitedFiles.length) {
    emit('files', limitedFiles)
  }
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.drop-zone
  position: relative
  border: 2px dashed $gray-300
  border-radius: $radius-lg
  padding: 48px 24px
  text-align: center
  cursor: pointer
  transition: all $transition-fast
  background: $gray-50

  &:hover:not(&--disabled)
    border-color: $primary-color
    background: rgba($primary-color, 0.05)

  &--active
    border-color: $primary-color
    background: rgba($primary-color, 0.1)
    border-style: solid

    .drop-zone__icon
      transform: scale(1.2)

  &--disabled
    opacity: 0.5
    cursor: not-allowed

  &__input
    position: absolute
    width: 0
    height: 0
    opacity: 0
    pointer-events: none

  &__content
    pointer-events: none

  &__icon
    font-size: 48px
    margin-bottom: 16px
    transition: transform $transition-fast

  &__title
    font-size: 18px
    font-weight: 600
    color: $text-light
    margin-bottom: 8px

  &__subtitle
    font-size: 14px
    color: $gray-500
    margin-bottom: 16px

  &__link
    color: $primary-color
    font-weight: 500
    text-decoration: underline
    cursor: pointer

  &__hint
    font-size: 12px
    color: $gray-400
</style>
