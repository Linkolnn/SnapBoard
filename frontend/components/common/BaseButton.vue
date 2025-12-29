<template>
    <button
        :class="buttonClasses"
        :disabled="disabled || loading"
        @click="handleClick"
    >
        <span v-if="loading" class="base-btn__spinner"></span>
        <span v-if="!loading" class="base-btn__content">
            <slot></slot>            
        </span>
    </button>
</template>
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    loading?: boolean
    fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    fullWidth: false
});

const emit = defineEmits<{
    click: [e: MouseEvent]
}>()

const buttonClasses = computed(() => [
    'base-btn',
    `base-btn--${props.variant}`,
    `base-btn--${props.size}`,
    {
        'base-btn--loading': props.loading,
        'base-btn--full-width': props.fullWidth
    }
])

const handleClick = (e: MouseEvent) => {
    emit('click', e)
};
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.base-btn
  position: relative
  display: inline-flex
  align-items: center
  justify-content: center
  font-weight: 600
  line-height: 1.5
  border-radius: $radius-sm
  border: 2px solid transparent
  cursor: pointer
  transition: all $transition-normal
  
  &:focus
    outline: none
    box-shadow: 0 0 0 3px var(--accent-light)
  
  &:disabled
    opacity: 0.5
    cursor: not-allowed
  
  &--loading
    cursor: wait

  // Размеры
  &--sm
    padding: 6px 12px
    font-size: 13px

  &--md
    padding: 10px 16px
    font-size: 15px

  &--lg
    padding: 14px 24px
    font-size: 16px

  // Полная ширина
  &--full-width
    width: 100%

  // Варианты
  &--primary
    background: var(--accent-color)
    color: var(--text-inverse)
    
    &:hover:not(:disabled)
      background: var(--accent-hover)
      transform: translateY(-2px) 
      box-shadow: var(--shadow-md)
    
    &:active:not(:disabled)
      transform: translateY(0)

  &--secondary
    background: var(--bg-tertiary)
    color: var(--text-primary)
    
    &:hover:not(:disabled)
      background: var(--bg-hover)
      transform: translateY(-2px)
      box-shadow: var(--shadow-md)
    
    &:active:not(:disabled)
      transform: translateY(0)

  &--outline
    background: transparent
    color: var(--accent-color)
    border-color: var(--accent-color)
    
    &:hover:not(:disabled)
      background: var(--accent-color)
      color: var(--text-inverse)
      transform: translateY(-2px)
      box-shadow: var(--shadow-md)
    
    &:active:not(:disabled)
      transform: translateY(0)

  &--danger
    background: var(--error-color)
    color: var(--text-inverse)
    
    &:hover:not(:disabled)
      filter: brightness(0.9)
      transform: translateY(-2px)
      box-shadow: var(--shadow-md)
    
    &:active:not(:disabled)
      transform: translateY(0)
    
    &:focus
      box-shadow: 0 0 0 3px var(--error-light)

  &--ghost
    background: transparent
    color: var(--text-primary)
    
    &:hover:not(:disabled)
      background: var(--button-ghost-hover)
    
    &:active:not(:disabled)
      background: var(--bg-tertiary)
    
    &:focus
      box-shadow: none

  &__content
    display: flex
    align-items: center
    gap: 8px

  &__spinner
    width: 16px
    height: 16px
    border: 2px solid rgba(255, 255, 255, 0.3)
    border-top-color: white
    border-radius: 50%
    animation: spin 0.6s linear infinite

  // Для ghost и secondary спиннер должен быть тёмным
  &--ghost &__spinner,
  &--secondary &__spinner
    border-color: var(--border-color)
    border-top-color: var(--text-primary)

@keyframes spin
  to
    transform: rotate(360deg)
</style>