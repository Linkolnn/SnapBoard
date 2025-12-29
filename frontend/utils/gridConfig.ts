/**
 * Единые настройки для masonry grid
 * Брейкпоинты соответствуют variables.sass
 */
export const MASONRY_CONFIG = {
  // Минимальная ширина колонки
  minColumnWidth: {
    desktop: 300,    // > 1024px
    laptop: 280,     // 768px - 1024px
    tablet: 250,     // 576px - 768px
    mobile: 220,     // 380px - 576px
    narrow: 120      // < 380px (для 2 колонок на узких экранах)
  },
  
  // Отступы между элементами
  gap: {
    desktop: 16,
    laptop: 14,
    tablet: 12,
    mobile: 8,
    narrow: 6
  },
  
  // Максимальное количество колонок
  maxColumns: 5,
  
  // Минимальное количество колонок
  minColumns: 2,
  
  // Брейкпоинты (соответствуют variables.sass)
  breakpoints: {
    desktop: 1440,
    laptop: 1024,
    tablet: 768,
    mobile: 576,
    narrow: 380  // Новый брейкпоинт для 2 колонок
  }
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
  const { breakpoints, minColumnWidth, gap } = MASONRY_CONFIG
  
  // < 380px - узкие экраны, 2 колонки
  if (width < breakpoints.narrow) {
    return {
      minColumnWidth: minColumnWidth.narrow,
      gap: gap.narrow
    }
  }
  
  // 380px - 576px - mobile
  if (width < breakpoints.mobile) {
    return {
      minColumnWidth: minColumnWidth.mobile,
      gap: gap.mobile
    }
  }
  
  // 576px - 768px - tablet
  if (width < breakpoints.tablet) {
    return {
      minColumnWidth: minColumnWidth.tablet,
      gap: gap.tablet
    }
  }
  
  // 768px - 1024px - laptop
  if (width < breakpoints.laptop) {
    return {
      minColumnWidth: minColumnWidth.laptop,
      gap: gap.laptop
    }
  }
  
  // > 1024px - desktop
  return {
    minColumnWidth: minColumnWidth.desktop,
    gap: gap.desktop
  }
}
