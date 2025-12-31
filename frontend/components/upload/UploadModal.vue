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
                <CommonBaseButton
                  v-if="!hasActiveUploads"
                  variant="ghost"
                  size="sm"
                  @click="clearQueue"
                >
                  Очистить
                </CommonBaseButton>
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
            <CommonBaseButton
              variant="secondary"
              size="lg"
              :disabled="hasActiveUploads"
              full-width
              @click="handleClose"
            >
              Отмена
            </CommonBaseButton>
            <CommonBaseButton
              variant="primary"
              size="lg"
              :disabled="!pendingUploads.length || hasActiveUploads"
              :loading="hasActiveUploads"
              full-width
              @click="handleUploadAll"
            >
              {{ hasActiveUploads ? `Загрузка ${totalUploadProgress}%` : `Загрузить (${pendingUploads.length})` }}
            </CommonBaseButton>
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
  background: var(--modal-overlay)
  display: flex
  align-items: center
  justify-content: center
  z-index: $z-index-modal
  padding: 16px

  &__content
    background: var(--modal-bg)
    border-radius: $radius-lg
    width: 100%
    max-width: 600px
    max-height: 90vh
    display: flex
    flex-direction: column
    overflow: hidden
    border: 1px solid var(--border-color)

  &__header
    display: flex
    align-items: center
    justify-content: space-between
    padding: 20px 24px
    border-bottom: 1px solid var(--border-color)

  &__title
    font-size: 20px
    font-weight: 700
    color: var(--text-primary)

  &__close
    width: 32px
    height: 32px
    border: none
    background: var(--bg-tertiary)
    border-radius: 50%
    cursor: pointer
    font-size: 16px
    color: var(--text-primary)
    transition: all $transition-fast

    &:hover:not(:disabled)
      background: var(--bg-hover)

    &:disabled
      opacity: 0.5
      cursor: not-allowed

  &__tabs
    display: flex
    padding: 0 24px
    border-bottom: 1px solid var(--border-color)
    background: var(--modal-bg)

  &__tab
    padding: 12px 16px
    background: none
    border: none
    font-size: 14px
    font-weight: 500
    color: var(--text-muted)
    cursor: pointer
    position: relative
    transition: color $transition-fast

    &:hover
      color: var(--text-primary)

    &--active
      color: var(--accent-color)

      &::after
        content: ''
        position: absolute
        bottom: -1px
        left: 0
        right: 0
        height: 2px
        background: var(--accent-color)

  &__body
    flex: 1
    padding: 24px
    overflow-y: auto
    background: var(--modal-bg)

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
        color: var(--text-primary)

    &-list
      display: flex
      flex-direction: column
      gap: 8px
      max-height: 300px
      overflow-y: auto

  &__footer
    display: flex
    gap: 12px
    padding: 20px 24px
    border-top: 1px solid var(--border-color)
    background: var(--modal-bg)

.modal-enter-active,
.modal-leave-active
  transition: all 0.3s ease

.modal-enter-from,
.modal-leave-to
  opacity: 0

  .upload-modal__content
    transform: scale(0.9)
</style>
