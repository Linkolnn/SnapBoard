/**
 * Plugin для инициализации темы на клиенте
 * Запускается только на клиенте (.client.ts)
 */
export default defineNuxtPlugin(() => {
  const { initTheme } = useTheme()
  
  // Инициализируем тему при загрузке
  initTheme()
})
