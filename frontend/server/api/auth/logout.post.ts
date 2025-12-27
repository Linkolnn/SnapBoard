/**
 * Mock API endpoint для выхода
 */
export default defineEventHandler((event) => {
    // Удаляем cookies
    deleteCookie(event, 'access_token')
    deleteCookie(event, 'refresh_token')
    
    return { success: true }
  })