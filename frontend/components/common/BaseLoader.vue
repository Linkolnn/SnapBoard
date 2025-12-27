<template>
    <article :class="['base-loader', `base-loader--${size}`]">
        <div class="base-loader__spinner"></div>
    </article>
</template>
<script setup lang="ts">

interface Props {
    size?: 'small' | 'medium' | 'large' 
}

withDefaults(defineProps<Props>(), {
    size: 'medium',
});
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.base-loader
  display: flex
  align-items: center
  justify-content: center
  
  // Сам спиннер - вращающийся круг
  &__spinner
    border-radius: 50%
    border: 3px solid $gray-200
    border-top-color: $primary-color
    animation: spin 0.8s linear infinite
  
  // Размеры спиннера
  &--small &__spinner
    width: 20px
    height: 20px
    border-width: 2px
  
  &--medium &__spinner
    width: 40px
    height: 40px
    border-width: 3px
  
  &--large &__spinner
    width: 60px
    height: 60px
    border-width: 4px

// Анимация вращения
@keyframes spin
  to
    transform: rotate(360deg)
</style>