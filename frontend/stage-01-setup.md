# Этап 1: Настройка проекта и базовая структура

## 📖 Содержание
1. [Инициализация Nuxt 4](#1-инициализация-nuxt-4)
2. [Настройка TypeScript](#2-настройка-typescript)
3. [Установка Pinia](#3-установка-pinia)
4. [Настройка SASS](#4-настройка-sass)
5. [Установка nuxt-security](#5-установка-nuxt-security)
6. [Создание структуры папок](#6-создание-структуры-папок)
7. [Настройка ESLint и Prettier](#7-настройка-eslint-и-prettier)

---

## 1. Инициализация Nuxt 4

### Создание проекта

Если проект еще не создан:

```bash
# Создаём новый Nuxt проект
npx nuxi@latest init frontend

# Переходим в папку проекта
cd frontend

# Устанавливаем зависимости
npm install
```

Если проект уже создан, переходим к настройке.

### Проверка версии Nuxt

Убедитесь, что используете Nuxt 4:

```bash
npm list nuxt
```

Должно быть `nuxt@^4.0.0` или выше.

### Базовая структура после инициализации

```
frontend/
├── node_modules/
├── public/              # Статические файлы
├── server/              # Серверная часть Nuxt
├── .gitignore
├── app.vue              # Корневой компонент
├── nuxt.config.ts       # Конфигурация
├── package.json
└── tsconfig.json        # TypeScript конфигурация
```

---

## 2. Настройка TypeScript

### TypeScript в Nuxt 4

Nuxt 4 имеет встроенную поддержку TypeScript. При создании проекта TypeScript настраивается автоматически.

### Проверка tsconfig.json

Файл `tsconfig.json` должен содержать:

```json
{
  "extends": "./.nuxt/tsconfig.json"
}
```

Это подключает автоматически генерируемую конфигурацию Nuxt.

### Создание дополнительных типов

Создайте файл `types/index.ts` для глобальных типов:

```bash
mkdir types
touch types/index.ts
```

**types/index.ts:**
```typescript
// Глобальные типы приложения
export {}; // Делаем файл модулем

declare global {
  // Здесь будут глобальные типы
}
```

### Настройка автоимпортов типов

В `nuxt.config.ts` убедитесь, что включены автоимпорты:

```typescript
export default defineNuxtConfig({
  typescript: {
    strict: true,        // Строгий режим TypeScript
    typeCheck: true,     // Проверка типов при сборке
    shim: false          // Отключаем shim файлы
  }
})
```

---

## 3. Установка Pinia

### Установка пакетов

```bash
npm install pinia @pinia/nuxt
```

### Настройка в nuxt.config.ts

```typescript
export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt'
  ],
  
  pinia: {
    storesDirs: ['./stores/**']  // Папки со store
  }
})
```

### Создание структуры stores

```bash
mkdir stores
touch stores/.gitkeep
```

### Пример базового store

Создайте `stores/counter.ts` для проверки работы:

```typescript
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  
  getters: {
    doubleCount: (state) => state.count * 2
  },
  
  actions: {
    increment() {
      this.count++
    },
    
    decrement() {
      this.count--
    }
  }
})
```

### Использование store в компоненте

```vue
<script setup lang="ts">
const counterStore = useCounterStore()
</script>

<template>
  <div>
    <p>Count: {{ counterStore.count }}</p>
    <p>Double: {{ counterStore.doubleCount }}</p>
    <button @click="counterStore.increment">+</button>
    <button @click="counterStore.decrement">-</button>
  </div>
</template>
```

---

## 4. Настройка SASS

### Установка пакетов

```bash
npm install -D sass
```

### Создание структуры стилей

```bash
mkdir -p assets/styles
touch assets/styles/main.scss
touch assets/styles/_variables.scss
touch assets/styles/_mixins.scss
touch assets/styles/_reset.scss
```

### Базовые файлы стилей

**assets/styles/_variables.scss:**
```scss
// Цвета
$primary-color: #e60023;
$secondary-color: #111111;
$background-light: #ffffff;
$background-dark: #1a1a1a;
$text-light: #333333;
$text-dark: #f0f0f0;
$border-color: #e0e0e0;

// Размеры
$header-height: 64px;
$sidebar-width: 240px;
$container-max-width: 1200px;

// Breakpoints
$mobile: 480px;
$tablet: 768px;
$desktop: 1024px;
$wide: 1440px;

// Отступы
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

// Border radius
$radius-sm: 4px;
$radius-md: 8px;
$radius-lg: 16px;
$radius-full: 9999px;

// Transitions
$transition-fast: 0.15s ease;
$transition-base: 0.3s ease;
$transition-slow: 0.5s ease;

// Shadows
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.15);
```

**assets/styles/_mixins.scss:**
```scss
// Миксин для flexbox
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

// Адаптивность
@mixin mobile {
  @media (max-width: $mobile) {
    @content;
  }
}

@mixin tablet {
  @media (max-width: $tablet) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: $desktop) {
    @content;
  }
}

// Truncate text
@mixin truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Multi-line truncate
@mixin line-clamp($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// Transition миксин
@mixin transition($property: all, $duration: $transition-base) {
  transition: $property $duration;
}
```

**assets/styles/_reset.scss:**
```scss
// CSS Reset
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
               'Helvetica Neue', Arial, sans-serif;
  line-height: 1.5;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

input, button, textarea, select {
  font: inherit;
}

button {
  cursor: pointer;
  border: none;
  background: none;
}

a {
  text-decoration: none;
  color: inherit;
}

ul, ol {
  list-style: none;
}
```

**assets/styles/main.scss:**
```scss
// Импорт базовых файлов
@import 'variables';
@import 'mixins';
@import 'reset';

// Глобальные стили
body {
  background-color: $background-light;
  color: $text-light;
  transition: background-color $transition-base, color $transition-base;
}

// Темная тема
body.dark {
  background-color: $background-dark;
  color: $text-dark;
}

// Контейнер
.container {
  max-width: $container-max-width;
  margin: 0 auto;
  padding: 0 $spacing-md;
}

// Утилиты
.text-center {
  text-align: center;
}

.mt-sm { margin-top: $spacing-sm; }
.mt-md { margin-top: $spacing-md; }
.mt-lg { margin-top: $spacing-lg; }

.mb-sm { margin-bottom: $spacing-sm; }
.mb-md { margin-bottom: $spacing-md; }
.mb-lg { margin-bottom: $spacing-lg; }
```

### Подключение стилей в nuxt.config.ts

```typescript
export default defineNuxtConfig({
  css: [
    '@/assets/styles/main.scss'
  ],
  
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "@/assets/styles/_variables.scss";
            @import "@/assets/styles/_mixins.scss";
          `
        }
      }
    }
  }
})
```

---

## 5. Установка nuxt-security

### Установка модуля

```bash
npm install -D nuxt-security
```

### Настройка в nuxt.config.ts

```typescript
export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    'nuxt-security'
  ],
  
  security: {
    headers: {
      crossOriginEmbedderPolicy: 'unsafe-none',
      contentSecurityPolicy: {
        'img-src': ["'self'", 'data:', 'https:'],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"]
      }
    },
    
    rateLimiter: {
      tokensPerInterval: 150,
      interval: 'hour',
      fireImmediately: false
    }
  }
})
```

---

## 6. Создание структуры папок

### Создание всех необходимых папок

```bash
# Основные папки
mkdir -p components/common
mkdir -p components/layout
mkdir -p components/board
mkdir -p components/image
mkdir -p components/auth

