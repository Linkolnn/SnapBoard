<template>
  <header class="app-header">
    <div class="app-header__container">
      <NuxtLink to="/" class="app-header__logo-link" @click="handleLogoClick">
        <img src="/favicon.ico" alt="SnapBoard" class="app-header__logo-icon" />
        <span class="app-header__logo-text">SnapBoard</span>
      </NuxtLink>

      <nav class="app-header__nav">
        <ul class="app-header__list">
          <li 
            v-for="item in visibleNavItems"
            :key="item.link"
            class="app-header__item"
          >
            <NuxtLink class="app-header__link" :to="item.link">
              {{ item.text }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <article class="app-header__actions">
        <!-- Переключатель темы -->
        <CommonThemeToggle size="sm" class="app-header__theme-toggle" />
        
        <!-- Обновлённый поиск -->
        <div v-if="!hideSearch" class="app-header__search">
          <div class="app-header__search-wrapper">
            <span class="app-header__search-icon">🔍</span>
            <input 
              v-model="searchQuery"
              class="app-header__search-inp"
              type="text" 
              placeholder="Поиск изображений..." 
              @keydown.enter="handleSearch"
              @focus="showSearchDropdown = true"
              @blur="handleSearchBlur"
            />
            <CommonBaseIconButton 
              v-if="searchQuery"
              variant="ghost"
              size="sm"
              class="app-header__search-clear"
              @click="clearSearch"
            >
              ✕
            </CommonBaseIconButton>
          </div>
          
          <!-- Dropdown с историей поиска -->
          <Transition name="dropdown">
            <div 
              v-if="showSearchDropdown && searchHistory.length > 0 && !searchQuery" 
              class="app-header__search-dropdown"
            >
              <div class="app-header__search-dropdown-header">
                <span>Недавние поиски</span>
                <CommonBaseButton variant="ghost" size="sm" @click.stop="clearSearchHistory">
                  Очистить
                </CommonBaseButton>
              </div>
              <ul>
                <li 
                  v-for="item in searchHistory" 
                  :key="item.id"
                  @mousedown="applySearchFromHistory(item.query)"
                >
                  <span>🕐</span>
                  <span>{{ item.query }}</span>
                </li>
              </ul>
            </div>
          </Transition>
        </div>
        
        <!-- Кнопки для неавторизованных -->
        <article v-if="!isAuthenticated" class="app-header__btns">
          <NuxtLink to="/login">
            <CommonBaseButton variant="outline">
              Войти
            </CommonBaseButton>
          </NuxtLink>
          <NuxtLink to="/register">
            <CommonBaseButton variant="primary">
              Регистрация
            </CommonBaseButton>
          </NuxtLink>
        </article>
        
        <!-- Меню для авторизованных -->
        <article v-else class="app-header__user">
          <div class="app-header__user-menu" @click="toggleUserMenu">
            <ProfileAvatar 
              :src="userAvatar" 
              :name="userName" 
              size="sm" 
            />
            <span class="app-header__user-name">{{ userName }}</span>
            <span class="app-header__dropdown-icon">▼</span>
          </div>
          
          <Transition name="dropdown">
            <div v-if="isUserMenuOpen" class="app-header__dropdown">
              <NuxtLink to="/profile" class="app-header__dropdown-item" @click="closeUserMenu">
                👤 Профиль
              </NuxtLink>
              <NuxtLink to="/boards" class="app-header__dropdown-item" @click="closeUserMenu">
                📋 Мои доски
              </NuxtLink>
              <NuxtLink to="/favorites" class="app-header__dropdown-item" @click="closeUserMenu">
                ⭐ Избранное
              </NuxtLink>
              <hr class="app-header__dropdown-divider" />
              <button class="app-header__dropdown-item app-header__dropdown-item--danger" @click="handleLogout">
                🚪 Выйти
              </button>
            </div>
          </Transition>
        </article>

        <button
          class="app-header__burger"
          @click="toggleMobileMenu"
          aria-label="Toggle menu"
        >
          <span class="app-header__burger-line"></span>
          <span class="app-header__burger-line"></span>
          <span class="app-header__burger-line"></span>
        </button>
      </article>
    </div>

    <LayoutMobileMenu 
      v-model="isMobileMenuOpen" 
      :nav-items="visibleNavItems" 
      :is-authenticated="isAuthenticated"
      :user-name="userName"
      :user-initials="userInitials"
      :user-avatar="userAvatar"
      @logout="handleLogout"
    />
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import { useSearchStore } from '~/store/search'
import { storeToRefs } from 'pinia'

interface NavItem {
  link: string
  text: string
  requiresAuth?: boolean
}

interface Props {
  hideSearch?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hideSearch: false
})

