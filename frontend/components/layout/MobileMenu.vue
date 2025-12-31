<template>
    <Teleport to="body">
        <Transition name="mobile-menu">
            <div 
                v-if="modelValue" 
                class="mobile-menu-overlay"
                @click="close"
            >
                <article class="mobile-menu" @click.stop>
                    <header class="mobile-menu__header">
                        <h3 class="mobile-menu__title">Меню</h3>
                        <button class="mobile-menu__close" @click="close">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </header>

                    <!-- Секция пользователя для авторизованных -->
                    <div v-if="isAuthenticated" class="mobile-menu__user">
                        <ProfileAvatar 
                            :src="userAvatar" 
                            :name="userName" 
                            size="sm" 
                        />
                        <div class="mobile-menu__user-info">
                            <span class="mobile-menu__user-name">{{ userName }}</span>
                        </div>
                    </div>

                    <!-- Быстрые ссылки для авторизованных -->
                    <div v-if="isAuthenticated" class="mobile-menu__user-links">
                        <NuxtLink to="/profile" class="mobile-menu__user-link" @click="close">
                            👤 Профиль
                        </NuxtLink>
                        <NuxtLink to="/boards" class="mobile-menu__user-link" @click="close">
                            📋 Мои доски
                        </NuxtLink>
                        <NuxtLink to="/favorites" class="mobile-menu__user-link" @click="close">
                            ⭐ Избранное
                        </NuxtLink>
                    </div>

                    <nav class="mobile-menu__nav">
                        <ul class="mobile-menu__list">
                            <li 
                                v-for="item in navItems"
                                :key="item.link"
                                class="mobile-menu__item"
                            >
                                <NuxtLink
                                    @click="close"
                                    :to="item.link"
                                >
                                    {{ item.text }}
                                </NuxtLink>
                            </li>
                        </ul>
                    </nav>

                    <!-- Переключатель темы -->
                    <div class="mobile-menu__theme">
                        <span class="mobile-menu__theme-label">Тема</span>
                        <div class="mobile-menu__theme-options">
                            <button 
                                class="mobile-menu__theme-btn"
                                :class="{ 'mobile-menu__theme-btn--active': theme === 'light' }"
                                @click="setTheme('light')"
                            >
                                ☀️ Светлая
                            </button>
                            <button 
                                class="mobile-menu__theme-btn"
                                :class="{ 'mobile-menu__theme-btn--active': theme === 'dark' }"
                                @click="setTheme('dark')"
                            >
                                🌙 Тёмная
                            </button>
                            <button 
                                class="mobile-menu__theme-btn"
                                :class="{ 'mobile-menu__theme-btn--active': theme === 'system' }"
                                @click="setTheme('system')"
                            >
                                💻 Авто
                            </button>
                        </div>
                    </div>

                    <!-- Кнопки для неавторизованных -->
                    <div v-if="!isAuthenticated" class="mobile-menu__btns">
                        <NuxtLink to="/login" @click="close">
                            <CommonBaseButton variant="outline" class="mobile-menu__btn">
                                Войти
                            </CommonBaseButton>
                        </NuxtLink>
                        <NuxtLink to="/register" @click="close">
                            <CommonBaseButton variant="primary" class="mobile-menu__btn">
                                Регистрация
                            </CommonBaseButton>
                        </NuxtLink>
                    </div>
                    
                    <!-- Кнопка выхода для авторизованных -->
                    <div v-else class="mobile-menu__btns">
                        <CommonBaseButton variant="outline" class="mobile-menu__btn mobile-menu__btn--danger" @click="handleLogout">
                            🚪 Выйти
                        </CommonBaseButton>
                    </div>
                </article>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import type { ThemeMode } from '~/store/theme'

interface NavItem {
    link: string
    text: string
}

interface Props {
    modelValue: boolean
    navItems: NavItem[]
    isAuthenticated?: boolean
    userName?: string
    userInitials?: string
    userAvatar?: string
}

const props = withDefaults(defineProps<Props>(), {
    isAuthenticated: false,
    userName: 'Пользователь',
    userInitials: 'U',
    userAvatar: undefined
})

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'logout': []
}>()

const { theme, setTheme } = useTheme()

const close = () => {
    emit('update:modelValue', false)
}

const handleLogout = () => {
    close()
    emit('logout')
}