mkdir -p composables
mkdir -p layouts
mkdir -p middleware
mkdir -p pages/boards
mkdir -p pages/profile

mkdir -p stores
mkdir -p types
mkdir -p utils

mkdir -p assets/images
mkdir -p assets/styles

# Создание .gitkeep для пустых папок
touch components/common/.gitkeep
touch components/board/.gitkeep
touch components/image/.gitkeep
touch composables/.gitkeep
touch middleware/.gitkeep
touch utils/.gitkeep
touch assets/images/.gitkeep
```

### Итоговая структура

```
frontend/
├── assets/
│   ├── images/
│   └── styles/
│       ├── _variables.scss
│       ├── _mixins.scss
│       ├── _reset.scss
│       └── main.scss
├── components/
│   ├── common/
│   ├── layout/
│   ├── board/
│   ├── image/
│   └── auth/
├── composables/
├── layouts/
├── middleware/
├── pages/
│   ├── boards/
│   └── profile/
├── public/
├── server/
├── stores/
├── types/
├── utils/
├── app.vue
├── nuxt.config.ts
├── package.json
└── tsconfig.json
```

---

## 7. Настройка ESLint и Prettier

### Установка пакетов

```bash
npm install -D @nuxtjs/eslint-config-typescript eslint prettier eslint-config-prettier eslint-plugin-prettier
```

### Создание .eslintrc.js

```javascript
module.exports = {
  root: true,
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:prettier/recommended'
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }]
  }
}
```

### Создание .prettierrc

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "none",
  "printWidth": 80,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### Создание .prettierignore

```
.nuxt
.output
dist
node_modules
.env
.DS_Store
```

### Добавление скриптов в package.json

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "lint": "eslint --ext .ts,.js,.vue .",
    "lint:fix": "eslint --ext .ts,.js,.vue . --fix",
    "format": "prettier --write \"**/*.{ts,js,vue,json,md}\""
  }
}
```

---

## 8. Обновление nuxt.config.ts

### Полная конфигурация на данном этапе

