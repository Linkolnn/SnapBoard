<template>
    <button
        :class="['base-btn', `base-btn--${variant}`, {'base-btn--loading': loading}]"
        :disabled="disabled || loading"
        @click="handleClick"
    >
        <span v-if="loading" class="base-btn base-btn__spinner"></span>
        <span v-if="!loading" class="base-btn__content">
            <slot></slot>            
        </span>
    </button>
</template>
<script setup lang="ts">

interface Props {
    variant?: 'primary' | 'secondary' | 'outline'
    disabled?: boolean
    loading?: boolean
}

withDefaults(defineProps<Props>(), {
    variant: 'primary',
    disabled: false,
    loading: false
});

const emit = defineEmits<{
    click: []
}>()

const handleClick = () => {
    emit('click')
};
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.base-btn
  position: relative
  display: inline-flex
  align-items: center
  justify-content: center
  padding: 10px 16px // 12px 24px 
  font-size: 16px
  font-weight: 600
  line-height: 1.5
  border-radius: $radius-sm
  border: 2px solid transparent
  cursor: pointer
  transition: all $transition-normal
  
  &:focus
    outline: none
    box-shadow: 0 0 0 3px rgba(0, 220, 130, 0.2)
  
  &:disabled
    opacity: 0.5
    cursor: not-allowed
  
  &--loading
    cursor: wait

  &--primary
    background: $primary-color
    color: white
    
    &:hover:not(:disabled)
        background: darken($primary-color, 10%)
        transform: translateY(-2px) 
        box-shadow: $shadow-md
    
    &:active:not(:disabled)
      transform: translateY(0)

  &--secondary
    background: $secondary-color
    color: white
    
    &:hover:not(:disabled)
      background: lighten($secondary-color, 10%)
      transform: translateY(-2px)
      box-shadow: $shadow-md
    
    &:active:not(:disabled)
      transform: translateY(0)

  &--outline
    background: transparent
    color: $primary-color
    border-color: $primary-color
    
    &:hover:not(:disabled)
      background: $primary-color
      color: white
      transform: translateY(-2px)
      box-shadow: $shadow-md
    
    &:active:not(:disabled)
      transform: translateY(0)

  &__content
    display: flex
    align-items: center
    gap: 8px

  &__spinner
    padding: 10px
    max-width: 20px
    max-height: 20px
    border: 2px solid rgba(255, 255, 255, 0.3)
    border-top-color: white
    border-radius: 50%
    animation: spin 0.6s linear infinite

@keyframes spin
  to
    transform: rotate(360deg)

</style>