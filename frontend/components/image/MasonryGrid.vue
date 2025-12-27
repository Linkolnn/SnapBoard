<template>
    <!-- 
      Masonry Grid для отображения изображений
      - Автоматический расчёт колонок в зависимости от ширины экрана
      - Lazy loading изображений
      - Skeleton loaders
      - Адаптивный layout
    -->
    <section class="masonry-grid">
      <!-- Контейнер с рассчитанной высотой -->
      <div 
        class="masonry-grid__container"
        :style="{ height: containerHeight + 'px' }"
      >
        <!-- Отображаем skeleton пока изображения загружаются -->
        <template v-if="isLoading">
          <div
            v-for="i in skeletonCount"
            :key="`skeleton-${i}`"
            class="masonry-grid__item"
            :style="getSkeletonStyle(i - 1)"
          >
            <ImageSkeleton :height="getRandomHeight()" />
          </div>
        </template>
        
        <!-- Отображаем реальные изображения -->
        <template v-else>
          <div
            v-for="(item, index) in layoutItems"
            :key="images[index]?.id || `item-${index}`"
            class="masonry-grid__item"
            :style="getItemStyle(item)"
          >
            <ImageCard
              :image="images[index]"
              :estimated-height="item.height"
              @load="(height) => handleImageLoad(index, height)"
              @click="handleImageClick"
            />
          </div>
        </template>
      </div>
      
      <!-- Сообщение если нет изображений -->
      <div v-if="!isLoading && images.length === 0" class="masonry-grid__empty">
        <p>Изображений пока нет</p>
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
  import { useMasonryLayout } from '~/composables/useMasonryLayout'
  import type { Image } from '~/types'
  
  /**
   * Пропсы компонента
   */
  interface Props {
    images: Image[]        // массив изображений для отображения
    isLoading?: boolean    // состояние загрузки
    columnWidth?: number   // ширина колонки в пикселях
    gap?: number          // отступ между элементами
  }
  
  const props = withDefaults(defineProps<Props>(), {
    isLoading: false,
    columnWidth: 280,
    gap: 16
  })
  
  /**
   * Эмиты компонента
   */
  const emit = defineEmits<{
    imageClick: [image: Image]  // клик по изображению
  }>()
  
  /**
   * Используем composable для расчёта layout
   */
  const {
    items: layoutItems,
    columnCount,
    columnWidth,
    gap,
    containerHeight,
    calculateLayout
  } = useMasonryLayout(props.columnWidth, props.gap)
  
  /**
   * Количество skeleton элементов для показа
   */
  const skeletonCount = ref(12)
  
  /**
   * Массив высот загруженных изображений
   */
  const imageHeights = ref<number[]>([])
  
  /**
   * Получить случайную высоту для skeleton
   * Создаёт визуальное разнообразие пока изображения грузятся
   */
  const getRandomHeight = (): number => {
    // Случайная высота от 200 до 400 пикселей
    return Math.floor(Math.random() * (400 - 200 + 1)) + 200
  }
  
  /**
   * Получить стили для skeleton элемента
   * Временные позиции пока не рассчитан настоящий layout
   */
  const getSkeletonStyle = (index: number) => {
    const column = index % columnCount.value
    const row = Math.floor(index / columnCount.value)
    
    return {
      position: 'absolute',
      left: `${column * (columnWidth + gap)}px`,
      top: `${row * 320}px`,  // примерная высота
      width: `${columnWidth}px`
    }
  }
  
  /**
   * Получить стили для элемента Masonry Grid
   */
  const getItemStyle = (item: any) => {
    return {
      position: 'absolute',
      left: `${item.column * (columnWidth + gap)}px`,
      top: `${item.top}px`,
      width: `${columnWidth}px`
    }
  }
  
  /**
   * Обработчик загрузки изображения
   * Сохраняем высоту и пересчитываем layout
   */
  const handleImageLoad = (index: number, height: number) => {
    imageHeights.value[index] = height
    
    // Пересчитываем layout с новыми высотами
    if (imageHeights.value.filter(h => h > 0).length === props.images.length) {
      calculateLayout(imageHeights.value)
    }
  }
  
  /**
   * Обработчик клика по изображению
   */
  const handleImageClick = (image: Image) => {
    emit('imageClick', image)
  }
  
  /**
   * Инициализация layout при изменении массива изображений
   */
  watch(() => props.images, (newImages) => {
    if (newImages.length > 0) {
      // Инициализируем массив высот примерными значениями
      imageHeights.value = new Array(newImages.length).fill(300)
      
      // Рассчитываем начальный layout
      calculateLayout(imageHeights.value)
    }
  }, { immediate: true })
  
  /**
   * Инициализация при монтировании
   */
  onMounted(() => {
    if (props.images.length > 0) {
      imageHeights.value = new Array(props.images.length).fill(300)
      calculateLayout(imageHeights.value)
    }
  })
  </script>
  
  <style lang="sass" scoped>
  @import '@/assets/styles/variables'
  
  .masonry-grid
    width: 100%
    
    // Контейнер с относительным позиционированием
    &__container
      position: relative
      width: 100%
      transition: height 0.3s ease
    
    // Элемент сетки (абсолютное позиционирование)
    &__item
      position: absolute
      transition: all 0.3s ease
    
    // Пустое состояние
    &__empty
      padding: 64px 24px
      text-align: center
      
      p
        font-size: 18px
        color: $gray-400
  </style>