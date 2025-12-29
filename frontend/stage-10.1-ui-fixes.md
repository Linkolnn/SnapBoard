# Этап 10.1: UI исправления (UI Fixes) SnapBoard

## 🎯 Цель этапа
Исправить выявленные проблемы интерфейса: добавить бесконечный скролл на главную страницу, исправить поиск в header, добавить header на страницы авторизации, улучшить отображение карточек на мобильных устройствах и обеспечить единообразие masonry grid на всех страницах.

---

## 📋 Чеклист этапа
- [x] Бесконечный скролл на главной странице
- [x] Работающий поиск в header
- [x] Header на страницах авторизации
- [x] Overlay карточек всегда видим на мобильных
- [x] Единообразие masonry grid на всех страницах
- [x] Адаптация высоты карточек под изображения

---

## 1️⃣ Бесконечный скролл на главной странице

### Проблема
Главная страница (`pages/index.vue`) использует статичный массив mock-изображений без пагинации и бесконечного скролла.

### Решение
Интегрировать `useInfiniteScroll` composable и компоненты `InfiniteScrollLoadMore` на главную страницу.

### Файл: `pages/index.vue`

```vue
<template>
  <div class="home-page">
    <!-- Hero секция -->
    <section class="home-page__hero">
      <div class="home-page__container">
        <h1>Добро пожаловать в SnapBoard</h1>
        <p>Ваша визуальная доска вдохновения</p>
      </div>
    </section>
    
    <!-- Галерея с бесконечным скроллом -->
    <section class="home-page__gallery">
      <div class="home-page__container">
        <h2>Популярные изображения</h2>
        
        <!-- Masonry Grid -->
        <ImageMasonryGrid
          :images="items"
          :is-loading="isLoading && items.length === 0"
          :min-column-width="250"
          :gap="16"
          @image-click="handleImageClick"
        />
        
        <!-- Infinite Scroll Loader -->
        <InfiniteScrollLoadMore
          :is-loading="isLoading"
          :has-more="hasMore"
          :error="error"
          :item-count="items.length"
          @retry="retry"
          @sentinel-mounted="handleSentinelMounted"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useInfiniteScroll } from '~/composables/useInfiniteScroll'
import type { Image } from '~/types'

// Используем infinite scroll для главной страницы (без boardId)
const {
  items,
  isLoading,
  hasMore,
  error,
  retry,
  sentinelRef
} = useInfiniteScroll({
  boardId: 'home', // Специальный ID для главной страницы
  config: {
    pageSize: 12,
    threshold: 200,
    initialLoad: true
  }
})

const handleSentinelMounted = (element: HTMLElement | null) => {
  sentinelRef.value = element
}

const handleImageClick = (image: Image) => {
  console.log('Image clicked:', image)
  // TODO: Открыть модальное окно с изображением
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.home-page
  width: 100%
  
  &__container
    max-width: $breakpoint-desktop
    margin: 0 auto
    padding: 0 24px
    
    @include mobile
      padding: 0 16px
  
  &__hero
    padding: 48px 0
    text-align: center
    
    h1
      font-size: 42px
      font-weight: 700
      color: $text-light
      margin-bottom: 16px
      
      @include mobile
        font-size: 32px
    
    p
      font-size: 18px
      color: $gray-500
  
  &__gallery
    padding: 32px 0 64px
    
    h2
      font-size: 28px
      font-weight: 700
      color: $text-light
      margin-bottom: 32px
      
      @include mobile
        font-size: 24px
</style>
```

---

## 2️⃣ Работающий поиск в header

### Проблема
Поле поиска в header не связано с функциональностью поиска. При вводе текста ничего не происходит.

### Решение
Связать поле поиска с `useSearchStore` и добавить навигацию на страницу результатов или фильтрацию на текущей странице.

### Файл: `components/layout/Header.vue`

