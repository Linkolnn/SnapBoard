/**
 * Единые настройки для masonry grid
 */
export const MASONRY_CONFIG = {
  // Минимальная ширина колонки
  minColumnWidth: {
    desktop: 280,
    tablet: 220,
    mobile: 140  // Уменьшено для 2 колонок на узких экранах
  },
  
  // Отступы между элементами
  gap: {
    desktop: 16,
    tablet: 12,
    mobile: 8
  },
  
  // Максимальное количество колонок
  maxColumns: 6,
  
  // Минимальное количество колонок
  minColumns: 2
}

/**
 * Получить конфигурацию для текущего размера экрана
 */
export function getMasonryConfig() {
  if (typeof window === 'undefined') {
    return {
      minColumnWidth: MASONRY_CONFIG.minColumnWidth.desktop,
      gap: MASONRY_CONFIG.gap.desktop
    }
  }
  
  const width = window.innerWidth
  
  if (width < 576) {
    return {
      minColumnWidth: MASONRY_CONFIG.minColumnWidth.mobile,
      gap: MASONRY_CONFIG.gap.mobile
    }
  }
  
  if (width < 1024) {
    return {
      minColumnWidth: MASONRY_CONFIG.minColumnWidth.tablet,
      gap: MASONRY_CONFIG.gap.tablet
    }
  }
  
  return {
    minColumnWidth: MASONRY_CONFIG.minColumnWidth.desktop,
    gap: MASONRY_CONFIG.gap.desktop
  }
}
