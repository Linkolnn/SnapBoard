# Этап 10.2: UI улучшения (UI Improvements) SnapBoard

## 🎯 Цель этапа
Исправить оставшиеся проблемы интерфейса: улучшить адаптивность сетки, исправить навигацию в header и мобильном меню, унифицировать header на всех страницах, использовать favicon вместо текстового лого, интегрировать MasonryGrid на страницу доски.

---

## 📋 Чеклист этапа
- [x] Сетка 2 колонки при ширине < 350px
- [x] Все пункты навигации в header (не только для авторизованных)
- [x] Все пункты навигации в мобильном меню
- [x] Убрать поисковик из мобильного меню
- [x] Поиск адаптивный в header (виден до последнего)
- [x] Единый header на страницах login/register (без поиска, с кнопками входа)
- [x] Использовать MasonryGrid на странице доски [id].vue
- [x] Favicon вместо текстового лого в header
- [x] Поиск ищет по названиям И по тегам

---

## 1️⃣ Сетка 2 колонки при ширине < 350px

### Проблема
При очень узких экранах (< 350px) сетка может показывать 1 колонку, хотя лучше 2.

### Решение
Обновить `gridConfig.ts` и добавить минимум 2 колонки для узких экранов.

### Файл: `utils/gridConfig.ts`

```typescript
export const MASONRY_CONFIG = {
  minColumnWidth: {
    desktop: 280,
    tablet: 220,
    mobile: 140  // Уменьшено для 2 колонок на узких экранах
  },
  gap: {
    desktop: 16,
    tablet: 12,
    mobile: 8
  },
  maxColumns: 6,
  minColumns: 2  // Минимум 2 колонки
}

export function getMasonryConfig() {
  if (typeof window === 'undefined') {
    return {
      minColumnWidth: MASONRY_CONFIG.minColumnWidth.desktop,
      gap: MASONRY_CONFIG.gap.desktop
    }
  }
  
  const width = window.innerWidth
  
  if (width < 576) {
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

### Файл: `components/image/MasonryGrid.vue`

Обновить расчёт колонок с минимумом 2:

```typescript
const updateColumnCount = () => {
  if (!gridRef.value) return
  
  const width = gridRef.value.offsetWidth
  const minWidth = gridConfig.value.minColumnWidth
  const gap = gridConfig.value.gap
  
  const count = Math.floor((width + gap) / (minWidth + gap))
  // Минимум 2 колонки, максимум из конфига
  columnCount.value = Math.max(MASONRY_CONFIG.minColumns, Math.min(count, MASONRY_CONFIG.maxColumns))
}
```

---

## 2️⃣ Все пункты навигации в header

### Проблема
Отображается только "Главная", остальные пункты скрыты для неавторизованных.

### Решение
Добавить публичные пункты навигации (О нас, Помощь) для всех пользователей.

### Файл: `components/layout/Header.vue`

```typescript
const navItems: NavItem[] = [
  { text: 'Главная', link: '/' },
  { text: 'О нас', link: '/about' },
  { text: 'Помощь', link: '/help' },
  { text: 'Мои доски', link: '/boards', requiresAuth: true },
  { text: 'Избранное', link: '/favorites', requiresAuth: true },
]
```

---

## 3️⃣ Убрать поисковик из мобильного меню

### Проблема
В мобильном меню есть поисковик, но он должен быть только в header.

### Решение
Удалить секцию поиска из `MobileMenu.vue`.

### Файл: `components/layout/MobileMenu.vue`

Удалить:
```vue
<div class="mobile-menu__search">
  <input 
    type="search" 
    placeholder="Поиск..."
    class="mobile-menu__search-inp"
  />
</div>
```

---

## 4️⃣ Поиск адаптивный в header

### Проблема
Поиск скрывается на tablet, но должен быть виден до последнего.

### Решение
Убрать `@include tablet { display: none }` для поиска, сделать его компактным на мобильных.

### Файл: `components/layout/Header.vue` (стили)

```sass
&__search
  position: relative
  flex: 1
  max-width: 300px
  
  @include mobile
    max-width: 150px
  
&__search-inp
  width: 100%
  min-width: 80px
  // ... остальные стили
