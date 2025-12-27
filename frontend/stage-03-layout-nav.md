# Этап 3: Layout и навигация SnapBoard

## 🎯 Цель этапа
Создать полноценную структуру приложения с навигацией, адаптивным меню, sidebar и breadcrumbs. Все компоненты будут использовать семантические HTML теги для лучшей доступности.

---

## 📋 Чеклист этапа
- [ ] Компонент Header с навигацией
- [ ] Адаптивное мобильное меню (бургер)
- [ ] Компонент Sidebar для фильтров
- [ ] Компонент Breadcrumbs
- [ ] Обновлённый Layout
- [ ] Layout для страниц аутентификации

---

## 🔤 Важно: Именование компонентов в Nuxt

В Nuxt компоненты автоматически импортируются по их пути в папке `components/`:

```
components/common/BaseInput.vue      → <CommonBaseInput>
components/layout/AppHeader.vue      → <LayoutAppHeader>
components/layout/MobileMenu.vue     → <LayoutMobileMenu>
```

**Структура имени**: `<ПапкаКомпонент>` (PascalCase)

---

## 1️⃣ Компонент Header

### Файл: `components/layout/AppHeader.vue`

```vue
<template>
  <!-- 
    Главный Header приложения
    - Семантический тег <header>
    - Логотип, навигация, поиск, кнопки входа
    - Адаптивное меню для мобильных устройств
  -->
  <header class="app-header">
    <div class="app-header__container">
      <!-- Логотип и название -->
      <NuxtLink to="/" class="app-header__logo">
        <span class="app-header__logo-text">SnapBoard</span>
      </NuxtLink>
      
      <!-- Навигация для desktop - скрывается на мобильных -->
      <nav class="app-header__nav">
        <NuxtLink 
          v-for="link in navLinks" 
          :key="link.path"
          :to="link.path" 
          class="app-header__nav-link"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
      
      <!-- Правая часть header: поиск и actions -->
      <div class="app-header__actions">
        <!-- Поле поиска - будет реализовано в следующих этапах -->
        <div class="app-header__search">
          <input 
            type="search" 
            placeholder="Поиск..."
            class="app-header__search-inp"
          />
        </div>
        
        <!-- Кнопки для desktop -->
        <div class="app-header__btns">
          <CommonBaseButton variant="outline">Войти</CommonBaseButton>
          <CommonBaseButton variant="primary">Регистрация</CommonBaseButton>
        </div>
        
        <!-- Кнопка бургер-меню для мобильных -->
        <button 
          class="app-header__burger"
          @click="toggleMobileMenu"
          aria-label="Toggle menu"
        >
          <!-- SVG иконка бургера - 3 линии -->
          <span class="app-header__burger-line"></span>
          <span class="app-header__burger-line"></span>
          <span class="app-header__burger-line"></span>
        </button>
      </div>
    </div>
    
    <!-- Мобильное меню - выезжает сбоку -->
    <LayoutMobileMenu v-model="isMobileMenuOpen" :nav-links="navLinks" />
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

/**
 * Интерфейс для ссылки навигации
 */
interface NavLink {
  label: string  // текст ссылки
  path: string   // URL путь
}

/**
 * Список навигационных ссылок
 * В дальнейшем можно вынести в конфиг или получать из API
 */
const navLinks: NavLink[] = [
  { label: 'Главная', path: '/' },
  { label: 'Мои доски', path: '/boards' },
  { label: 'Избранное', path: '/favorites' },
  { label: 'Профиль', path: '/profile' }
]

/**
 * Состояние мобильного меню (открыто/закрыто)
 */
const isMobileMenuOpen = ref(false)

/**
 * Переключение состояния мобильного меню
 */
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

  // Навигация (для desktop)
  &__nav
    display: flex
    gap: 24px
    
    // Скрываем на планшетах и мобильных
    @include laptop
      display: none

  // Ссылки навигации
  &__nav-link
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
```

---

## 2️⃣ Мобильное меню

### Файл: `components/layout/MobileMenu.vue`