```vue
<template>
  <header class="app-header">
    <div class="app-header__container">
      <!-- ... logo ... -->

      <nav class="app-header__nav">
        <!-- ... nav items ... -->
      </nav>

      <article class="app-header__actions">
        <!-- Обновлённый поиск -->
        <div class="app-header__search">
          <div class="app-header__search-wrapper">
            <span class="app-header__search-icon">🔍</span>
            <input 
              v-model="searchQuery"
              class="app-header__search-inp"
              type="search" 
              placeholder="Поиск изображений..." 
              @keydown.enter="handleSearch"
              @focus="showSearchDropdown = true"
              @blur="handleSearchBlur"
            />
            <button 
              v-if="searchQuery"
              class="app-header__search-clear"
              @click="clearSearch"
            >
              ✕
            </button>
          </div>
          
          <!-- Dropdown с историей поиска -->
          <Transition name="dropdown">
            <div 
              v-if="showSearchDropdown && searchHistory.length > 0 && !searchQuery" 
              class="app-header__search-dropdown"
            >
              <div class="app-header__search-dropdown-header">
                <span>Недавние поиски</span>
                <button @click.stop="clearSearchHistory">Очистить</button>
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
        
        <!-- ... остальные actions ... -->
      </article>
    </div>
    
    <!-- ... mobile menu ... -->
  </header>
</template>

<script setup lang="ts">
import { useSearchStore } from '~/store/search'
import { storeToRefs } from 'pinia'

// ... существующий код ...

const searchStore = useSearchStore()
const { query: storeQuery, history: searchHistory } = storeToRefs(searchStore)

const searchQuery = ref('')
const showSearchDropdown = ref(false)

// Синхронизация с store
watch(storeQuery, (newQuery) => {
  searchQuery.value = newQuery
})

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    searchStore.setQuery(searchQuery.value)
    searchStore.addToHistory(searchQuery.value)
    
    // Навигация на страницу поиска или текущую страницу с фильтром
    const route = useRoute()
    if (route.path === '/' || route.path.startsWith('/boards/')) {
      // Остаёмся на странице - поиск применится автоматически
    } else {
      // Переходим на главную с поиском
      navigateTo('/')
    }
  }
  showSearchDropdown.value = false
}

const clearSearch = () => {
  searchQuery.value = ''
  searchStore.setQuery('')
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
// Добавить стили для обновлённого поиска
.app-header
  &__search
    position: relative
    
    @include tablet
      display: none
  
  &__search-wrapper
    display: flex
    align-items: center
    gap: 8px
    padding: 8px 16px
    background: $gray-100
    border: 2px solid transparent
    border-radius: $radius
    transition: all $transition-fast
    
    &:focus-within
      background: white
      border-color: $primary-color
  
  &__search-icon
    font-size: 14px
    color: $gray-400
  
  &__search-inp
    width: 200px
    border: none
    background: transparent
    font-size: 14px
    color: $text-light
    outline: none
    
    &::placeholder
      color: $gray-400
  
  &__search-clear
    display: flex
    align-items: center
    justify-content: center
    width: 20px
    height: 20px
    background: $gray-300
    border: none
    border-radius: 50%
    font-size: 10px
    color: $gray-600
    cursor: pointer
    
    &:hover
      background: $gray-400
      color: white
  
  &__search-dropdown
    position: absolute
    top: calc(100% + 8px)
    left: 0
    right: 0
    background: white
    border-radius: $radius
    box-shadow: $shadow-lg
    z-index: $z-index-dropdown
    overflow: hidden
    
    &-header
      display: flex
      justify-content: space-between
      align-items: center
      padding: 12px 16px
      border-bottom: 1px solid $gray-100
      font-size: 13px
      color: $gray-500
      
      button
        background: none
        border: none
        color: $primary-color
        cursor: pointer
        
        &:hover
          text-decoration: underline
    
    ul
      list-style: none
      max-height: 200px
      overflow-y: auto
    
    li
      display: flex
      align-items: center
      gap: 12px
      padding: 10px 16px
      cursor: pointer
      transition: background $transition-fast
      
      &:hover
        background: $gray-50
      
      span:first-child
        color: $gray-400
</style>
```

---

## 3️⃣ Header на страницах авторизации

### Проблема
Страницы `/login` и `/register` используют `auth.vue` layout без полноценного header с навигацией.

### Решение
Добавить упрощённый header в `auth.vue` layout с логотипом и ссылкой на главную.

### Файл: `layouts/auth.vue`

