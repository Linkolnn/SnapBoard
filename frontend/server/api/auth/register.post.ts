/**
 * Mock API endpoint для регистрации
 * Временная заглушка до создания настоящего backend
 */
export default defineEventHandler(async (event) => {
    // Читаем данные из запроса
    const body = await readBody(event)
    const { username, email, password } = body
    
    // Простая валидация (mock)
    if (!username || !email || !password) {
      throw createError({
        statusCode: 400,
        message: 'Все поля обязательны для заполнения'
      })
    }
    
    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        message: 'Пароль должен быть минимум 6 символов'
      })
    }
    
    // Устанавливаем cookies с токенами
    setCookie(event, 'access_token', 'mock_access_token_' + Date.now(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 15 // 15 минут
    })
    
    setCookie(event, 'refresh_token', 'mock_refresh_token_' + Date.now(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 дней
    })
    
    // Возвращаем mock данные пользователя
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