```

---

## 5️⃣ Единый header на страницах login/register

### Проблема
Страницы авторизации используют отдельный упрощённый header в `auth.vue` layout.

### Решение
Использовать основной `Header.vue` компонент с пропсом для скрытия поиска.

### Файл: `components/layout/Header.vue`

Добавить проп:
```typescript
interface Props {
  hideSearch?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hideSearch: false
})
```

В шаблоне:
```vue
<div v-if="!hideSearch" class="app-header__search">
  <!-- поиск -->
</div>
```

### Файл: `layouts/auth.vue`

```vue
<template>
  <div class="auth-layout">
    <LayoutHeader :hide-search="true" />
    
    <main class="auth-layout__main">
      <article class="auth-layout__card">
        <slot />
      </article>
    </main>
    
    <LayoutFooter />
  </div>
</template>
```

---

## 6️⃣ MasonryGrid на странице доски

### Проблема
Страница `boards/[id].vue` использует простой grid вместо MasonryGrid.

### Решение
Заменить grid на компонент `ImageMasonryGrid`.

### Файл: `pages/boards/[id].vue`

Заменить секцию галереи:
```vue
<section class="board-page__gallery">
  <!-- Masonry Grid -->
  <ImageMasonryGrid
    v-if="displayedImages.length"
    :images="displayedImages"
    :is-loading="infiniteLoading && displayedImages.length === 0"
    @image-click="handleImageClick"
  />
  
  <!-- Пустые состояния остаются -->
  <div v-else-if="hasActiveFilters && !infiniteLoading" class="board-page__no-results">
    <!-- ... -->
  </div>
  
  <!-- Infinite scroll loader -->
  <InfiniteScrollLoadMore ... />
</section>
```

Удалить старые стили `&__images` и `&__image`.

---

## 7️⃣ Favicon вместо текстового лого

### Проблема
В header текст "SnapBoard", нужна иконка.

### Решение
Использовать favicon.ico как лого.

### Файл: `components/layout/Header.vue`

```vue
<NuxtLink to="/" class="app-header__logo-link">
  <img src="/favicon.ico" alt="SnapBoard" class="app-header__logo-icon" />
  <span class="app-header__logo-text">SnapBoard</span>
</NuxtLink>
```

Стили:
```sass
&__logo-icon
  width: 32px
  height: 32px
  margin-right: 8px

&__logo-text
  @include mobile
    display: none  // Скрыть текст на мобильных, оставить только иконку
```

---

## 8️⃣ Поиск по названиям и тегам

### Проблема
Поиск в header не фильтрует изображения на главной странице.

### Решение
Интегрировать поиск с `useSearch` composable на главной странице.

### Файл: `pages/index.vue`

```vue
<script setup lang="ts">
import { useInfiniteScroll } from '~/composables/useInfiniteScroll'
import { useSearch } from '~/composables/useSearch'

const {
  items,
  isLoading,
  hasMore,
  error,
  retry,
  sentinelRef
} = useInfiniteScroll({
  boardId: 'home',
  config: { pageSize: 12, threshold: 200, initialLoad: true }
})

const { filteredImages, hasActiveFilters } = useSearch()

// Отображаемые изображения с учётом фильтра
const displayedImages = computed(() => {
  if (hasActiveFilters.value) {
    return filteredImages.value
  }
  return items.value
})
</script>

<template>
  <ImageMasonryGrid
    :images="displayedImages"
    :is-loading="isLoading && displayedImages.length === 0"
    @image-click="handleImageClick"
  />
</template>
```

---

## 📁 Файлы для изменения

| Файл | Изменения |
|------|-----------|
| `utils/gridConfig.ts` | Минимум 2 колонки |
| `components/image/MasonryGrid.vue` | Минимум 2 колонки |
| `components/layout/Header.vue` | Все nav items, favicon, hideSearch проп |
| `components/layout/MobileMenu.vue` | Убрать поиск |
| `layouts/auth.vue` | Использовать Header компонент |
| `pages/boards/[id].vue` | Использовать MasonryGrid |
| `pages/index.vue` | Интегрировать поиск |

---

## ✅ Критерии завершения

1. Сетка минимум 2 колонки на любой ширине
2. Все пункты навигации видны в header и мобильном меню
3. Поисковик только в header, не в мобильном меню
4. Поиск адаптивный, виден на всех размерах экрана
5. Страницы login/register используют основной header без поиска
6. Страница доски использует MasonryGrid
7. Favicon отображается как лого
8. Поиск работает по названиям и тегам
9. Нет TypeScript ошибок
