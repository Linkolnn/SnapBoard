import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Интерфейс для элемента в Masonry Grid
 */
interface MasonryItem {
  id: string
  height: number
  column: number
  top: number
}

/**
 * Composable для расчёта Masonry Layout
 * Колонки автоматически растягиваются на всю доступную ширину
 * 
 * @param minColumnWidth - минимальная ширина колонки
 * @param gap - отступ между элементами
 */
export const useMasonryLayout = (minColumnWidth = 150, gap = 10) => {
  const items = ref<MasonryItem[]>([])
  const columnCount = ref(0)
  const columnWidth = ref(0)
  const columnHeights = ref<number[]>([])
  const containerHeight = ref(0)
  
  /**
   * Расчёт количества колонок и их ширины
   * @param availableWidth - доступная ширина (за вычетом padding)
   */
  const calculateColumns = (availableWidth: number) => {
    if (availableWidth <= 0) {
      return { count: 1, width: availableWidth }
    }
    
    // Рассчитываем сколько колонок влезет
    const maxColumns = Math.floor((availableWidth + gap) / (minColumnWidth + gap))
    const count = Math.max(1, Math.min(maxColumns, 5))
    
    // Рассчитываем ширину колонки чтобы заполнить всё пространство
    const totalGaps = (count - 1) * gap
    const width = Math.floor((availableWidth - totalGaps) / count)
    
    return { count, width }
  }
  
  /**
   * Найти самую короткую колонку
   */
  const getShortestColumn = (): number => {
    let shortest = 0
    let minHeight = columnHeights.value[0] || 0
    
    for (let i = 1; i < columnHeights.value.length; i++) {
      if (columnHeights.value[i] < minHeight) {
        minHeight = columnHeights.value[i]
        shortest = i
      }
    }
    
    return shortest
  }
  
  /**
   * Расчёт layout
   * @param itemHeights - массив высот элементов
   * @param availableWidth - доступная ширина контейнера
   */
  const calculateLayout = (itemHeights: number[], availableWidth: number) => {
    if (!itemHeights.length || availableWidth <= 0) return
    
    const { count, width } = calculateColumns(availableWidth)
    columnCount.value = count
    columnWidth.value = width
    columnHeights.value = new Array(count).fill(0)
    
    const calculatedItems: MasonryItem[] = []
    
    itemHeights.forEach((height, index) => {
      // Используем минимальную высоту если высота = 0
      const itemHeight = height > 0 ? height : 300
      
      const column = getShortestColumn()
      
      calculatedItems.push({
        id: `item-${index}`,
        height: itemHeight,
        column,
        top: columnHeights.value[column]
      })
      
      columnHeights.value[column] += itemHeight + gap
    })
    
    items.value = calculatedItems
    containerHeight.value = Math.max(...columnHeights.value, 0)
  }
  
  return {
    items,
    columnCount,
    columnWidth,
    containerHeight,
    gap,
    calculateLayout
  }
}