/**
 * Mock API endpoint для регистрации
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, email, password } = body

  if (!username || !email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Все поля обязательны'
    })
  }

  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      message: 'Пароль должен быть не менее 6 символов'
    })
  }

  // Mock: проверка на существующий email
  if (email === 'test@test.com') {
    throw createError({
      statusCode: 409,
      message: 'Пользователь с таким email уже существует'
    })
  }

  const config = useRuntimeConfig()
  const isProduction = config.public?.nodeEnv === 'production'

  // access_token - доступен клиенту для проверки авторизации
  setCookie(event, 'access_token', 'mock_access_token_' + Date.now(), {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 15,
    path: '/'
  })

  // refresh_token - только httpOnly для безопасности
  setCookie(event, 'refresh_token', 'mock_refresh_token_' + Date.now(), {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  })

  return {
    user: {
      id: Date.now().toString(),
      email: email,
      username: username,
      avatar: null,
      createdAt: new Date().toISOString()
    }
  }
})
