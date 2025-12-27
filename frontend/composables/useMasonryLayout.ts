import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Интерфейс для элемента в Masonry Grid
 */
interface MasonryItem {
  id: string
  height: number  // высота элемента в пикселях
  column: number  // в какую колонку поместить элемент
  top: number     // позиция сверху в пикселях
}

/**
 * Composable для расчёта Masonry Layout
 * Автоматически распределяет элементы по колонкам
 * 
 * @param columnWidth - ширина одной колонки в пикселях
 * @param gap - отступ между элементами в пикселях
 * @returns объект с методами и данными для layout
 */
export const useMasonryLayout = (columnWidth = 280, gap = 16) => {
  /**
   * Массив элементов с рассчитанными позициями
   */
  const items = ref<MasonryItem[]>([])
  
  /**
   * Количество колонок на текущем экране
   */
  const columnCount = ref(0)
  
  /**
   * Высота каждой колонки (для равномерного распределения)
   */
  const columnHeights = ref<number[]>([])
  
  /**
   * Общая высота контейнера Masonry Grid
   */
  const containerHeight = ref(0)
  
  /**
   * Расчёт количества колонок в зависимости от ширины экрана
   */
  const calculateColumnCount = (): number => {
    if (!process.client) return 4
    
    const containerWidth = window.innerWidth
    
    // Вычитаем padding контейнера (24px * 2)
    const availableWidth = containerWidth - 48
    
    // Рассчитываем сколько колонок влезет
    const cols = Math.floor((availableWidth + gap) / (columnWidth + gap))
    
    // Минимум 1 колонка, максимум 6
    return Math.max(1, Math.min(cols, 6))
  }
  
  /**
   * Найти колонку с минимальной высотой
   * Это нужно чтобы элементы распределялись равномерно
   */
  const getShortestColumn = (): number => {
    let shortestColumn = 0
    let minHeight = columnHeights.value[0] || 0
    
    for (let i = 1; i < columnHeights.value.length; i++) {
      if (columnHeights.value[i] < minHeight) {
        minHeight = columnHeights.value[i]
        shortestColumn = i
      }
    }
    
    return shortestColumn
  }
  
  /**
   * Расчёт позиций всех элементов
   * @param itemHeights - массив высот элементов
   */
  const calculateLayout = (itemHeights: number[]) => {
    // Инициализируем колонки
    columnCount.value = calculateColumnCount()
    columnHeights.value = new Array(columnCount.value).fill(0)
    
    // Массив для рассчитанных элементов
    const calculatedItems: MasonryItem[] = []
    
    // Проходим по каждому элементу
    itemHeights.forEach((height, index) => {
      // Находим самую короткую колонку
      const column = getShortestColumn()
      
      // Вычисляем позицию элемента
      const item: MasonryItem = {
        id: `item-${index}`,
        height: height,
        column: column,
        top: columnHeights.value[column]
      }
      
      calculatedItems.push(item)
      
      // Увеличиваем высоту колонки (высота элемента + gap)
      columnHeights.value[column] += height + gap
    })
    
    // Обновляем items
    items.value = calculatedItems
    
    // Общая высота = высота самой длинной колонки
    containerHeight.value = Math.max(...columnHeights.value)
  }
  
  /**
   * Пересчёт layout при изменении размера окна
   */
  const handleResize = () => {
    // Получаем текущие высоты элементов
    const heights = items.value.map(item => item.height)
    if (heights.length > 0) {
      calculateLayout(heights)
    }
  }
  
  /**
   * Инициализация при монтировании компонента
   */
  onMounted(() => {
    if (process.client) {
      window.addEventListener('resize', handleResize)
    }
  })
  
  /**
   * Очистка при размонтировании
   */
  onUnmounted(() => {
    if (process.client) {
      window.removeEventListener('resize', handleResize)
    }
  })
  
  return {
    items,
    columnCount,
    columnWidth,
    gap,
    containerHeight,
    calculateLayout,
    handleResize
  }
}