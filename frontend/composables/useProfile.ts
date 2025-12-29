import { ref, computed } from 'vue'
import { useAuthStore } from '~/store/auth'
import { useFavorites } from '~/composables/useFavorites'
import type { UserStats, UpdateProfileDto, ChangePasswordDto } from '~/types/user'
import type { Board } from '~/types/board'
import type { Image } from '~/types/image'

export const useProfile = () => {
  const authStore = useAuthStore()
  const { favoritesCount } = useFavorites()
  
  // State
  const isEditing = ref(false)
  const isSubmitting = ref(false)
  const isLoadingContent = ref(false)
  const userBoards = ref<Board[]>([])
  const userImages = ref<Image[]>([])
  const error = ref<string | null>(null)

  // Computed
  const user = computed(() => authStore.user)
  
  const stats = computed<UserStats>(() => ({
    boardsCount: userBoards.value.length,
    imagesCount: userImages.value.length,
    favoritesCount: favoritesCount.value,
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

  const updateProfile = async (data: UpdateProfileDto): Promise<boolean> => {
    isSubmitting.value = true
    error.value = null

    try {
      await $fetch('/api/profile', {
        method: 'PUT',
        body: data
      })

      // Update store
      if (authStore.user) {
        authStore.user = { ...authStore.user, ...data }
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
      formData.append('avatar', file)

      const response = await $fetch<{ avatarUrl: string }>('/api/profile/avatar', {
        method: 'POST',
        body: formData
      })

      // Update store
      if (authStore.user) {
        authStore.user = { ...authStore.user, avatar: response.avatarUrl }
      }

      return true
    } catch (err: any) {
      error.value = err.data?.message || 'Ошибка при загрузке аватара'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  const changePassword = async (data: ChangePasswordDto): Promise<boolean> => {
    isSubmitting.value = true
    error.value = null

    try {
      await $fetch('/api/profile/password', {
        method: 'PUT',
        body: data
      })

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
      await $fetch('/api/profile', {
        method: 'DELETE',
        body: { password }
      })

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
      const [boardsRes, imagesRes] = await Promise.all([
        $fetch<{ boards: Board[] }>('/api/profile/boards'),
        $fetch<{ images: Image[] }>('/api/profile/images')
      ])

      userBoards.value = boardsRes.boards
      userImages.value = imagesRes.images
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
    updateProfile,
    uploadAvatar,
    changePassword,
    deleteAccount,
    loadUserContent
  }
}
