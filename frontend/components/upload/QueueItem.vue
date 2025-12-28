<template>
  <article class="queue-item" :class="`queue-item--${item.status}`">
    <div class="queue-item__preview">
      <img :src="item.previewUrl" :alt="item.name" />
      
      <div v-if="item.status !== 'pending'" class="queue-item__overlay">
        <span v-if="item.status === 'uploading'" class="queue-item__progress-text">
          {{ item.progress }}%
        </span>
        <span v-else-if="item.status === 'success'" class="queue-item__status-icon">
          ✓
        </span>
        <span v-else-if="item.status === 'error'" class="queue-item__status-icon queue-item__status-icon--error">
          ✕
        </span>
      </div>
    </div>

    <div class="queue-item__info">
      <input
        v-model="localTitle"
        type="text"
        class="queue-item__title-input"
        placeholder="Название..."
        :disabled="item.status !== 'pending'"
        @blur="updateTitle"
      />
      
      <p class="queue-item__meta">
        {{ formatFileSize(item.size) }}
        <span v-if="item.error" class="queue-item__error">
          • {{ item.error }}
        </span>
      </p>

      <div v-if="item.status === 'uploading'" class="queue-item__progress">
        <div 
          class="queue-item__progress-bar"
          :style="{ width: item.progress + '%' }"
        ></div>
      </div>
    </div>

    <div class="queue-item__actions">
      <button
        v-if="item.status === 'pending'"
        class="queue-item__action"
        title="Удалить"
        @click="handleRemove"
      >
        🗑️
      </button>
      
      <button
        v-if="item.status === 'error'"
        class="queue-item__action"
        title="Повторить"
        @click="handleRetry"
      >
        🔄
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { UploadQueueItem } from '~/types/image'
import { formatFileSize } from '~/utils/fileHelpers'

interface Props {
  item: UploadQueueItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  remove: [id: string]
  retry: [id: string]
  update: [id: string, data: Partial<UploadQueueItem>]
}>()

const localTitle = ref(props.item.title || '')

watch(() => props.item.title, (newTitle) => {
  localTitle.value = newTitle || ''
})

const updateTitle = () => {
  if (localTitle.value !== props.item.title) {
    emit('update', props.item.id, { title: localTitle.value })
  }
}

const handleRemove = () => {
  emit('remove', props.item.id)
}

const handleRetry = () => {
  emit('retry', props.item.id)
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.queue-item
  display: flex
  gap: 12px
  padding: 12px
  background: white
  border-radius: $radius
  border: 1px solid $gray-200
  transition: all $transition-fast

  &--success
    border-color: $success-color
    background: rgba($success-color, 0.05)

  &--error
    border-color: $error-color
    background: rgba($error-color, 0.05)

  &__preview
    position: relative
    width: 80px
    height: 80px
    border-radius: $radius-sm
    overflow: hidden
    flex-shrink: 0

    img
      width: 100%
      height: 100%
      object-fit: cover

  &__overlay
    position: absolute
    inset: 0
    background: rgba(0, 0, 0, 0.5)
    display: flex
    align-items: center
    justify-content: center

  &__progress-text
    color: white
    font-weight: 600
    font-size: 14px

  &__status-icon
    width: 32px
    height: 32px
    background: $success-color
    color: white
    border-radius: 50%
    display: flex
    align-items: center
    justify-content: center
    font-size: 16px

    &--error
      background: $error-color

  &__info
    flex: 1
    min-width: 0

  &__title-input
    width: 100%
    padding: 4px 0
    border: none
    background: transparent
    font-size: 14px
    font-weight: 500
    color: $text-light

    &:focus
      outline: none

    &::placeholder
      color: $gray-400

    &:disabled
      color: $gray-500

  &__meta
    font-size: 12px
    color: $gray-400
    margin-top: 4px

  &__error
    color: $error-color

  &__progress
    height: 4px
    background: $gray-200
    border-radius: 2px
    margin-top: 8px
    overflow: hidden

  &__progress-bar
    height: 100%
    background: $primary-color
    border-radius: 2px
    transition: width 0.3s ease

  &__actions
    display: flex
    flex-direction: column
    gap: 4px

  &__action
    width: 32px
    height: 32px
    border: none
    background: $gray-100
    border-radius: 50%
    cursor: pointer
    font-size: 14px
    display: flex
    align-items: center
    justify-content: center
    transition: all $transition-fast

    &:hover
      background: $gray-200
</style>
