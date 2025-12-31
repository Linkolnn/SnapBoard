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
      <CommonBaseIconButton
        v-if="item.status === 'pending'"
        variant="ghost"
        size="sm"
        title="Удалить"
        @click="handleRemove"
      >
        🗑️
      </CommonBaseIconButton>
      
      <CommonBaseIconButton
        v-if="item.status === 'error'"
        variant="ghost"
        size="sm"
        title="Повторить"
        @click="handleRetry"
      >
        🔄
      </CommonBaseIconButton>
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
  background: var(--card-bg)
  border-radius: $radius
  border: 1px solid var(--border-color)
  transition: all $transition-fast

  &--success
    border-color: var(--success-color)
    background: var(--success-light)

  &--error
    border-color: var(--error-color)
    background: var(--error-light)

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
    background: var(--success-color)
    color: white
    border-radius: 50%
    display: flex
    align-items: center
    justify-content: center
    font-size: 16px

    &--error
      background: var(--error-color)

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
    color: var(--text-primary)

    &:focus
      outline: none

    &::placeholder
      color: var(--text-muted)

    &:disabled
      color: var(--text-secondary)

  &__meta
    font-size: 12px
    color: var(--text-muted)
    margin-top: 4px

  &__error
    color: var(--error-color)

  &__progress
    height: 4px
    background: var(--bg-tertiary)
    border-radius: 2px
    margin-top: 8px
    overflow: hidden

  &__progress-bar
    height: 100%
    background: var(--accent-color)
    border-radius: 2px
    transition: width 0.3s ease

  &__actions
    display: flex
    flex-direction: column
    gap: 4px
</style>
