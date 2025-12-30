/**
 * Глобальный middleware для проверки аутентификации
 * Работает на клиенте
 */
import { useAuthStore } from '~/store/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  // Список защищённых роутов
  const protectedRoutes = ['/profile', '/boards', '/settings', '/favorites']

  // Список роутов только для гостей
  const guestRoutes = ['/login', '/register']

  // Проверяем авторизацию через store
  const authStore = useAuthStore()
  
  // Если user не загружен, пробуем получить через API
  if (!authStore.user) {
    try {
      await authStore.fetchCurrentUser()
    } catch {
      // Игнорируем ошибку - пользователь не авторизован
    }
  }

  const isAuthenticated = !!authStore.user

  // Если защищённый роут и не авторизован - на login
  if (protectedRoutes.some(route => to.path.startsWith(route)) && !isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  // Если роут для гостей и авторизован - на главную
  if (guestRoutes.includes(to.path) && isAuthenticated) {
    return navigateTo('/')
  }
})
