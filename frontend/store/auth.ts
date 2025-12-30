import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '~/types'

interface AuthResponse {
  user: User
  accessToken?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  const { post, get } = useApi()

  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
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
      user.value = null
      error.value = null
    }
  }

  const fetchCurrentUser = async () => {
    try {
      const response = await get<User>('/auth/me')
      user.value = response
    } catch (err) {
      // Пользователь не авторизован - это нормально
      user.value = null
    }
  }

  const refreshAccessToken = async () => {
    try {
      await post('/auth/refresh', {})
      return true
    } catch (err) {
      console.error('Token refresh failed:', err)
      await logout()
      throw err
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

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    fetchCurrentUser,
    refreshAccessToken,
    updateProfile,
    updateAvatar
  }
})
