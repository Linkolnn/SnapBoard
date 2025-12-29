<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    :title="title"
    @click="$emit('click')"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'default' | 'primary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  disabled: false,
  title: ''
})

defineEmits<{
  click: []
}>()

const buttonClasses = computed(() => [
  'icon-btn',
  `icon-btn--${props.variant}`,
  `icon-btn--${props.size}`
])
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.icon-btn
  display: inline-flex
  align-items: center
  justify-content: center
  border: none
  border-radius: 50%
  cursor: pointer
  transition: all $transition-fast
  background: transparent
  color: var(--text-primary)

  &:disabled
    opacity: 0.5
    cursor: not-allowed

  // Размеры
  &--sm
    width: 32px
    height: 32px
    
    svg
      width: 16px
      height: 16px

  &--md
    width: 40px
    height: 40px
    
    svg
      width: 20px
      height: 20px

  &--lg
    width: 48px
    height: 48px
    
    svg
      width: 24px
      height: 24px

  // Варианты
  &--default
    background: var(--bg-tertiary)
    color: var(--text-primary)

    &:hover:not(:disabled)
      background: var(--bg-hover)

    &:active:not(:disabled)
      filter: brightness(0.95)

  &--primary
    background: var(--accent-color)
    color: var(--text-inverse)

    &:hover:not(:disabled)
      background: var(--accent-hover)

    &:active:not(:disabled)
      filter: brightness(0.9)

  &--danger
    background: var(--error-color)
    color: var(--text-inverse)

    &:hover:not(:disabled)
      filter: brightness(0.9)

    &:active:not(:disabled)
      filter: brightness(0.85)

  &--ghost
    background: transparent
    color: var(--text-primary)

    &:hover:not(:disabled)
      background: var(--button-ghost-hover)

    &:active:not(:disabled)
      background: var(--bg-tertiary)
</style>
