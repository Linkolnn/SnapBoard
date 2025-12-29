import { useAuthStore } from '~/store/auth'

/**
 * Composable для действий, требующих авторизации
 */
export function useAuthActions() {
  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()

  /**
   * Проверить авторизацию и выполнить действие
   * Если не авторизован - редирект на логин
   */
  const requireAuth = (action: () => void): boolean => {
    if (!authStore.isAuthenticated) {
      // Сохраняем текущий путь для возврата после логина
      const currentPath = route.fullPath
      router.push({
        path: '/login',
        query: { redirect: currentPath }
      })
      return false
    }
    
    action()
    return true
  }

  /**
   * Проверить авторизацию без выполнения действия
   */
  const checkAuth = (): boolean => {
    return authStore.isAuthenticated
  }

  /**
   * Редирект на логин с сохранением текущего пути
   */
  const redirectToLogin = () => {
    const currentPath = route.fullPath
    router.push({
      path: '/login',
      query: { redirect: currentPath }
    })
  }

  return {
    requireAuth,
    checkAuth,
    redirectToLogin,
    isAuthenticated: authStore.isAuthenticated
  }
}
