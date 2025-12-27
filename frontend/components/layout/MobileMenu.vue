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

                    <div class="mobile-menu__search">
                        <input 
                            type="search" 
                            placeholder="Поиск..."
                            class="mobile-menu__search-inp"
                        />
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

                    <div class="mobile-menu__btns">
                        <CommonBaseButton variant="outline" @click="close">
                            Войти
                        </CommonBaseButton>
                        <CommonBaseButton variant="primary" @click="close">
                            Регистрация
                        </CommonBaseButton>
                    </div>
                </article>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue';

interface NavItem {
    link: string
    text: string
};

interface Props {
    modelValue: boolean
    navItems: NavItem[]
};

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
}>();

const close = () => {
    emit('update:modelValue', false)
};

watch(
    () => props.modelValue,
    (isOpen) => {
        if (isOpen){
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
    }
);
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
  background: rgba(0, 0, 0, 0.5)
  z-index: $z-index-modal
  
// Само выдвижное меню
.mobile-menu
  position: fixed
  top: 0
  right: 0
  bottom: 0
  width: 320px
  max-width: 85vw
  background: white
  box-shadow: $shadow-lg
  display: flex
  flex-direction: column
  overflow-y: auto
  
  // Шапка меню
  &__header
    display: flex
    align-items: center
    justify-content: space-between
    padding: 24px
    border-bottom: 1px solid $gray-200
  
  &__title
    font-size: 20px
    font-weight: 700
    color: $text-light
  
  // Кнопка закрытия
  &__close
    width: 40px
    height: 40px
    display: flex
    align-items: center
    justify-content: center
    border-radius: 50%
    color: $gray-400
    transition: all $transition-fast
    
    &:hover
      background: $gray-100
      color: $text-light
  
  // Поиск в мобильном меню
  &__search
    padding: 16px 24px
    border-bottom: 1px solid $gray-200
  
  &__search-inp
    width: 100%
    padding: 12px
    border: 1px solid $gray-300
    border-radius: $radius-sm
    font-size: 14px
    
    &:focus
      outline: none
      border-color: $primary-color
    
    &::placeholder
      color: $gray-400
  
  // Список навигационных ссылок
  &__list
    list-style: none
    padding: 16px 0
    flex: 1
  
  &__item
    padding: 16px 24px
    color: $text-light
    text-decoration: none
    font-weight: 500
    transition: all $transition-fast
    
    // При наведении - зелёный фон
    &:hover
      background: rgba(0, 220, 130, 0.1)
      color: $primary-color
    
    // Активная ссылка (текущая страница)
    &.router-link-active
      background: rgba(0, 220, 130, 0.1)
      color: $primary-color
      border-left: 3px solid $primary-color
  
  // Кнопки внизу меню
  &__btns
    padding: 24px
    border-top: 1px solid $gray-200
    display: flex
    flex-direction: column
    gap: 16px

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
