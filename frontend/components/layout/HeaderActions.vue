<template>
  <!-- 
    Действия в header в зависимости от статуса авторизации
    - Для гостей: кнопки входа и регистрации
    - Для авторизованных: меню профиля и выход
  -->
  <header class="header-actions">
    <!-- Если НЕ авторизован - показываем кнопки входа/регистрации -->
    <template v-if="!authStore.isAuthenticated">
      <CommonBaseButton variant="outline" @click="navigateTo('/login')">
        Войти
      </CommonBaseButton>
      <CommonBaseButton variant="primary" @click="navigateTo('/register')">
        Регистрация
      </CommonBaseButton>
    </template>
    
    <!-- Если авторизован - показываем меню пользователя -->
    <template v-else>
      <div class="header-actions__user">
        <!-- Аватар пользователя -->
        <button class="header-actions__avatar" @click="toggleUserMenu">
          <img 
            v-if="authStore.user?.avatar" 
            :src="authStore.user.avatar" 
            :alt="authStore.user.username"
          />
          <span v-else>{{ userInitials }}</span>
        </button>
        
        <!-- Выпадающее меню пользователя -->
        <nav v-if="isUserMenuOpen" class="header-actions__menu">
          <ul>
            <li>
              <NuxtLink to="/profile" @click="closeUserMenu">
                Профиль
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/boards" @click="closeUserMenu">
                Мои доски
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/settings" @click="closeUserMenu">
                Настройки
              </NuxtLink>
            </li>
            <li>
              <button @click="handleLogout">
                Выйти
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </template>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

/**
 * Store аутентификации
 */
const authStore = useAuthStore()

/**
 * Router для навигации
 */
const router = useRouter()

/**
 * Состояние выпадающего меню пользователя
 */
const isUserMenuOpen = ref(false)

/**
 * Инициалы пользователя для аватара (если нет изображения)
 * Берём первую букву username
 */
const userInitials = computed(() => {
  if (!authStore.user?.username) return '?'
  return authStore.user.username.charAt(0).toUpperCase()
})

/**
 * Переключение меню пользователя
 */
const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

/**
 * Закрытие меню пользователя
 */
const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

/**
 * Обработчик выхода из системы
 * Токены удаляются из cookies backend'ом
 */
const handleLogout = async () => {
  closeUserMenu()
  await authStore.logout()
  router.push('/login')
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.header-actions
  display: flex
  align-items: center
  gap: 8px
  position: relative
  
  // Контейнер пользователя с аватаром и меню
  &__user
    position: relative
  
  // Аватар пользователя
  &__avatar
    width: 40px
    height: 40px
    border-radius: 50%
    background: $primary-color
    color: white
    display: flex
    align-items: center
    justify-content: center
    font-weight: 600
    font-size: 16px
    cursor: pointer
    transition: transform $transition-fast
    overflow: hidden
    
    &:hover
      transform: scale(1.05)
    
    img
      width: 100%
      height: 100%
      object-fit: cover
  
  // Выпадающее меню
  &__menu
    position: absolute
    top: calc(100% + 8px)
    right: 0
    background: white
    border-radius: $radius-sm
    box-shadow: $shadow-lg
    padding: 8px 0
    min-width: 200px
    z-index: $z-index-dropdown
    
    ul
      list-style: none
      
      li
        a,
        button
          display: block
          width: 100%
          padding: 12px 16px
          color: $text-light
          text-decoration: none
          text-align: left
          transition: background $transition-fast
          font-size: 14px
          
          &:hover
            background: $gray-100
</style>