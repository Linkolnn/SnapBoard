/**
 * Plugin для инициализации аутентификации
 * Выполняется только на клиенте
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  // Импортируем store внутри plugin
  const { useAuthStore } = await import('~/store/auth')
  const authStore = useAuthStore(nuxtApp.$pinia)
  
  // Получаем данные пользователя если токен есть в cookie
  try {
    await authStore.fetchCurrentUser()
  } catch (error) {
    console.error('Failed to fetch current user:', error)
  }
})