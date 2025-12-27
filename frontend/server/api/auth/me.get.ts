/**
 * Mock API endpoint для получения данных текущего пользователя
 */
export default defineEventHandler((event) => {
    // Проверяем наличие токена в cookie
    const accessToken = getCookie(event, 'access_token')
    
    if (!accessToken) {
      throw createError({
        statusCode: 401,
        message: 'Не авторизован'
      })
    }
    
    // Возвращаем mock данные пользователя
    return {
      user: {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        avatar: null,
        createdAt: new Date().toISOString()
      }
    }
  })