watch(
    () => props.modelValue,
    (isOpen) => {
        if (isOpen){
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
    }
)
</script>
<style lang="sass" scoped>
@import '@/assets/styles/variables'

// Затемнённый overlay на весь экран
.mobile-menu-overlay
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  background: var(--bg-overlay)
  z-index: $z-index-modal
  
// Само выдвижное меню
.mobile-menu
  position: fixed
  top: 0
  right: 0
  bottom: 0
  width: 320px
  max-width: 85vw
  background: var(--bg-primary)
  box-shadow: var(--shadow-lg)
  display: flex
  flex-direction: column
  overflow-y: auto
  
  // Шапка меню
  &__header
    display: flex
    align-items: center
    justify-content: space-between
    padding: 24px
    border-bottom: 1px solid var(--border-color)
  
  &__title
    font-size: 20px
    font-weight: 700
    color: var(--text-primary)
  
  // Кнопка закрытия
  &__close
    width: 40px
    height: 40px
    display: flex
    align-items: center
    justify-content: center
    border-radius: 50%
    color: var(--text-muted)
    transition: all $transition-fast
    
    &:hover
      background: var(--bg-secondary)
      color: var(--text-primary)
  
  // Список навигационных ссылок
  &__list
    list-style: none
    padding: 16px 0
    flex: 1
  
  &__item
    padding: 16px 24px
    color: var(--text-primary)
    text-decoration: none
    font-weight: 500
    transition: all $transition-fast
    
    // При наведении - зелёный фон
    &:hover
      background: var(--accent-light)
      color: var(--accent-color)
    
    // Активная ссылка (текущая страница)
    &.router-link-active
      background: var(--accent-light)
      color: var(--accent-color)
      border-left: 3px solid var(--accent-color)
  
  // Переключатель темы
  &__theme
    padding: 16px 24px
    border-bottom: 1px solid var(--border-color)
  
  &__theme-label
    display: block
    font-size: 13px
    font-weight: 500
    color: var(--text-muted)
    margin-bottom: 12px
  
  &__theme-options
    display: flex
    gap: 8px
  
  &__theme-btn
    flex: 1
    padding: 10px 12px
    border-radius: $radius-sm
    background: var(--bg-secondary)
    color: var(--text-secondary)
    font-size: 13px
    font-weight: 500
    cursor: pointer
    transition: all $transition-fast
    
    &:hover
      background: var(--bg-tertiary)
      color: var(--text-primary)
    
    &--active
      background: var(--accent-color)
      color: white
      
      &:hover
        background: var(--accent-hover)
  
  // Кнопки внизу меню
  &__btns
    padding: 24px
    border-top: 1px solid var(--border-color)
    display: flex
    flex-direction: column
    gap: 16px
    
    a
      text-decoration: none
  
  &__btn
    width: 100%
    
    &--danger
      color: var(--error-color)
      border-color: var(--error-color)
      
      &:hover
        background: var(--error-light)

  // Секция пользователя
  &__user
    display: flex
    align-items: center
    gap: 12px
    padding: 20px 24px
    background: var(--bg-secondary)
    border-bottom: 1px solid var(--border-color)
  
  &__user-info
    flex: 1
    min-width: 0
  
  &__user-name
    font-size: 16px
    font-weight: 600
    color: var(--text-primary)
    display: block
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis
  
  // Быстрые ссылки пользователя
  &__user-links
    display: flex
    flex-direction: column
    border-bottom: 1px solid var(--border-color)
  
  &__user-link
    display: flex
    align-items: center
    gap: 10px
    padding: 14px 24px
    color: var(--text-primary)
    text-decoration: none
    font-size: 15px
    font-weight: 500
    transition: all $transition-fast
    
    &:hover
      background: var(--accent-light)
      color: var(--accent-color)

// Анимации выезда меню справа
.mobile-menu-enter-active,
.mobile-menu-leave-active
  transition: opacity $transition-normal

.mobile-menu-enter-from,
.mobile-menu-leave-to
  opacity: 0

// Анимация самого меню (выезд справа)
.mobile-menu-enter-active .mobile-menu,
.mobile-menu-leave-active .mobile-menu
  transition: transform $transition-normal

.mobile-menu-enter-from .mobile-menu,
.mobile-menu-leave-to .mobile-menu
  transform: translateX(100%)
</style>
