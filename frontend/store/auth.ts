import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  const accessTokenCookie = useCookie('access_token', {
    maxAge: 60 * 15,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  })

  const isAuthenticated = computed(() => {
    return !!user.value && !!accessTokenCookie.value
  })

  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Используем /api/ для Nuxt server API
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      
      user.value = response.user
      
      return { success: true }
    } catch (err: any) {
      console.error('Login error:', err)
      error.value = err.data?.message || err.message || 'Ошибка при входе'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }
  
  const register = async (username: string, email: string, password: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Используем /api/ для Nuxt server API
      const response = await $fetch('/api/auth/register', {
        method: 'POST',
        body: { username, email, password }
      })
      
      user.value = response.user
      
      return { success: true }
    } catch (err: any) {
      console.error('Register error:', err)
      error.value = err.data?.message || err.message || 'Ошибка при регистрации'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }
  
  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST'
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      user.value = null
      error.value = null
      accessTokenCookie.value = null
    }
  }
  
  const fetchCurrentUser = async () => {
    if (!accessTokenCookie.value) {
      return
    }
    
    try {
      const response = await $fetch('/api/auth/me')
      user.value = response.user
    } catch (err) {
      console.error('Failed to fetch current user:', err)
      user.value = null
      accessTokenCookie.value = null
    }
  }
  
  const refreshAccessToken = async () => {
    try {
      await $fetch('/api/auth/refresh', {
        method: 'POST'
      })
      return true
    } catch (err) {
      console.error('Token refresh failed:', err)
      await logout()
      throw err
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
    refreshAccessToken
  }
})