```typescript
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  
  devtools: { enabled: true },
  
  modules: [
    '@pinia/nuxt',
    'nuxt-security'
  ],
  
  // TypeScript настройки
  typescript: {
    strict: true,
    typeCheck: true,
    shim: false
  },
  
  // Pinia настройки
  pinia: {
    storesDirs: ['./stores/**']
  },
  
  // CSS и стили
  css: [
    '@/assets/styles/main.scss'
  ],
  
  // Vite настройки
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "@/assets/styles/_variables.scss";
            @import "@/assets/styles/_mixins.scss";
          `
        }
      }
    }
  },
  
  // Security настройки
  security: {
    headers: {
      crossOriginEmbedderPolicy: 'unsafe-none',
      contentSecurityPolicy: {
        'img-src': ["'self'", 'data:', 'https:'],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"]
      }
    },
    rateLimiter: {
      tokensPerInterval: 150,
      interval: 'hour',
      fireImmediately: false
    }
  },
  
  // App настройки
  app: {
    head: {
      title: 'SnapBoard',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Visual inspiration board for image collections' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  }
})
```

---

## 9. Обновление app.vue

### Базовый корневой компонент

```vue
<template>
  <div id="app">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// Настройка head через useHead
useHead({
  htmlAttrs: {
    lang: 'ru'
  }
})
</script>

<style lang="scss">
#app {
  min-height: 100vh;
}
</style>
```

---

## 10. Создание тестовой страницы

### pages/index.vue

```vue
<template>
  <div class="home">
    <div class="container">
      <h1 class="title">Welcome to SnapBoard</h1>
      <p class="subtitle">Visual inspiration board</p>
      
      <div class="counter-demo">
        <h2>Pinia Test</h2>
        <p>Count: {{ counterStore.count }}</p>
        <p>Double: {{ counterStore.doubleCount }}</p>
        <div class="buttons">
          <button @click="counterStore.increment" class="btn">+</button>
          <button @click="counterStore.decrement" class="btn">-</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const counterStore = useCounterStore()
</script>

<style lang="scss" scoped>
.home {
  padding: $spacing-xl 0;
  text-align: center;
}

.title {
  font-size: 3rem;
  font-weight: 700;
  color: $primary-color;
  margin-bottom: $spacing-md;
}

.subtitle {
  font-size: 1.25rem;
  color: $text-light;
  margin-bottom: $spacing-xl;
}

.counter-demo {
  margin-top: $spacing-xl;
  padding: $spacing-lg;
  background: white;
  border-radius: $radius-md;
  box-shadow: $shadow-md;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  
  h2 {
    margin-bottom: $spacing-md;
  }
  
  p {
    margin-bottom: $spacing-sm;
    font-size: 1.125rem;
  }
}

.buttons {
  display: flex;
  gap: $spacing-sm;
  justify-content: center;
  margin-top: $spacing-md;
}

.btn {
  padding: $spacing-sm $spacing-lg;
  background: $primary-color;
  color: white;
  border-radius: $radius-sm;
  font-weight: 600;
  @include transition(background-color);
  
  &:hover {
    background: darken($primary-color, 10%);
  }
}
</style>
```

---

## 11. Проверка работы

### Запуск dev сервера

```bash
npm run dev
```

Приложение должно запуститься на `http://localhost:3000`

### Чеклист проверки

- [ ] Страница открывается без ошибок
- [ ] Стили применяются корректно
- [ ] Pinia работает (кнопки + и - изменяют счетчик)
- [ ] TypeScript не выдает ошибок
- [ ] Hot reload работает при изменении файлов

### Команды линтинга

```bash
# Проверка кода
npm run lint

# Автоисправление
npm run lint:fix

# Форматирование
npm run format
```

---

## 12. Создание .gitignore (если не создан)

```
# Nuxt
.nuxt
.output
.env

# Dependencies
node_modules

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode
.idea
*.swp
*.swo
*~

# Testing
coverage

# Build
dist
```

---

## 🎯 Итоги Этапа 1

### Что мы настроили:

✅ Nuxt 4 проект с TypeScript  
✅ Pinia для state management  
✅ SASS с переменными и миксинами  
✅ nuxt-security для безопасности  
✅ Полная структура папок проекта  
✅ ESLint и Prettier для качества кода  
✅ Базовые стили и reset CSS  

### Следующий этап:

**Этап 2: Система дизайна и UI компоненты**
- Создание переиспользуемых компонентов (Button, Input, Card, Modal)
- Настройка иконок
- Система цветов и типографики
- Адаптивная сетка

---

## 📚 Полезные ссылки

- [Nuxt 4 Documentation](https://nuxt.com/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [SASS Guide](https://sass-lang.com/guide)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)

---

**Готовы к следующему этапу? Переходите к созданию UI компонентов!** 🚀