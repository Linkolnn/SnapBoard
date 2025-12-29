<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast--${toast.type}`]"
          @click="removeToast(toast.id)"
        >
          <span class="toast__icon">
            {{ getIcon(toast.type) }}
          </span>
          <span class="toast__message">{{ toast.message }}</span>
          <button class="toast__close" @click.stop="removeToast(toast.id)">
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { toasts, removeToast } = useToast()

const getIcon = (type: string) => {
  switch (type) {
    case 'success': return '✓'
    case 'error': return '✕'
    case 'warning': return '⚠'
    case 'info': 
    default: return 'ℹ'
  }
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.toast-container
  position: fixed
  bottom: 24px
  right: 24px
  z-index: 9999
  display: flex
  flex-direction: column
  gap: 12px
  max-width: 400px

.toast
  display: flex
  align-items: center
  gap: 12px
  padding: 14px 16px
  background: white
  border-radius: $radius
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
  cursor: pointer
  transition: all 0.2s ease
  
  &:hover
    transform: translateX(-4px)
  
  &--success
    border-left: 4px solid #10b981
    
    .toast__icon
      color: #10b981
  
  &--error
    border-left: 4px solid $error-color
    
    .toast__icon
      color: $error-color
  
  &--warning
    border-left: 4px solid #f59e0b
    
    .toast__icon
      color: #f59e0b
  
  &--info
    border-left: 4px solid $primary-color
    
    .toast__icon
      color: $primary-color

  &__icon
    font-size: 18px
    font-weight: 700
  
  &__message
    flex: 1
    font-size: 14px
    color: $text-light
  
  &__close
    background: none
    border: none
    color: $gray-400
    cursor: pointer
    padding: 4px
    font-size: 12px
    
    &:hover
      color: $text-light

// Анимации
.toast-enter-active,
.toast-leave-active
  transition: all 0.3s ease

.toast-enter-from
  opacity: 0
  transform: translateX(100%)

.toast-leave-to
  opacity: 0
  transform: translateX(100%)
</style>