```vue
<template>
  <!-- 
    Мобильное меню - выдвижная панель сбоку
    - Открывается по клику на бургер
    - Блокирует прокрутку body
    - Закрывается по клику на overlay или крестик
  -->
  <Teleport to="body">
    <Transition name="mobile-menu">
      <div v-if="modelValue" class="mobile-menu-overlay" @click="close">
        <!-- Само меню - nav семантический тег -->
        <nav class="mobile-menu" @click.stop>
          <!-- Шапка меню с кнопкой закрытия -->
          <div class="mobile-menu__header">
            <span class="mobile-menu__title">Меню</span>
            <button class="mobile-menu__close" @click="close">
              <!-- SVG крестик -->
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          
          <!-- Поле поиска для мобильных -->
          <div class="mobile-menu__search">
            <input 
              type="search" 
              placeholder="Поиск..."
              class="mobile-menu__search-inp"
            />
          </div>
          
          <!-- Список навигационных ссылок -->
          <ul class="mobile-menu__nav">
            <li v-for="link in navLinks" :key="link.path">
              <NuxtLink 
                :to="link.path" 
                class="mobile-menu__nav-link"
                @click="close"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
          
          <!-- Кнопки входа/регистрации в мобильном меню -->
          <div class="mobile-menu__btns">
            <CommonBaseButton variant="outline" @click="close">Войти</CommonBaseButton>
            <CommonBaseButton variant="primary" @click="close">Регистрация</CommonBaseButton>
          </div>
        </nav>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'

/**
 * Интерфейс для навигационной ссылки
 */
interface NavLink {
  label: string
  path: string
}

/**
 * Пропсы компонента
 */
interface Props {
  modelValue: boolean    // v-model для открытия/закрытия
  navLinks: NavLink[]    // список навигационных ссылок
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

/**
 * Закрытие меню
 */
const close = () => {
  emit('update:modelValue', false)
}

/**
 * Блокируем прокрутку body когда меню открыто
 */
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
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
  &__nav
    list-style: none
    padding: 16px 0
    flex: 1
  
  &__nav-link
    display: block
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
```

---

## 3️⃣ Компонент Sidebar

### Файл: `components/layout/AppSidebar.vue`

```vue
<template>
  <!-- 
    Sidebar для фильтров и категорий
    - Семантический тег <aside>
    - Будет использоваться для фильтрации изображений по тегам, категориям
    - Адаптивный - на мобильных скрывается
  -->
  <aside class="app-sidebar">
    <!-- Заголовок sidebar -->
    <div class="app-sidebar__header">
      <h3 class="app-sidebar__title">{{ title }}</h3>
    </div>
    
    <!-- Контент sidebar через slot -->
    <div class="app-sidebar__content">
      <slot></slot>
    </div>
  </aside>
</template>

<script setup lang="ts">
/**
 * Пропсы компонента
 */
interface Props {
  title?: string  // заголовок sidebar
}

withDefaults(defineProps<Props>(), {
  title: 'Фильтры'
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.app-sidebar
  // Ширина sidebar
  width: 280px
  min-width: 280px
  background: white
  border-radius: $radius
  padding: 24px
  height: fit-content
  position: sticky
  top: 80px // отступ от header (16px padding * 2 + 24px logo height + margin)
  
  // На планшетах делаем уже
  @include laptop
    width: 240px
    min-width: 240px
  
  // На мобильных скрываем
  @include tablet
    display: none
  
  // Шапка sidebar
  &__header
    margin-bottom: 24px
    padding-bottom: 16px
    border-bottom: 1px solid $gray-200
  
  &__title
    font-size: 20px
    font-weight: 700
    color: $text-light
    margin: 0
  
  // Контент sidebar
  &__content
    display: flex
    flex-direction: column
    gap: 16px
</style>
```

---

## 4️⃣ Компонент Breadcrumbs

### Файл: `components/layout/AppBreadcrumbs.vue`