```vue
<template>
  <div class="auth-layout">
    <!-- Header с навигацией -->
    <header class="auth-layout__header">
      <div class="auth-layout__header-container">
        <NuxtLink to="/" class="auth-layout__logo">
          SnapBoard
        </NuxtLink>
        
        <nav class="auth-layout__nav">
          <NuxtLink to="/" class="auth-layout__nav-link">
            Главная
          </NuxtLink>
          <NuxtLink to="/about" class="auth-layout__nav-link">
            О нас
          </NuxtLink>
          <NuxtLink to="/help" class="auth-layout__nav-link">
            Помощь
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main class="auth-layout__main">
      <article class="auth-layout__card">
        <slot />
      </article>
    </main>
    
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
  background: linear-gradient(135deg, $gray-100 0%, white 100%)
  
  // Header
  &__header
    background: white
    border-bottom: 1px solid $gray-200
  
  &__header-container
    max-width: $breakpoint-desktop
    margin: 0 auto
    padding: 16px 24px
    display: flex
    align-items: center
    justify-content: space-between
    
    @include mobile
      padding: 16px
  
  &__logo
    text-decoration: none
    color: $text-light
    font-weight: 700
    font-size: 24px
    transition: color $transition-fast
    
    &:hover
      color: $primary-color
  
  &__nav
    display: flex
    gap: 24px
    
    @include mobile
      gap: 16px
  
  &__nav-link
    color: $gray-500
    text-decoration: none
    font-size: 14px
    font-weight: 500
    transition: color $transition-fast
    
    &:hover
      color: $primary-color
    
    &.router-link-active
      color: $primary-color
  
  // Main content
  &__main
    flex: 1
    display: flex
    align-items: center
    justify-content: center
    padding: 48px 24px
    
    @include mobile
      padding: 24px 16px
  
  // Card
  &__card
    background: white
    border-radius: $radius-lg
    box-shadow: $shadow-lg
    padding: 48px
    width: 100%
    max-width: 450px
    
    @include mobile
      padding: 32px 24px
  
  // Footer
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

## 4️⃣ Overlay карточек всегда видим на мобильных

### Проблема
На мобильных устройствах `img-card__overlay` скрыт и появляется только при hover, что невозможно на touch-устройствах.

### Решение
Использовать SASS миксин `@include mobile` для отображения overlay всегда на мобильных устройствах.

### Файл: `components/image/Card.vue`

```vue
<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.img-card
  position: relative
  width: 100%
  border-radius: $radius
  overflow: hidden
  cursor: pointer
  background: $gray-200
  transition: all $transition-normal
  
  &:hover
    transform: translateY(-4px)
    box-shadow: $shadow-lg
    
    .img-card__overlay
      opacity: 1
  
  &__img
    width: 100%
    height: auto
    display: block
    animation: fadeIn 0.3s ease-in
  
  &__overlay
    position: absolute
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: linear-gradient(to bottom, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.7) 100%)
    display: flex
    align-items: flex-end
    padding: 16px
    opacity: 0
    transition: opacity $transition-normal
    
    // На мобильных overlay всегда видим
    @include mobile
      opacity: 1
      background: linear-gradient(to bottom, transparent 0%, transparent 60%, rgba(0, 0, 0, 0.6) 100%)
    
    @include tablet
      opacity: 1
      background: linear-gradient(to bottom, transparent 0%, transparent 60%, rgba(0, 0, 0, 0.6) 100%)
  
  &__info
    width: 100%
    color: white
  
  &__title
    font-size: 16px
    font-weight: 600
    margin-bottom: 4px
    display: -webkit-box
    -webkit-line-clamp: 2
    -webkit-box-orient: vertical
    overflow: hidden
    
    @include mobile
      font-size: 14px
  
  &__desc
    font-size: 14px
    margin-bottom: 8px
    opacity: 0.9
    display: -webkit-box
    -webkit-line-clamp: 2
    -webkit-box-orient: vertical
    overflow: hidden
    
    @include mobile
      display: none // Скрываем описание на мобильных для экономии места
  
  &__tags
    display: flex
    gap: 8px
    flex-wrap: wrap
    
    @include mobile
      gap: 4px
  
  &__tag
    font-size: 12px
    padding: 4px 8px
    background: rgba(255, 255, 255, 0.2)
    border-radius: $radius-sm
    backdrop-filter: blur(4px)
    
    @include mobile
      font-size: 11px
      padding: 2px 6px

@keyframes fadeIn
  from
    opacity: 0
  to
    opacity: 1
</style>
```

---

## 5️⃣ Единообразие masonry grid на всех страницах

### Проблема
Masonry grid может отображаться по-разному на разных страницах из-за различных настроек или контейнеров.

### Решение
Создать единые настройки для masonry grid и использовать их на всех страницах.

### Файл: `utils/gridConfig.ts`

```typescript
/**
 * Единые настройки для masonry grid
 */
export const MASONRY_CONFIG = {
  // Минимальная ширина колонки
  minColumnWidth: {
    desktop: 280,
    tablet: 220,
    mobile: 160
  },
  
  // Отступы между элементами
  gap: {
    desktop: 16,
    tablet: 12,
    mobile: 8
  },
  
  // Максимальное количество колонок
  maxColumns: 6
}

/**
 * Получить конфигурацию для текущего размера экрана
 */
