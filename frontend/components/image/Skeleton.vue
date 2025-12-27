<template>
  <!-- 
    Skeleton loader для изображения
    Показывается пока изображение загружается
    Анимация пульсации создаёт эффект загрузки
  -->
  <article class="image-skeleton" :style="{ height: height + 'px' }">
    <div class="image-skeleton__shimmer"></div>
  </article>
</template>

<script setup lang="ts">
/**
 * Пропсы компонента
 */
interface Props {
  height?: number  // высота skeleton в пикселях
}

withDefaults(defineProps<Props>(), {
  height: 300
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.image-skeleton
  position: relative
  width: 100%
  background: $gray-200
  border-radius: $radius
  overflow: hidden
  
  // Shimmer эффект - движущийся градиент
  &__shimmer
    position: absolute
    top: 0
    left: -100%
    width: 100%
    height: 100%
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)
    // Анимация движения градиента слева направо
    animation: shimmer 1.5s infinite
    
// Анимация пульсации
@keyframes shimmer
  0%
    left: -100%
  100%
    left: 100%
</style>