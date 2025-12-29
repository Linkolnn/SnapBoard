<template>
  <section ref="gridRef" class="masonry-grid">
    <!-- Skeleton при загрузке -->
    <template v-if="isLoading">
      <div
        v-for="i in 8"
        :key="`skeleton-${i}`"
        class="masonry-grid__item"
      >
        <ImageSkeleton :height="getRandomHeight()" />
      </div>
    </template>
    
    <!-- Реальные изображения -->
    <template v-else>
      <div
        v-for="image in images"
        :key="image.id"
        class="masonry-grid__item"
      >
        <ImageCard
          :image="image"
          @click="handleImageClick"
        />
      </div>
    </template>
    
    <!-- Пустое состояние -->
    <div v-if="!isLoading && !images.length" class="masonry-grid__empty">
      <p>Изображений пока нет</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getMasonryConfig, MASONRY_CONFIG } from '~/utils/gridConfig'
import type { Image } from '~/types'

interface Props {
  images: Image[]
  isLoading?: boolean
  minColumnWidth?: number
  gap?: number
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  minColumnWidth: undefined,
  gap: undefined
})

const emit = defineEmits<{
  imageClick: [image: Image]
}>()

const gridRef = ref<HTMLElement | null>(null)
const columnCount = ref(4)

// Используем конфигурацию по умолчанию если не передана
const gridConfig = computed(() => {
  const defaultConfig = getMasonryConfig()
  return {
    minColumnWidth: props.minColumnWidth ?? defaultConfig.minColumnWidth,
    gap: props.gap ?? defaultConfig.gap
  }
})

/**
 * Случайная высота для skeleton
 */
const getRandomHeight = () => {
  return Math.floor(Math.random() * 200) + 250
}

/**
 * Клик по изображению
 */
const handleImageClick = (image: Image) => {
  emit('imageClick', image)
}

/**
 * Расчёт количества колонок
 */
const updateColumnCount = () => {
  if (!gridRef.value) return
  
  const width = gridRef.value.offsetWidth
  const minWidth = gridConfig.value.minColumnWidth
  const gap = gridConfig.value.gap
  
  const count = Math.floor((width + gap) / (minWidth + gap))
  // Минимум 2 колонки, максимум из конфига
  columnCount.value = Math.max(MASONRY_CONFIG.minColumns, Math.min(count, MASONRY_CONFIG.maxColumns))
}

onMounted(() => {
  updateColumnCount()
  
  window.addEventListener('resize', updateColumnCount)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateColumnCount)
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.masonry-grid
  width: 100%
  column-count: v-bind(columnCount)
  column-gap: v-bind('gridConfig.gap + "px"')
  
  &__item
    break-inside: avoid
    margin-bottom: v-bind('gridConfig.gap + "px"')
  
  &__empty
    column-span: all
    padding: 64px 24px
    text-align: center
    
    p
      font-size: 18px
      color: $gray-400
</style>
