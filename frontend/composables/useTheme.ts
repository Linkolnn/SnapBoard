import { useThemeStore, type ThemeMode, type ResolvedTheme } from '~/store/theme'
import { storeToRefs } from 'pinia'

/**
 * Composable для работы с темой
 */
export function useTheme() {
  const themeStore = useThemeStore()
  const { theme, resolvedTheme, isDark } = storeToRefs(themeStore)

  /**
   * Установить тему
   */
  const setTheme = (newTheme: ThemeMode) => {
    themeStore.setTheme(newTheme)
  }

  /**
   * Переключить между light и dark
   */
  const toggleTheme = () => {
    themeStore.toggleTheme()
  }

  /**
   * Инициализировать тему (вызывается в plugin)
   */
  const initTheme = () => {
    themeStore.initTheme()
  }

  /**
   * Получить иконку для текущей темы
   */
  const themeIcon = computed(() => {
    if (theme.value === 'system') return '💻'
    return isDark.value ? '🌙' : '☀️'
  })

  /**
   * Получить название темы
   */
  const themeName = computed(() => {
    switch (theme.value) {
      case 'light': return 'Светлая'
      case 'dark': return 'Тёмная'
      case 'system': return 'Системная'
    }
  })

  return {
    theme,
    resolvedTheme,
    isDark,
    themeIcon,
    themeName,
    setTheme,
    toggleTheme,
    initTheme
  }
}