const authStore = useAuthStore()
const searchStore = useSearchStore()
const route = useRoute()

const { isAuthenticated, user } = storeToRefs(authStore)
const { query: storeQuery, history: searchHistory } = storeToRefs(searchStore)

const navItems: NavItem[] = [
  { text: 'Главная', link: '/' },
  { text: 'О нас', link: '/about' },
  { text: 'Помощь', link: '/help' },
  { text: 'Мои доски', link: '/boards', requiresAuth: true },
  { text: 'Избранное', link: '/favorites', requiresAuth: true },
]

const visibleNavItems = computed(() => {
  return navItems.filter(item => !item.requiresAuth || isAuthenticated.value)
})

// Исправлено: используем username вместо name
const userName = computed(() => user.value?.username || 'Пользователь')
const userInitials = computed(() => {
  const name = user.value?.username || 'U'
  return name.charAt(0).toUpperCase()
})
const userAvatar = computed(() => {
  const avatar = user.value?.avatar
  if (!avatar) return undefined
  // Аватары раздаются напрямую через /uploads, без /api prefix
  return avatar
})

const isMobileMenuOpen = ref(false)
const isUserMenuOpen = ref(false)
const searchQuery = ref('')
const showSearchDropdown = ref(false)

// Синхронизация с store
watch(storeQuery, (newQuery) => {
  searchQuery.value = newQuery
})

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

const handleLogout = async () => {
  closeUserMenu()
  await authStore.logout()
  navigateTo('/')
}

// Функции поиска
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    searchStore.setQuery(searchQuery.value)
    searchStore.addToHistory(searchQuery.value)
    
    // Если не на главной или странице доски - переходим на главную
    if (route.path !== '/' && !route.path.startsWith('/boards/')) {
      navigateTo('/')
    }
  }
  showSearchDropdown.value = false
}

const clearSearch = () => {
  searchQuery.value = ''
  searchStore.clearFilters()
  
  // Если на главной - принудительно обновляем
  if (route.path === '/') {
    // Эмитим событие для обновления страницы
    window.dispatchEvent(new CustomEvent('search-cleared'))
  }
}

// Сброс поиска при клике на логотип
const handleLogoClick = () => {
  searchStore.clearFilters()
  searchQuery.value = ''
  
  // Если уже на главной - принудительно обновляем
  if (route.path === '/') {
    window.dispatchEvent(new CustomEvent('search-cleared'))
  }
}

const handleSearchBlur = () => {
  setTimeout(() => {
    showSearchDropdown.value = false
  }, 200)
}

const applySearchFromHistory = (query: string) => {
  searchQuery.value = query
  handleSearch()
}

