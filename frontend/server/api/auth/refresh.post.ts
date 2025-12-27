/**
 * Mock API endpoint для обновления токена
 */
export default defineEventHandler((event) => {
    // Проверяем refresh token
    const refreshToken = getCookie(event, 'refresh_token')
    
    if (!refreshToken) {
      throw createError({
        statusCode: 401,
        message: 'Refresh token не найден'
      })
    }
    
    // Устанавливаем новый access token
    setCookie(event, 'access_token', 'mock_access_token_' + Date.now(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 15 // 15 минут
    })
    
    return {
      tokens: {
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: refreshToken
      }
    }
  })