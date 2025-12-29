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
            <CommonBaseButton 
              variant="secondary" 
              full-width 
              @click="handleCancel"
            >
              {{ cancelText }}
            </CommonBaseButton>
            <CommonBaseButton
              :variant="type === 'danger' ? 'danger' : 'primary'"
              full-width
              :loading="isLoading"
              @click="handleConfirm"
            >
              {{ confirmText }}
            </CommonBaseButton>
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
  background: var(--modal-overlay)
  display: flex
  align-items: center
  justify-content: center
  z-index: $z-index-modal
  padding: 16px
  
  &__content
    background: var(--modal-bg)
    border-radius: $radius-lg
    padding: 32px
    max-width: 400px
    width: 100%
    text-align: center
    box-shadow: var(--shadow-xl)
  
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
      background: var(--error-light)
    &--warning
      background: var(--warning-light)
    &--info
      background: var(--info-light)
  
  &__title
    font-size: 20px
    font-weight: 700
    color: var(--text-primary)
    margin-bottom: 12px
  
  &__message
    font-size: 15px
    color: var(--text-secondary)
    margin-bottom: 28px
    line-height: 1.5
  
  &__actions
    display: flex
    gap: 12px

.modal-enter-active, .modal-leave-active
  transition: all 0.3s ease

.modal-enter-from, .modal-leave-to
  opacity: 0
  .confirm-modal__content
    transform: scale(0.9)
</style>