```vue
<template>
  <!-- 
    Хлебные крошки для навигации
    - Семантический тег <nav> с aria-label
    - Показывает путь текущей страницы
    - Последний элемент (текущая страница) не кликабельный
  -->
  <nav class="breadcrumbs" aria-label="Breadcrumb navigation">
    <ol class="breadcrumbs__list">
      <li 
        v-for="(crumb, index) in crumbs" 
        :key="crumb.path"
        class="breadcrumbs__item"
      >
        <!-- Если не последний элемент - делаем ссылкой -->
        <NuxtLink 
          v-if="index < crumbs.length - 1"
          :to="crumb.path"
          class="breadcrumbs__link"
        >
          {{ crumb.label }}
        </NuxtLink>
        
        <!-- Последний элемент - просто текст -->
        <span v-else class="breadcrumbs__current">
          {{ crumb.label }}
        </span>
        
        <!-- Разделитель между крошками (кроме последней) -->
        <span 
          v-if="index < crumbs.length - 1" 
          class="breadcrumbs__separator"
        >
          /
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
/**
 * Интерфейс для одной хлебной крошки
 */
interface Breadcrumb {
  label: string  // текст крошки
  path: string   // URL путь
}

/**
 * Пропсы компонента
 */
interface Props {
  crumbs: Breadcrumb[]  // массив хлебных крошек
}

defineProps<Props>()
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.breadcrumbs
  margin-bottom: 24px
  
  // Список крошек - горизонтальный
  &__list
    display: flex
    align-items: center
    gap: 8px
    list-style: none
    flex-wrap: wrap
  
  &__item
    display: flex
    align-items: center
    gap: 8px
    font-size: 14px
  
  // Ссылка на предыдущие страницы
  &__link
    color: $gray-500
    text-decoration: none
    transition: color $transition-fast
    
    &:hover
      color: $primary-color
  
  // Текущая страница - жирный текст
  &__current
    color: $text-light
    font-weight: 600
  
  // Разделитель между крошками
  &__separator
    color: $gray-400
    user-select: none
</style>
```

---

## 5️⃣ Обновлённый основной Layout

### Файл: `layouts/default.vue`

```vue
<template>
  <!-- 
    Основной layout приложения
    - Использует LayoutAppHeader
    - Поддерживает опциональный Sidebar
    - Семантические теги для структуры
  -->
  <div class="layout">
    <!-- Header приложения -->
    <LayoutAppHeader />
    
    <!-- Основной контент -->
    <main class="layout__main">
      <div class="layout__container">
        <!-- 
          Если страница использует sidebar - показываем layout с сеткой
          Иначе - просто контент во всю ширину
        -->
        <slot />
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="layout__footer">
      <div class="layout__container">
        <div class="layout__footer-content">
          <div class="layout__footer-section">
            <h4>SnapBoard</h4>
            <p>Визуальная доска вдохновения</p>
          </div>
          
          <div class="layout__footer-section">
            <h4>Навигация</h4>
            <ul class="layout__footer-links">
              <li><NuxtLink to="/">Главная</NuxtLink></li>
              <li><NuxtLink to="/boards">Доски</NuxtLink></li>
              <li><NuxtLink to="/about">О проекте</NuxtLink></li>
            </ul>
          </div>
          
          <div class="layout__footer-section">
            <h4>Поддержка</h4>
            <ul class="layout__footer-links">
              <li><NuxtLink to="/help">Помощь</NuxtLink></li>
              <li><NuxtLink to="/privacy">Конфиденциальность</NuxtLink></li>
              <li><NuxtLink to="/terms">Условия</NuxtLink></li>
            </ul>
          </div>
        </div>
        
        <div class="layout__footer-bottom">
          <p>&copy; 2024 SnapBoard. Все права защищены</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.layout
  min-height: 100vh
  display: flex
  flex-direction: column
  background: $gray-100
  
  // Контейнер для ограничения ширины
  &__container
    max-width: $breakpoint-desktop
    width: 100%
    margin: 0 auto
    padding: 0 24px
    
    @include mobile
      padding: 0 16px
  
  // Основной контент - растягивается на всю доступную высоту
  &__main
    flex: 1
    padding: 32px 0
    
    @include mobile
      padding: 24px 0
  
  // Footer
  &__footer
    background: $secondary-color
    color: $text-dark
    padding: 48px 0 24px
    margin-top: 64px
  
  &__footer-content
    display: grid
    grid-template-columns: repeat(3, 1fr)
    gap: 32px
    margin-bottom: 32px
    
    // На планшетах - 2 колонки
    @include tablet
      grid-template-columns: repeat(2, 1fr)
    
    // На мобильных - 1 колонка
    @include mobile
      grid-template-columns: 1fr
  
  &__footer-section
    h4
      font-size: 16px
      font-weight: 700
      margin-bottom: 16px
      color: $text-dark
    
    p
      font-size: 14px
      color: rgba(255, 255, 255, 0.7)
      line-height: 1.6
  
  &__footer-links
    list-style: none
    display: flex
    flex-direction: column
    gap: 8px
    
    a
      color: rgba(255, 255, 255, 0.7)
      text-decoration: none
      font-size: 14px
      transition: color $transition-fast
      
      &:hover
        color: $primary-color
  
  &__footer-bottom
    padding-top: 24px
    border-top: 1px solid rgba(255, 255, 255, 0.1)
    text-align: center
    
    p
      font-size: 14px
      color: rgba(255, 255, 255, 0.5)
      margin: 0
</style>
```

