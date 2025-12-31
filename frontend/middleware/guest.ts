/**
 * Middleware для страниц, доступных только неавторизованным пользователям
 * (login, register, forgot-password, reset-password)
 */
export default defineNuxtRouteMiddleware(() => {
  const accessToken = useCookie('access_token')
  
  // Если пользователь авторизован - редирект на главную
  if (accessToken.value) {
    return navigateTo('/')
  }
})
