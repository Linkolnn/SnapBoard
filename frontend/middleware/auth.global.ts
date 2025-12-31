/**
 * Глобальный middleware для проверки аутентификации
 * Проверяет наличие access_token и user_data cookies
 * НЕ делает никаких API запросов!
 */

export default defineNuxtRouteMiddleware((to) => {
  // Список защищённых роутов
  const protectedRoutes = ['/profile', '/boards', '/settings', '/favorites']

  // Список роутов только для гостей
  const guestRoutes = ['/login', '/register']

  // Проверяем наличие cookies
  const accessToken = useCookie('access_token')
  const userData = useCookie('user_data')
  
  // Авторизован только если есть И токен И данные пользователя
  const isAuthenticated = !!accessToken.value && !!userData.value

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