---

## 6️⃣ Layout для аутентификации

### Файл: `layouts/auth.vue`

```vue
<template>
  <!-- 
    Layout для страниц входа и регистрации
    - Минималистичный дизайн
    - Центрированная форма
    - Без header и footer
  -->
  <div class="auth-layout">
    <!-- Логотип наверху -->
    <div class="auth-layout__header">
      <NuxtLink to="/" class="auth-layout__logo">
        <span class="auth-layout__logo-text">SnapBoard</span>
      </NuxtLink>
    </div>
    
    <!-- Основной контент (форма входа/регистрации) -->
    <main class="auth-layout__main">
      <article class="auth-layout__card">
        <slot />
      </article>
    </main>
    
    <!-- Подвал с ссылками -->
    <footer class="auth-layout__footer">
      <p>
        <NuxtLink to="/privacy">Конфиденциальность</NuxtLink>
        •
        <NuxtLink to="/terms">Условия использования</NuxtLink>
      </p>
    </footer>
  </div>
</template>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.auth-layout
  min-height: 100vh
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  background: linear-gradient(135deg, $gray-100 0%, white 100%)
  padding: 24px
  
  // Header с логотипом
  &__header
    position: absolute
    top: 32px
    left: 32px
    
    @include mobile
      position: static
      margin-bottom: 32px
  
  &__logo
    text-decoration: none
    color: $text-light
    font-weight: 700
    font-size: 24px
    transition: color $transition-fast
    
    &:hover
      color: $primary-color
  
  // Основной контент - центрированная карточка
  &__main
    flex: 1
    display: flex
    align-items: center
    justify-content: center
    width: 100%
  
  // Карточка с формой
  &__card
    background: white
    border-radius: $radius-lg
    box-shadow: $shadow-lg
    padding: 48px
    width: 100%
    max-width: 450px
    
    @include mobile
      padding: 32px
      max-width: 100%
  
  // Footer с ссылками
  &__footer
    padding: 24px
    text-align: center
    
    p
      font-size: 14px
      color: $gray-500
      margin: 0
    
    a
      color: $gray-500
      text-decoration: none
      transition: color $transition-fast
      
      &:hover
        color: $primary-color
</style>
```

---

## 7️⃣ Пример использования Layout с Sidebar

### Файл: `pages/boards/index.vue` (пример)

