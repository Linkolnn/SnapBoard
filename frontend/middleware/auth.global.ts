/**
 * Глобальный middleware для проверки аутентификации
 * Работает на клиенте и сервере
 */
export default defineNuxtRouteMiddleware((to) => {
  // Список защищённых роутов
  const protectedRoutes = ['/profile', '/boards', '/settings']

  // Список роутов только для гостей
  const guestRoutes = ['/login', '/register']

  // Проверяем наличие токена в cookie
  const accessToken = useCookie('access_token')
  const isAuthenticated = !!accessToken.value

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
