<template>
  <article class="img-skeleton" :style="{ height: height + 'px' }">
    <div class="img-skeleton__shimmer"></div>
  </article>
</template>

<script setup lang="ts">
interface Props {
  height?: number
}

withDefaults(defineProps<Props>(), {
  height: 300
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.img-skeleton
  position: relative
  width: 100%
  background: $gray-200
  border-radius: $radius
  overflow: hidden
  
  &__shimmer
    position: absolute
    top: 0
    left: -100%
    width: 100%
    height: 100%
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)
    animation: shimmer 1.5s infinite
    
@keyframes shimmer
  0%
    left: -100%
  100%
    left: 100%
</style>