const clearSearchHistory = () => {
  searchStore.clearHistory()
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.app-header
  position: sticky
  top: 0
  z-index: $z-index-dropdown
  background: var(--header-bg)
  border-bottom: 1px solid var(--border-color)

  &__container
    max-width: $breakpoint-desktop
    margin: 0 auto
    padding: 16px 24px
    display: flex
    align-items: center
    justify-content: space-between
    gap: 24px
    
    @include mobile
      padding: 16px

  &__logo-link
    display: flex
    align-items: center
    text-decoration: none
    color: var(--text-primary)
    font-weight: 700
    font-size: 24px
    transition: color $transition-fast
    
    &:hover
      color: var(--accent-color)

  &__logo-icon
    width: 32px
    height: 32px
    margin-right: 8px

  &__logo-text
    white-space: nowrap
    
    @include mobile
      display: none

  &__nav
    @include laptop
      display: none
      
  &__list
    display: flex
    gap: 15px

  &__link
    padding: 0px
    color: var(--text-primary)
    font-weight: 500
    transition: $transition-normal
    position: relative
  
    &:hover
      color: var(--accent-color)

    &.router-link-active
      color: $text-light
      background: $primary-color
      border-radius: $radius
      padding: 10px 16px
      

  &__actions
    display: flex
    align-items: center
    gap: 16px
  
  &__theme-toggle
    padding: 12px 

    @include mobile
      display: none

  // Обновлённые стили поиска
  &__search
    position: relative
  
  &__search-wrapper
    display: flex
    align-items: center
    gap: 8px
    padding: 10px 16px
    background: var(--bg-secondary)
    border: 2px solid transparent
    border-radius: $radius
    transition: all $transition-fast
    
    &:focus-within
      background: var(--bg-primary)
      border-color: var(--accent-color)

    .icon-btn
      &--sm
        width: 20px
        height: 20px
  
  &__search-icon
    font-size: 14px
    color: var(--text-muted)
  
  &__search-inp
    max-width: 200px
    width: 100%
    background: transparent
    font-size: 14px
    color: var(--text-primary)
    outline: none
    border: none
    // Меняем тип на text чтобы убрать нативную кнопку очистки
    -webkit-appearance: none
    -moz-appearance: none
    appearance: none
    
    &::placeholder
      color: var(--text-muted)
  
  &__search-clear
    flex-shrink: 0
  
  &__search-dropdown
    position: absolute
    top: calc(100% + 8px)
    left: 0
    right: 0
    background: var(--bg-primary)
    border-radius: $radius
    box-shadow: var(--shadow-lg)
    z-index: $z-index-dropdown
    overflow: hidden
    
    &-header
      display: flex
      justify-content: space-between
      align-items: center
      padding: 12px 16px
      border-bottom: 1px solid var(--border-light)
      font-size: 13px
      color: var(--text-muted)
    
    ul
      list-style: none
      max-height: 200px
      overflow-y: auto
      margin: 0
      padding: 0
    
    li
      display: flex
      align-items: center
      gap: 12px
      padding: 10px 16px
      cursor: pointer
      transition: background $transition-fast
      
      &:hover
        background: var(--bg-hover)
      
      span:first-child
        color: var(--text-muted)

  &__btns
    display: flex
    gap: 8px
    
    a
      text-decoration: none

    @include laptop
      display: none
  
  &__user
    position: relative
    
    @include laptop
      display: none
  
  &__user-menu
    display: flex
    align-items: center
    gap: 8px
    padding: 6px 12px
    background: var(--bg-secondary)
    border-radius: $radius-full
    cursor: pointer
    transition: all $transition-fast
    
    &:hover
      background: var(--bg-tertiary)
  
  &__user-name
    font-size: 14px
    font-weight: 500
    color: var(--text-primary)
    
    @include tablet
      display: none
  
  &__dropdown-icon
    font-size: 10px
    color: var(--text-muted)
    transition: transform $transition-fast
  
  &__dropdown
    position: absolute
    top: calc(100% + 8px)
    right: 0
    min-width: 200px
    background: var(--bg-primary)
    border-radius: $radius
    box-shadow: var(--shadow-lg)
    padding: 8px 0
    z-index: $z-index-dropdown
  
  &__dropdown-item
    display: flex
    align-items: center
    gap: 8px
    width: 100%
    padding: 10px 16px
    background: none
    border: none
    font-size: 14px
    color: var(--text-primary)
    text-decoration: none
    cursor: pointer
    transition: background $transition-fast
    
    &:hover
      background: var(--bg-secondary)
    
    &--danger
      color: var(--error-color)
      
      &:hover
        background: var(--error-light)
  
  &__dropdown-divider
    margin: 8px 0
    border: none
    border-top: 1px solid var(--border-color)

  &__burger
    display: none
    flex-direction: column
    justify-content: space-between
    width: 28px
    height: 20px
    padding: 0
    background: none
    border: none
    cursor: pointer

    @include laptop
      display: flex

  &__burger-line
    width: 100%
    height: 3px
    background: var(--text-primary)
    border-radius: 2px
    transition: all $transition-fast

    .app-header__burger:hover &
      background: var(--accent-color)

// Анимация dropdown
.dropdown-enter-active, .dropdown-leave-active
  transition: all 0.2s ease

.dropdown-enter-from, .dropdown-leave-to
  opacity: 0
  transform: translateY(-8px)
</style>
