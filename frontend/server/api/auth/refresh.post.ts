/**
 * Mock API endpoint для обновления токена
 */
export default defineEventHandler((event) => {
  const refreshToken = getCookie(event, 'refresh_token')

  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      message: 'Refresh token отсутствует'
    })
  }

  const config = useRuntimeConfig()
  const isProduction = config.public?.nodeEnv === 'production'

  // Обновляем access_token
  setCookie(event, 'access_token', 'mock_access_token_' + Date.now(), {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 15,
    path: '/'
  })

  return { success: true }
})
