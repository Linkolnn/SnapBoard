<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen" 
        class="upload-modal"
        @click.self="handleClose"
      >
        <div class="upload-modal__content">
          <header class="upload-modal__header">
            <h2 class="upload-modal__title">Загрузить изображения</h2>
            <button 
              class="upload-modal__close"
              :disabled="hasActiveUploads"
              @click="handleClose"
            >
              ✕
            </button>
          </header>

          <div class="upload-modal__tabs">
            <button
              class="upload-modal__tab"
              :class="{ 'upload-modal__tab--active': activeTab === 'file' }"
              @click="activeTab = 'file'"
            >
              📁 Файлы
            </button>
            <button
              class="upload-modal__tab"
              :class="{ 'upload-modal__tab--active': activeTab === 'url' }"
              @click="activeTab = 'url'"
            >
              🔗 По URL
            </button>
          </div>

          <div class="upload-modal__body">
            <div v-show="activeTab === 'file'">
              <UploadDropZone
                :disabled="hasActiveUploads"
                @files="handleFilesSelected"
              />
            </div>

            <div v-show="activeTab === 'url'">
              <UploadUrlInput
                :disabled="hasActiveUploads"
                @submit="handleUrlSubmit"
              />
            </div>

            <div v-if="uploadQueue.length" class="upload-modal__queue">
              <div class="upload-modal__queue-header">
                <h3>Очередь загрузки ({{ uploadQueue.length }})</h3>
                <button
                  v-if="!hasActiveUploads"
                  class="upload-modal__clear-btn"
                  @click="clearQueue"
                >
                  Очистить
                </button>
              </div>

              <div class="upload-modal__queue-list">
                <UploadQueueItem
                  v-for="item in uploadQueue"
                  :key="item.id"
                  :item="item"
                  @remove="removeFromQueue"
                  @retry="retryUpload"
                  @update="updateQueueItem"
                />
              </div>
            </div>
          </div>

          <footer class="upload-modal__footer">
            <button
              class="upload-modal__btn upload-modal__btn--secondary"
              :disabled="hasActiveUploads"
              @click="handleClose"
            >
              Отмена
            </button>
            <button
              class="upload-modal__btn upload-modal__btn--primary"
              :disabled="!pendingUploads.length || hasActiveUploads"
              @click="handleUploadAll"
            >
              <span v-if="hasActiveUploads" class="upload-modal__spinner"></span>
              {{ hasActiveUploads ? `Загрузка ${totalUploadProgress}%` : `Загрузить (${pendingUploads.length})` }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useImages } from '~/composables/useImages'

interface Props {
  isOpen: boolean
  boardId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  uploaded: []
}>()

const {
  uploadQueue,
  pendingUploads,
  uploadingItems,
  totalUploadProgress,
  addFiles,
  addUrl,
  updateQueueItem,
  removeFromQueue,
  clearQueue,
  uploadItem,
  uploadAll
} = useImages()

const activeTab = ref<'file' | 'url'>('file')
const isUploading = ref(false)

// Проверяем есть ли активные загрузки (только uploading, не pending)
const hasActiveUploads = computed(() => uploadingItems.value.length > 0 || isUploading.value)

const handleFilesSelected = async (files: File[]) => {
  await addFiles(files, props.boardId)
}

const handleUrlSubmit = (url: string) => {
  addUrl(url, props.boardId)
}

const retryUpload = async (id: string) => {
  updateQueueItem(id, { status: 'pending', progress: 0, error: undefined })
  await uploadItem(id)
}

const handleUploadAll = async () => {
  isUploading.value = true
  try {
    await uploadAll()
    
    const allSuccess = uploadQueue.value.every(item => item.status === 'success')
    if (allSuccess) {
      emit('uploaded')
      clearQueue()
      emit('close')
    }
  } finally {
    isUploading.value = false
  }
}

const handleClose = () => {
  if (hasActiveUploads.value) return
  clearQueue()
  emit('close')
}

watch(() => props.isOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.upload-modal
  position: fixed
  inset: 0
  background: rgba(0, 0, 0, 0.5)
  display: flex
  align-items: center
  justify-content: center
  z-index: $z-index-modal
  padding: 16px

  &__content
    background: white
    border-radius: $radius-lg
    width: 100%
    max-width: 600px
    max-height: 90vh
    display: flex
    flex-direction: column
    overflow: hidden

  &__header
    display: flex
    align-items: center
    justify-content: space-between
    padding: 20px 24px
    border-bottom: 1px solid $gray-200

  &__title
    font-size: 20px
    font-weight: 700
    color: $text-light

  &__close
    width: 32px
    height: 32px
    border: none
    background: $gray-100
    border-radius: 50%
    cursor: pointer
    font-size: 16px
    transition: all $transition-fast

    &:hover:not(:disabled)
      background: $gray-200

    &:disabled
      opacity: 0.5
      cursor: not-allowed

  &__tabs
    display: flex
    padding: 0 24px
    border-bottom: 1px solid $gray-200

  &__tab
    padding: 12px 16px
    background: none
    border: none
    font-size: 14px
    font-weight: 500
    color: $gray-500
    cursor: pointer
    position: relative
    transition: color $transition-fast

    &:hover
      color: $text-light

    &--active
      color: $primary-color

      &::after
        content: ''
        position: absolute
        bottom: -1px
        left: 0
        right: 0
        height: 2px
        background: $primary-color

  &__body
    flex: 1
    padding: 24px
    overflow-y: auto

  &__queue
    margin-top: 24px

    &-header
      display: flex
      align-items: center
      justify-content: space-between
      margin-bottom: 12px

      h3
        font-size: 14px
        font-weight: 600
        color: $text-light

    &-list
      display: flex
      flex-direction: column
      gap: 8px
      max-height: 300px
      overflow-y: auto

  &__clear-btn
    padding: 4px 12px
    background: none
    border: 1px solid $gray-300
    border-radius: $radius-sm
    font-size: 12px
    color: $gray-500
    cursor: pointer
    transition: all $transition-fast

    &:hover
      border-color: $error-color
      color: $error-color

  &__footer
    display: flex
    gap: 12px
    padding: 20px 24px
    border-top: 1px solid $gray-200

  &__btn
    flex: 1
    padding: 12px 24px
    font-size: 15px
    font-weight: 600
    border: none
    border-radius: $radius
    cursor: pointer
    transition: all $transition-fast
    display: flex
    align-items: center
    justify-content: center
    gap: 8px

    &--primary
      background: $primary-color
      color: white

      &:hover:not(:disabled)
        background: darken($primary-color, 8%)

      &:disabled
        opacity: 0.5
        cursor: not-allowed

    &--secondary
      background: $gray-100
      color: $text-light

      &:hover:not(:disabled)
        background: $gray-200

      &:disabled
        opacity: 0.5
        cursor: not-allowed

  &__spinner
    width: 16px
    height: 16px
    border: 2px solid rgba(white, 0.3)
    border-top-color: white
    border-radius: 50%
    animation: spin 0.8s linear infinite

.modal-enter-active,
.modal-leave-active
  transition: all 0.3s ease

.modal-enter-from,
.modal-leave-to
  opacity: 0

  .upload-modal__content
    transform: scale(0.9)

@keyframes spin
  to
    transform: rotate(360deg)
</style>
