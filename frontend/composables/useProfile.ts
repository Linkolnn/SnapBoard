import { ref, computed } from 'vue'
import { useAuthStore } from '~/store/auth'
import { useFavorites } from '~/composables/useFavorites'
import type { UserStats, UpdateProfileDto, ChangePasswordDto } from '~/types/user'
import type { Board } from '~/types/board'
import type { Image } from '~/types/image'

interface StatsResponse {
  boardsCount: number
  imagesCount: number
  favoritesCount: number
}

interface PaginatedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasMore: boolean
}

export const useProfile = () => {
  const authStore = useAuthStore()
  const { favoritesCount: localFavoritesCount } = useFavorites()
  const { get, put, del, upload } = useApi()
  
  // State
  const isEditing = ref(false)
  const isSubmitting = ref(false)
  const isLoadingContent = ref(false)
  const userBoards = ref<Board[]>([])
  const userImages = ref<Image[]>([])
  const serverStats = ref<StatsResponse | null>(null)
  const error = ref<string | null>(null)

  // Computed
  const user = computed(() => authStore.user)
  
  const stats = computed<UserStats>(() => ({
    boardsCount: serverStats.value?.boardsCount ?? userBoards.value.length,
    imagesCount: serverStats.value?.imagesCount ?? userImages.value.length,
    favoritesCount: serverStats.value?.favoritesCount ?? localFavoritesCount.value,
    joinedAt: user.value?.createdAt || new Date().toISOString()
  }))

  const userInitials = computed(() => {
    const name = user.value?.name || user.value?.username || 'U'
    return name.charAt(0).toUpperCase()
  })

  // Actions
  const startEditing = () => {
    isEditing.value = true
  }

  const cancelEditing = () => {
    isEditing.value = false
    error.value = null
  }

  const fetchStats = async () => {
    try {
      serverStats.value = await get<StatsResponse>('/profile/stats')
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const updateProfile = async (data: UpdateProfileDto): Promise<boolean> => {
    isSubmitting.value = true
    error.value = null

    try {
      const response = await put<any>('/profile', data)

      // Update store
      if (authStore.user) {
        authStore.user = { ...authStore.user, ...response }
      }

      isEditing.value = false
      return true
    } catch (err: any) {
      error.value = err.data?.message || 'Ошибка при обновлении профиля'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  const uploadAvatar = async (file: File): Promise<boolean> => {
    isSubmitting.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await upload<{ avatar: string; message: string }>(
        '/profile/avatar',
        formData
      )

      // Update store
      if (authStore.user) {
        authStore.user = { ...authStore.user, avatar: response.avatar }
      }

      return true
    } catch (err: any) {
      error.value = err.message || 'Ошибка при загрузке аватара'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  const changePassword = async (data: ChangePasswordDto): Promise<boolean> => {
    isSubmitting.value = true
    error.value = null

    try {
      await put('/profile/password', data)
      return true
    } catch (err: any) {
      error.value = err.data?.message || 'Ошибка при смене пароля'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  const deleteAccount = async (password: string): Promise<boolean> => {
    isSubmitting.value = true
    error.value = null

    try {
      await del('/profile', { password })

      // Logout after deletion
      await authStore.logout()
      return true
    } catch (err: any) {
      error.value = err.data?.message || 'Ошибка при удалении аккаунта'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  const loadUserContent = async () => {
    isLoadingContent.value = true

    try {
      const [boardsRes, imagesRes, statsRes] = await Promise.all([
        get<PaginatedResponse<Board>>('/profile/boards'),
        get<PaginatedResponse<Image>>('/profile/images'),
        get<StatsResponse>('/profile/stats')
      ])

      userBoards.value = boardsRes.items
      userImages.value = imagesRes.items
      serverStats.value = statsRes
    } catch (err: any) {
      console.error('Failed to load user content:', err)
    } finally {
      isLoadingContent.value = false
    }
  }

  return {
    // State
    user,
    isEditing,
    isSubmitting,
    isLoadingContent,
    stats,
    userBoards,
    userImages,
    userInitials,
    error,

    // Actions
    startEditing,
    cancelEditing,
    fetchStats,
    updateProfile,
    uploadAvatar,
    changePassword,
    deleteAccount,
    loadUserContent
  }
}
