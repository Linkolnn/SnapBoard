/**
 * Mock API endpoint для входа
 * Credentials: test@test.com / 123456
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Email и пароль обязательны'
    })
  }

  // Mock: "существующий" пользователь
  if (email === 'test@test.com' && password === '123456') {
    const config = useRuntimeConfig()
    const isProduction = config.public?.nodeEnv === 'production'

    // access_token - доступен клиенту для проверки авторизации
    setCookie(event, 'access_token', 'mock_access_token_' + Date.now(), {
      httpOnly: false, // Доступен клиенту для middleware
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 минут
      path: '/'
    })

    // refresh_token - только httpOnly для безопасности
    setCookie(event, 'refresh_token', 'mock_refresh_token_' + Date.now(), {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 дней
      path: '/'
    })

    return {
      user: {
        id: '1',
        email: email,
        username: 'testuser',
        avatar: null,
        createdAt: new Date().toISOString()
      }
    }
  }

  throw createError({
    statusCode: 401,
    message: 'Неверный email или пароль'
  })
})
