import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'snapboard-theme'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: 'system' as ThemeMode,
    systemTheme: 'light' as ResolvedTheme
  }),

  getters: {
    /**
     * Фактическая тема (light или dark)
     */
    resolvedTheme(): ResolvedTheme {
      if (this.theme === 'system') {
        return this.systemTheme
      }
      return this.theme
    },

    /**
     * Тёмная тема активна?
     */
    isDark(): boolean {
      return this.resolvedTheme === 'dark'
    }
  },

  actions: {
    /**
     * Установить тему
     */
    setTheme(theme: ThemeMode) {
      this.theme = theme
      this.saveToStorage()
      this.applyTheme()
    },

    /**
     * Переключить между light и dark
     */
    toggleTheme() {
      const newTheme: ThemeMode = this.resolvedTheme === 'light' ? 'dark' : 'light'
      this.setTheme(newTheme)
    },

    /**
     * Установить системную тему
     */
    setSystemTheme(theme: ResolvedTheme) {
      this.systemTheme = theme
      if (this.theme === 'system') {
        this.applyTheme()
      }
    },

    /**
     * Инициализация темы
     */
    initTheme() {
      // Загружаем из localStorage
      this.loadFromStorage()
      
      // Определяем системную тему
      this.detectSystemTheme()
      
      // Слушаем изменения системной темы
      this.watchSystemTheme()
      
      // Применяем тему
      this.applyTheme()
    },

    /**
     * Загрузить тему из localStorage
     */
    loadFromStorage() {
      if (typeof window === 'undefined') return
      
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        this.theme = stored as ThemeMode
      }
    },

    /**
     * Сохранить тему в localStorage
     */
    saveToStorage() {
      if (typeof window === 'undefined') return
      localStorage.setItem(STORAGE_KEY, this.theme)
    },

    /**
     * Определить системную тему
     */
    detectSystemTheme() {
      if (typeof window === 'undefined') return
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      this.systemTheme = mediaQuery.matches ? 'dark' : 'light'
    },

    /**
     * Слушать изменения системной темы
     */
    watchSystemTheme() {
      if (typeof window === 'undefined') return
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      mediaQuery.addEventListener('change', (e) => {
        this.systemTheme = e.matches ? 'dark' : 'light'
        if (this.theme === 'system') {
          this.applyTheme()
        }
      })
    },

    /**
     * Применить тему к DOM
     */
    applyTheme() {
      if (typeof document === 'undefined') return
      
      const html = document.documentElement
      const resolved = this.resolvedTheme
      
      // Добавляем класс для плавного перехода
      html.classList.add('theme-transition')
      
      // Устанавливаем data-theme
      html.setAttribute('data-theme', resolved)
      
      // Убираем класс перехода после анимации
      setTimeout(() => {
        html.classList.remove('theme-transition')
      }, 300)
    }
  }
})
