<template>
    <header class="app-header">
        <div class="app-header__container">
            <NuxtLink to="/" class="app-header__logo-link">
                <span class="app-header__logo-text">SnapBoard</span>
            </NuxtLink>

            <nav class="app-header__nav">
                <ul class="app-header__list">
                    <li 
                        v-for="item in navItems"
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
                <div class="app-header__search">
                    <input 
                        class="app-header__search-inp"
                        type="search" 
                        placeholder="Поиск..." 
                    />
                </div>
                <article class="app-header__btns">
                    <CommonBaseButton variant="outline">
                        Войти
                    </CommonBaseButton>
                    <CommonBaseButton variant="primary">
                        Регистрация
                    </CommonBaseButton>
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

        <LayoutMobileMenu v-model="isMobileMenuOpen" :nav-items="navItems"/>
    </header>
</template>
<script setup lang="ts">

interface NavItems {
    link: string
    text: string
};

const navItems: NavItems[] = [
    {text: 'Главная', link: '/'},
    {text: 'Моя доска', link: '/boards'},
    {text: 'Избранное', link: '/favorites'},
    {text: 'Профиль', link: '/profile'},
];

const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.app-header
    // Фиксируем header наверху при прокрутке
    position: sticky
    top: 0
    z-index: $z-index-dropdown
    background: white
    border-bottom: 1px solid $gray-200

    // Контейнер с ограничением ширины
    &__container
        max-width: $breakpoint-desktop
        margin: 0 auto
        padding: 16px 24px // явные значения вместо $spacing-unit
        display: flex
        align-items: center
        justify-content: space-between
        gap: 24px

    // Уменьшаем padding на мобильных
    @include mobile
        padding: 16px

    // Логотип приложения
    &__logo
        display: flex
        align-items: center
        text-decoration: none
        color: $text-light
        font-weight: 700
        font-size: 24px
        transition: color $transition-fast

    // Зелёный при наведении
    &:hover
        color: $primary-color

    &__logo-text
    // Можно добавить иконку/изображение логотипа позже
        white-space: nowrap

    &__nav
        @include laptop
            display: none
    &__list
        display: flex
        gap: 10px

    &__item
        
    // Ссылки навигации
    &__link
        color: $text-light
        text-decoration: none
        font-weight: 500
        transition: color $transition-fast
        position: relative

    // Подчёркивание при наведении
    &:hover
        color: $primary-color

    // Активная ссылка (текущая страница)
    &.router-link-active
        color: $primary-color
        
        // Зелёная линия снизу для активной ссылки
        &::after
            content: ''
            position: absolute
            bottom: -16px
            left: 0
            right: 0
            height: 2px
            background: $primary-color

    // Правая часть header
    &__actions
        display: flex
        align-items: center
        gap: 16px

    // Поле поиска
    &__search
        display: flex

    // Скрываем на мобильных (будет в мобильном меню)
    @include tablet
        display: none

    &__search-inp
        width: 250px
        padding: 8px 16px
        border: 1px solid $gray-300
        border-radius: $radius-sm
        font-size: 14px
        transition: all $transition-fast

    // Фокус - зелёная рамка
    &:focus
        outline: none
        border-color: $primary-color
        box-shadow: 0 0 0 3px rgba(0, 220, 130, 0.1)

    // Placeholder стили
    &::placeholder
        color: $gray-400

    // Кнопки входа/регистрации
    &__btns
        display: flex
        gap: 8px

    // Скрываем на планшетах и мобильных
    @include laptop
        display: none

    // Бургер меню для мобильных
    &__burger
        display: none
        flex-direction: column
        justify-content: space-between
        width: 28px
        height: 20px
        padding: 0
        cursor: pointer

    // Показываем только на планшетах и мобильных
    @include laptop
        display: flex

    // Линии бургер-меню
    &__burger-line
        width: 100%
        height: 3px
        background: $text-light
        border-radius: 2px
        transition: all $transition-fast

    // При наведении делаем зелёными
    .app-header__burger:hover &
        background: $primary-color
</style>