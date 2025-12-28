<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="confirm-modal" @click.self="handleCancel">
        <article class="confirm-modal__content">
          <div class="confirm-modal__icon" :class="`confirm-modal__icon--${type}`">
            {{ typeIcon }}
          </div>
          <h3 class="confirm-modal__title">{{ title }}</h3>
          <p class="confirm-modal__message">{{ message }}</p>
          <div class="confirm-modal__actions">
            <button class="confirm-modal__btn confirm-modal__btn--secondary" @click="handleCancel">
              {{ cancelText }}
            </button>
            <button
              class="confirm-modal__btn"
              :class="`confirm-modal__btn--${type}`"
              :disabled="isLoading"
              @click="handleConfirm"
            >
              <span v-if="isLoading" class="confirm-modal__spinner"></span>
              {{ confirmText }}
            </button>
          </div>
        </article>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  isOpen: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Подтверждение',
  message: 'Вы уверены?',
  confirmText: 'Подтвердить',
  cancelText: 'Отмена',
  type: 'danger',
  isLoading: false
})

const emit = defineEmits<{ confirm: [], cancel: [] }>()

const typeIcon = computed(() => {
  const icons = { danger: '⚠️', warning: '⚡', info: 'ℹ️' }
  return icons[props.type] || '⚠️'
})

const handleConfirm = () => !props.isLoading && emit('confirm')
const handleCancel = () => !props.isLoading && emit('cancel')
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.confirm-modal
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
    padding: 32px
    max-width: 400px
    width: 100%
    text-align: center
    box-shadow: $shadow-xl
  
  &__icon
    width: 64px
    height: 64px
    border-radius: 50%
    display: flex
    align-items: center
    justify-content: center
    font-size: 32px
    margin: 0 auto 20px
    
    &--danger
      background: rgba($error, 0.1)
    &--warning
      background: rgba($warning, 0.1)
    &--info
      background: rgba($info, 0.1)
  
  &__title
    font-size: 20px
    font-weight: 700
    color: $text-light
    margin-bottom: 12px
  
  &__message
    font-size: 15px
    color: $gray-500
    margin-bottom: 28px
    line-height: 1.5
  
  &__actions
    display: flex
    gap: 12px
  
  &__btn
    flex: 1
    padding: 12px 20px
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
    
    &--secondary
      background: $gray-100
      color: $text-light
      &:hover
        background: $gray-200
    
    &--danger
      background: $error
      color: white
      &:hover:not(:disabled)
        background: darken($error, 8%)
    
    &--warning
      background: $warning
      color: white
    
    &--info
      background: $info
      color: white
    
    &:disabled
      opacity: 0.6
      cursor: not-allowed
  
  &__spinner
    width: 16px
    height: 16px
    border: 2px solid rgba(white, 0.3)
    border-top-color: white
    border-radius: 50%
    animation: spin 0.8s linear infinite

.modal-enter-active, .modal-leave-active
  transition: all 0.3s ease

.modal-enter-from, .modal-leave-to
  opacity: 0
  .confirm-modal__content
    transform: scale(0.9)

@keyframes spin
  to
    transform: rotate(360deg)
</style>
