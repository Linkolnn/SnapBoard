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
    // Если email = test@test.com и password = 123456
    if (email === 'test@test.com' && password === '123456') {
      setCookie(event, 'access_token', 'mock_access_token_' + Date.now(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 15
      })
      
      setCookie(event, 'refresh_token', 'mock_refresh_token_' + Date.now(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7
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
    
    // Иначе - ошибка "неверные данные"
    throw createError({
      statusCode: 401,
      message: 'Неверный email или пароль'
    })
  })