export function getMasonryConfig() {
  if (typeof window === 'undefined') {
    return {
      minColumnWidth: MASONRY_CONFIG.minColumnWidth.desktop,
      gap: MASONRY_CONFIG.gap.desktop
    }
  }
  
  const width = window.innerWidth
  
  if (width < 640) {
    return {
      minColumnWidth: MASONRY_CONFIG.minColumnWidth.mobile,
      gap: MASONRY_CONFIG.gap.mobile
    }
  }
  
  if (width < 1024) {
    return {
      minColumnWidth: MASONRY_CONFIG.minColumnWidth.tablet,
      gap: MASONRY_CONFIG.gap.tablet
    }
  }
  
  return {
    minColumnWidth: MASONRY_CONFIG.minColumnWidth.desktop,
    gap: MASONRY_CONFIG.gap.desktop
  }
}
```

### Обновление `components/image/MasonryGrid.vue`

```vue
<script setup lang="ts">
import { getMasonryConfig } from '~/utils/gridConfig'

interface Props {
  images: Image[]
  isLoading?: boolean
  minColumnWidth?: number
  gap?: number
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  minColumnWidth: undefined,
  gap: undefined
})

// Используем конфигурацию по умолчанию если не передана
const gridConfig = computed(() => {
  const defaultConfig = getMasonryConfig()
  return {
    minColumnWidth: props.minColumnWidth ?? defaultConfig.minColumnWidth,
    gap: props.gap ?? defaultConfig.gap
  }
})

const {
  items: layoutItems,
  columnCount,
  columnWidth,
  containerHeight,
  gap,
  calculateLayout
} = useMasonryLayout(gridConfig.value.minColumnWidth, gridConfig.value.gap)

// ... остальной код ...
</script>
```

---

## 6️⃣ Адаптация высоты карточек под изображения

### Проблема
Карточки могут иметь белые пробелы если высота не соответствует реальному размеру изображения.

### Решение
Убедиться что карточки используют `height: auto` и правильно обрабатывают загрузку изображений.

### Файл: `components/image/Card.vue`

```vue
<template>
  <article 
    class="img-card"
    :class="{ 
      'img-card--loaded': isLoaded,
      'img-card--loading': !isLoaded
    }"
    @click="handleClick"
  >
    <!-- Skeleton пока не загружено -->
    <ImageSkeleton 
      v-if="!isLoaded"
      :height="estimatedHeight"
    />
    
    <!-- Изображение -->
    <div v-show="isLoaded" class="img-card__image-wrapper">
      <img
        ref="imgRef"
        :src="image.url"
        :alt="image.title || 'Image'"
        class="img-card__img"
        loading="lazy"
        @load="handleImageLoad"
        @error="handleImageError"
      />
    </div>
    
    <!-- Overlay -->
    <div v-if="isLoaded" class="img-card__overlay">
      <!-- ... overlay content ... -->
    </div>
  </article>
</template>

<script setup lang="ts">
const imgRef = ref<HTMLImageElement | null>(null)
const isLoaded = ref(false)
const actualHeight = ref(0)

const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  
  // Получаем реальную высоту изображения
  actualHeight.value = img.naturalHeight * (img.offsetWidth / img.naturalWidth)
  
  emit('load', img.offsetHeight)
  isLoaded.value = true
}
</script>

<style lang="sass" scoped>
.img-card
  // ... существующие стили ...
  
  &__image-wrapper
    width: 100%
    line-height: 0 // Убирает пробел под inline изображением
  
  &__img
    width: 100%
    height: auto
    display: block
    object-fit: cover
</style>
```

---

## 7️⃣ Исправление типа User в Header

### Проблема
В `Header.vue` используется `user.value?.name`, но в типе `User` нет поля `name`, есть `username`.

### Файл: `components/layout/Header.vue`

```typescript
// Исправить:
const userName = computed(() => user.value?.username || 'Пользователь')
const userInitials = computed(() => {
  const name = user.value?.username || 'U'
  return name.charAt(0).toUpperCase()
})
```

---

## 📁 Файлы для изменения

| Файл | Изменения |
|------|-----------|
| `pages/index.vue` | Добавить infinite scroll |
| `components/layout/Header.vue` | Исправить поиск, исправить тип user |
| `layouts/auth.vue` | Добавить header с навигацией |
| `components/image/Card.vue` | Overlay всегда видим на мобильных |
| `components/image/MasonryGrid.vue` | Единая конфигурация |
| `utils/gridConfig.ts` | Новый файл с конфигурацией grid |

---

## ✅ Критерии завершения

1. На главной странице работает бесконечный скролл
2. Поиск в header работает и сохраняет историю
3. Страницы авторизации имеют header с навигацией
4. На мобильных устройствах overlay карточек всегда видим
5. Masonry grid выглядит одинаково на всех страницах
6. Карточки не имеют белых пробелов
7. Нет TypeScript ошибок
