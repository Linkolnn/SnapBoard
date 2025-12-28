/**
 * Mock API endpoint для выхода
 */
export default defineEventHandler((event) => {
  // Удаляем cookies
  deleteCookie(event, 'access_token', { path: '/' })
  deleteCookie(event, 'refresh_token', { path: '/' })

  return { success: true }
})