```vue
<template>
  <div class="boards-page">
    <!-- Breadcrumbs для навигации -->
    <LayoutAppBreadcrumbs :crumbs="breadcrumbs" />
    
    <!-- Layout с сеткой: Sidebar + Контент -->
    <div class="boards-page__layout">
      <!-- Sidebar с фильтрами -->
      <LayoutAppSidebar title="Фильтры">
        <!-- Здесь будут фильтры - пока заглушка -->
        <div class="filter-section">
          <h4>Категории</h4>
          <ul>
            <li>Дизайн</li>
            <li>Путешествия</li>
            <li>Рецепты</li>
            <li>Мода</li>
          </ul>
        </div>
      </LayoutAppSidebar>
      
      <!-- Основной контент -->
      <section class="boards-page__content">
        <h1>Мои доски</h1>
        <p>Здесь будет список досок с изображениями</p>
        
        <!-- Grid с досками - будет реализовано позже -->
        <div class="boards-grid">
          <CommonBaseCard v-for="i in 6" :key="i" :clickable="true">
            <div class="board-card">
              <div class="board-card__preview">
                <!-- Здесь будут изображения -->
                <div class="board-card__placeholder"></div>
              </div>
              <div class="board-card__info">
                <h3>Доска {{ i }}</h3>
                <p>12 изображений</p>
              </div>
            </div>
          </CommonBaseCard>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Хлебные крошки для этой страницы
 */
const breadcrumbs = [
  { label: 'Главная', path: '/' },
  { label: 'Мои доски', path: '/boards' }
]
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.boards-page
  // Layout с сеткой: sidebar слева, контент справа
  &__layout
    display: grid
    grid-template-columns: auto 1fr
    gap: 32px
    
    // На планшетах убираем sidebar (он скрыт через @include tablet)
    @include tablet
      grid-template-columns: 1fr
  
  // Основной контент справа от sidebar
  &__content
    min-width: 0 // чтобы grid не переполнялся
    
    h1
      font-size: 32px
      margin-bottom: 24px
      color: $text-light

// Grid с досками
.boards-grid
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))
  gap: 24px
  margin-top: 32px

// Карточка доски (пример)
.board-card
  &__preview
    height: 200px
    background: $gray-200
    border-radius: $radius-sm
    overflow: hidden
  
  &__placeholder
    width: 100%
    height: 100%
    background: linear-gradient(135deg, $gray-200 0%, $gray-300 100%)
  
  &__info
    padding: 16px
    
    h3
      font-size: 18px
      margin-bottom: 8px
      color: $text-light
    
    p
      font-size: 14px
      color: $gray-500
      margin: 0

// Секция фильтров в sidebar (заглушка)
.filter-section
  h4
    font-size: 14px
    font-weight: 600
    margin-bottom: 8px
    color: $text-light
  
  ul
    list-style: none
    display: flex
    flex-direction: column
    gap: 8px
    
    li
      font-size: 14px
      color: $gray-500
      cursor: pointer
      transition: color $transition-fast
      
      &:hover
        color: $primary-color
</style>
```

---

## ✅ Результат этапа

После завершения этапа у вас будут:

1. ✅ Компонент LayoutAppHeader с адаптивной навигацией
2. ✅ LayoutMobileMenu - выдвижное меню для мобильных
3. ✅ LayoutAppSidebar для фильтров и категорий
4. ✅ LayoutAppBreadcrumbs для навигации по страницам
5. ✅ Обновлённый layout с footer
6. ✅ Отдельный layout для аутентификации
7. ✅ Пример страницы с использованием sidebar

---

## 🎯 Следующий этап

**Этап 4: Аутентификация**

В следующем этапе создадим:
- Pinia Store для аутентификации
- Формы входа и регистрации
- Валидацию форм
- Middleware для защищённых роутов
- Работу с JWT токенами

---

## 💡 Важные моменты

### Именование компонентов в Nuxt:
```
components/
├── common/
│   ├── BaseButton.vue     → <CommonBaseButton>
│   ├── BaseInput.vue      → <CommonBaseInput>
│   └── BaseCard.vue       → <CommonBaseCard>
├── layout/
│   ├── AppHeader.vue      → <LayoutAppHeader>
│   ├── MobileMenu.vue     → <LayoutMobileMenu>
│   ├── AppSidebar.vue     → <LayoutAppSidebar>
│   └── AppBreadcrumbs.vue → <LayoutAppBreadcrumbs>
```

### Семантические теги:
- `<header>` - шапка приложения
- `<nav>` - навигация и меню
- `<aside>` - sidebar с фильтрами
- `<main>` - основной контент
- `<footer>` - подвал
- `<article>` - карточки и отдельные элементы

### Отступы без переменных:
- Все значения прописаны явно в `px`
- Легко изменять под свои нужды
- Нет зависимости от `$spacing-unit`

### Адаптивность:
- Desktop: полная навигация + sidebar
- Tablet: бургер-меню, без sidebar
- Mobile: мобильное меню, упрощённый layout

---

Готовы перейти к **Этапу 4: Аутентификация**? 🚀