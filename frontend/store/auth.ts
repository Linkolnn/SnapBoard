import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { User } from '~/types'
import { useApi } from '~/composables/useApi'
import { useBoardsStore } from '~/store/boards'

interface AuthResponse {
  user: User
  accessToken?: string
}

export const useAuthStore = defineStore('auth', () => {
  // Cookie для хранения данных пользователя (JSON)
  const userCookie = useCookie<User | null>('user_data', {
    maxAge: 7 * 24 * 60 * 60, // 7 дней
    sameSite: 'lax'
  })
  
  // Cookie для проверки авторизации (устанавливается бэкендом)
  const accessToken = useCookie('access_token')

  // Инициализируем user из cookie
  const user = ref<User | null>(userCookie.value || null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Проверяем авторизацию по наличию токена И данных пользователя
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  const { post } = useApi()

  // Синхронизируем user с cookie
  watch(user, (newUser) => {
    userCookie.value = newUser
  }, { deep: true })

  // Очистка данных других сторов при смене пользователя
  const clearUserData = () => {
    const boardsStore = useBoardsStore()
    boardsStore.clearBoards()
  }

  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      // Очищаем данные предыдущего пользователя перед входом
      clearUserData()
      
      const response = await post<AuthResponse>('/auth/login', { email, password })
      user.value = response.user
      return { success: true }
    } catch (err: any) {
      console.error('Login error:', err)
      const message = err.data?.message || err.message || 'Ошибка при входе'
      error.value = Array.isArray(message) ? message[0] : message
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (username: string, email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await post<AuthResponse>('/auth/register', { username, email, password })
      user.value = response.user
      return { success: true }
    } catch (err: any) {
      console.error('Register error:', err)
      const message = err.data?.message || err.message || 'Ошибка при регистрации'
      error.value = Array.isArray(message) ? message[0] : message
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await post('/auth/logout', {})
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Очищаем данные пользователя
      clearUserData()
      user.value = null
      userCookie.value = null
      error.value = null
    }
  }

  const updateProfile = (data: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...data }
    }
  }

  const updateAvatar = (avatarUrl: string) => {
    if (user.value) {
      user.value = { ...user.value, avatar: avatarUrl }
    }
  }

  /**
   * Запрос сброса пароля
   */
  const forgotPassword = async (email: string): Promise<{ message: string; token?: string }> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await post<{ message: string; token?: string }>('/auth/forgot-password', { email })
      return response
    } catch (err: any) {
      const message = err.data?.message || 'Ошибка при запросе сброса пароля'
      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Сброс пароля по токену
   */
  const resetPassword = async (token: string, password: string): Promise<{ message: string }> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await post<{ message: string }>('/auth/reset-password', { token, password })
      return response
    } catch (err: any) {
      const message = err.data?.message || 'Ошибка при сбросе пароля'
      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Очистка ошибки
   */
  const clearError = () => {
    error.value = null
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    updateAvatar,
    forgotPassword,
    resetPassword,
    clearError
  }
})
