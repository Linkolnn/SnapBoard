<template>
  <section ref="gridRef" class="masonry-grid">
    <div 
      class="masonry-grid__container"
      :style="{ height: containerHeight + 'px' }"
    >
      <!-- Skeleton при загрузке -->
      <template v-if="isLoading">
        <div
          v-for="i in 8"
          :key="`skeleton-${i}`"
          class="masonry-grid__item"
          :style="getSkeletonStyle(i - 1)"
        >
          <ImageSkeleton :height="getRandomHeight()" />
        </div>
      </template>
      
      <!-- Реальные изображения -->
      <template v-else>
        <div
          v-for="(item, index) in layoutItems"
          :key="images[index]?.id || index"
          class="masonry-grid__item"
          :style="getItemStyle(item)"
        >
          <ImageCard
            v-if="images[index]"
            :image="images[index]"
            :estimated-height="item.height"
            @load="(h) => handleImageLoad(index, h)"
            @click="handleImageClick"
          />
        </div>
      </template>
    </div>
    
    <!-- Пустое состояние -->
    <div v-if="!isLoading && !images.length" class="masonry-grid__empty">
      <p>Изображений пока нет</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useMasonryLayout } from '~/composables/useMasonryLayout'
import type { Image } from '~/types'

interface Props {
  images: Image[]
  isLoading?: boolean
  minColumnWidth?: number
  gap?: number
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  minColumnWidth: 150,
  gap: 10
})

const emit = defineEmits<{
  imageClick: [image: Image]
}>()

const gridRef = ref<HTMLElement | null>(null)

const {
  items: layoutItems,
  columnCount,
  columnWidth,
  containerHeight,
  gap,
  calculateLayout
} = useMasonryLayout(props.minColumnWidth, props.gap)

const imageHeights = ref<number[]>([])
const loadedCount = ref(0)

/**
 * Получить доступную ширину контейнера (с учетом padding)
 */
const getAvailableWidth = (): number => {
  if (!gridRef.value) return 0
  
  const rect = gridRef.value.getBoundingClientRect()
  // Получаем ширину без padding
  const style = window.getComputedStyle(gridRef.value)
  const paddingLeft = parseInt(style.paddingLeft)
  const paddingRight = parseInt(style.paddingRight)
  
  return rect.width - paddingLeft - paddingRight
}

/**
 * Случайная высота для skeleton
 */
const getRandomHeight = () => {
  return Math.floor(Math.random() * 200) + 250
}

/**
 * Стили для skeleton
 */
const getSkeletonStyle = (index: number) => {
  const col = index % Math.max(columnCount.value, 1)
  const row = Math.floor(index / Math.max(columnCount.value, 1))
  
  return {
    position: 'absolute',
    left: `${col * (columnWidth.value + gap)}px`,
    top: `${row * 350}px`,
    width: `${columnWidth.value}px`
  }
}

/**
 * Стили для элемента
 */
const getItemStyle = (item: any) => {
  const style = {
    position: 'absolute',
    left: `${item.column * (columnWidth.value + gap)}px`,
    top: `${item.top}px`,
    width: `${columnWidth.value}px`,
  }
  
  return style
}

/**
 * Обработчик загрузки изображения
 */
const handleImageLoad = (index: number, height: number) => {
  imageHeights.value[index] = height
  loadedCount.value++
  
  // Пересчитываем layout сразу после каждой загрузки
  // Это позволяет карточкам появляться постепенно
  const width = getAvailableWidth()
  if (width > 0) {
    calculateLayout(imageHeights.value, width)
  }
}

/**
 * Клик по изображению
 */
const handleImageClick = (image: Image) => {
  emit('imageClick', image)
}

/**
 * Обновление layout
 */
const updateLayout = () => {
  if (!gridRef.value || !props.images.length) return
  
  const width = getAvailableWidth()
  
  // Если высоты уже есть - используем их
  if (imageHeights.value.length === props.images.length) {
    calculateLayout(imageHeights.value, width)
  } else {
    // Иначе используем примерные значения
    const estimated = new Array(props.images.length).fill(300)
    calculateLayout(estimated, width)
  }
}

/**
 * Наблюдаем за изменением массива изображений
 */
watch(() => props.images, (newImages) => {
  if (newImages.length > 0) {
    // Инициализируем примерными высотами для начального layout
    imageHeights.value = new Array(newImages.length).fill(300)
    loadedCount.value = 0
    
    nextTick(() => {
      const width = getAvailableWidth()
      if (width > 0) {
        calculateLayout(imageHeights.value, width)
      }
    })
  }
}, { immediate: true })

/**
 * Инициализация
 */
onMounted(() => {
  if (!gridRef.value) return
  
  // Первоначальный расчёт
  updateLayout()
  
  // Отслеживаем изменение размера
  const resizeObserver = new ResizeObserver(() => {
    updateLayout()
  })
  
  resizeObserver.observe(gridRef.value)
  
  onUnmounted(() => {
    resizeObserver.disconnect()
  })
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.masonry-grid
  width: 100%
  // Здесь НЕ устанавливаем max-width - это делает layout
  
  &__container
    position: relative
    width: 100%
    transition: height 0.3s ease
  
  &__item
    position: absolute
    transition: all 0.3s ease
  
  &__empty
    padding: 64px 24px
    text-align: center
    
    p
      font-size: 18px
      color: $gray-400
</style>