<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen" 
        class="image-modal"
        @click.self="handleClose"
      >
        <div class="image-modal__content">
          <!-- Кнопка закрытия внутри content -->
          <CommonBaseIconButton 
            class="image-modal__close" 
            variant="primary"
            size="lg"
            @click="handleClose"
          >
            ✕
          </CommonBaseIconButton>

          <div class="image-modal__image-container">
            <!-- Навигация внутри image-container -->
            <CommonBaseIconButton
              v-if="viewContext.hasPrev"
              class="image-modal__nav image-modal__nav--prev"
              variant="default"
              size="lg"
              @click="handlePrev"
            >
              ‹
            </CommonBaseIconButton>

            <CommonBaseIconButton
              v-if="viewContext.hasNext"
              class="image-modal__nav image-modal__nav--next"
              variant="default"
              size="lg"
              @click="handleNext"
            >
              ›
            </CommonBaseIconButton>

            <img
              :src="image.url"
              :alt="image.title || 'Image'"
              class="image-modal__image"
            />
            
            <div v-if="viewContext.totalImages > 1" class="image-modal__counter">
              {{ viewContext.currentIndex + 1 }} / {{ viewContext.totalImages }}
            </div>
          </div>

          <aside class="image-modal__sidebar">
            <template v-if="!isEditing">
              <ImageInfo :image="image" />
              <div class="image-modal__divider"></div>
              <ImageActions
                :image="image"
                @edit="startEditing"
                @delete="handleDelete"
              />
            </template>

            <template v-else>
              <ImageEditForm
                :image="image"
                :is-submitting="isSubmitting"
                @submit="handleEditSubmit"
                @cancel="cancelEditing"
              />
            </template>
          </aside>
        </div>
      </div>
    </Transition>
  </Teleport>

  <CommonConfirmModal
    :is-open="isDeleteModalOpen"
    title="Удалить изображение?"
    message="Это действие нельзя отменить. Изображение будет удалено навсегда."
    confirm-text="Удалить"
    type="danger"
    :is-loading="isDeleting"
    @confirm="confirmDelete"
    @cancel="cancelDelete"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Image, UpdateImageDto, ImageViewContext } from '~/types/image'
import { useImages } from '~/composables/useImages'

interface Props {
  isOpen: boolean
  image: Image
  viewContext: ImageViewContext
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  next: []
  prev: []
  update: [image: Image]
  delete: [id: string]
}>()

const { updateImage, deleteImage } = useImages()

const isEditing = ref(false)
const isSubmitting = ref(false)
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)

const handleClose = () => {
  if (isEditing.value) {
    cancelEditing()
  }
  emit('close')
}

const handleNext = () => {
  if (props.viewContext.hasNext) {
    emit('next')
  }
}

const handlePrev = () => {
  if (props.viewContext.hasPrev) {
    emit('prev')
  }
}

const startEditing = () => {
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
}

const handleEditSubmit = async (data: UpdateImageDto) => {
  isSubmitting.value = true
  
  try {
    const updated = await updateImage(props.image.id, data)
    
    if (updated) {
      emit('update', updated)
      cancelEditing()
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = () => {
  isDeleteModalOpen.value = true
}

const confirmDelete = async () => {
  isDeleting.value = true
  
  try {
    const success = await deleteImage(props.image.id)
    
    if (success) {
      isDeleteModalOpen.value = false
      emit('delete', props.image.id)
    }
  } finally {
    isDeleting.value = false
  }
}

const cancelDelete = () => {
  isDeleteModalOpen.value = false
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!props.isOpen) return
  
  switch (event.key) {
    case 'Escape':
      handleClose()
      break
    case 'ArrowLeft':
      handlePrev()
      break
    case 'ArrowRight':
      handleNext()
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.image-modal
  position: fixed
  inset: 0
  background: rgba(0, 0, 0, 0.9)
  display: flex
  align-items: center
  justify-content: center
  z-index: $z-index-modal
  padding: 24px

  @include mobile
    padding: 0

  &__content
    position: relative
    display: flex
    max-width: 1400px
    width: 100%
    max-height: 90vh
    background: white
    border-radius: $radius-lg
    overflow: hidden

    @include tablet
      flex-direction: column
      max-height: 95vh

  &__close
    position: absolute
    top: 16px
    right: 16px
    z-index: 10

    @include mobile
      top: 12px
      right: 12px

  &__image-container
    flex: 1
    position: relative
    display: flex
    align-items: center
    justify-content: center
    background: $secondary-color
    min-height: 400px

    @include tablet
      min-height: 330px
      max-height: 50vh

    @include mobile
      min-height: 320px
      max-height: 45vh

  &__nav
    position: absolute
    top: 50%
    transform: translateY(-50%)
    z-index: 5
    font-size: 28px

    @include mobile
      font-size: 22px

    &--prev
      left: 16px

    &--next
      right: 16px

  &__image
    width: 100%
    height: 100%
    object-fit: contain

    @include tablet
      width: 69%
      height: 69%

    @include mobile
      width: 100%
      max-height: 320px

  &__counter
    position: absolute
    bottom: 16px
    left: 50%
    transform: translateX(-50%)
    padding: 8px 16px
    background: rgba(0, 0, 0, 0.7)
    color: white
    border-radius: $radius-full
    font-size: 14px
    font-weight: 500

    @include mobile
      bottom: 8px
      padding: 6px 12px
      font-size: 12px

  &__sidebar
    width: 360px
    padding: 24px
    overflow-y: auto
    flex-shrink: 0

    @include laptop
      width: 320px
      padding: 20px

    @include tablet
      width: auto
      max-height: 45vh
      padding: 16px
      flex-shrink: 1

    @include mobile
      max-height: 50vh

  &__divider
    height: 1px
    background: $gray-200
    margin: 20px 0

    @include mobile
      margin: 16px 0

// Анимации
.modal-enter-active,
.modal-leave-active
  transition: all 0.3s ease

.modal-enter-from,
.modal-leave-to
  opacity: 0

  .image-modal__content
    transform: scale(0.95)
</style>
