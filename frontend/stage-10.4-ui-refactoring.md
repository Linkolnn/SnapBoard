# Этап 10.4: Рефакторинг UI компонентов SnapBoard

## 🎯 Цель этапа
Унифицировать использование базовых UI компонентов из папки `common/`, убрать дублирование кода, устранить антипаттерны и улучшить консистентность кодовой базы.

---

## 📊 Анализ текущего состояния

### Базовые UI компоненты в `common/`

| Компонент | Описание | API |
|-----------|----------|-----|
| `BaseButton` | Кнопка с вариантами primary/secondary/outline | `variant`, `disabled`, `loading` |
| `BaseInput` | Поле ввода с label, error, hint | `modelValue`, `type`, `label`, `placeholder`, `error`, `hint`, `disabled`, `required` |
| `BaseModal` | Модальное окно с header/body/footer | `modelValue`, `title`, slots: default, footer |
| `BaseCard` | Карточка с hover эффектом | `clickable` |
| `BaseLoader` | Спиннер загрузки | `size`: small/medium/large |
| `ConfirmModal` | Модал подтверждения действия | `isOpen`, `title`, `message`, `confirmText`, `cancelText`, `type`, `isLoading` |

---

## 🔍 Найденные проблемы

### 1. Дублирование кнопок (НЕ используют BaseButton)

| Файл | Проблема |
|------|----------|
| `board/Form.vue` | Собственные стили `.board-form__btn--primary/secondary` |
| `image/EditForm.vue` | Собственные стили `.image-edit-form__btn--primary/secondary` |
| `image/Actions.vue` | Собственные стили `.image-actions__btn` |
| `upload/UploadModal.vue` | Собственные стили `.upload-modal__btn--primary/secondary` |
| `upload/UrlInput.vue` | Собственная кнопка `.url-input__btn` |
| `search/TagFilter.vue` | Кнопки тегов со своими стилями |
| `search/SortSelect.vue` | Кнопка триггера со своими стилями |
| `image/FullscreenModal.vue` | Кнопки действий `.fullscreen-modal__btn` |
| `image/Modal.vue` | Кнопки навигации со своими стилями |

### 2. Дублирование инпутов (НЕ используют BaseInput)

| Файл | Проблема |
|------|----------|
| `board/Form.vue` | Собственные `.board-form__input`, `.board-form__textarea` |
| `image/EditForm.vue` | Собственные `.image-edit-form__input`, `.image-edit-form__textarea` |
| `upload/UrlInput.vue` | Собственный `.url-input__input` |
| `upload/QueueItem.vue` | Собственный `.queue-item__title-input` |
| `search/Input.vue` | Собственный `.search-input__field` |
| `layout/Header.vue` | Собственный `.app-header__search-inp` |

### 3. Дублирование модальных окон (НЕ используют BaseModal)

| Файл | Проблема |
|------|----------|
| `upload/UploadModal.vue` | Полностью своя реализация модала |
| `image/Modal.vue` | Полностью своя реализация модала |
| `image/FullscreenModal.vue` | Полностью своя реализация (специфичный кейс) |

### 4. Дублирование спиннеров (НЕ используют BaseLoader)

| Файл | Проблема |
|------|----------|
| `board/Form.vue` | `.board-form__spinner` |
| `image/EditForm.vue` | `.image-edit-form__spinner` |
| `upload/UploadModal.vue` | `.upload-modal__spinner` |
| `upload/UrlInput.vue` | `.url-input__spinner` |
| `search/Input.vue` | `.search-input__loader` |
| `common/ConfirmModal.vue` | `.confirm-modal__spinner` |

### 5. Дублирование TagInput

| Файл | Проблема |
|------|----------|
| `image/TagInput.vue` | Компонент для тегов в image |
| `search/TagFilter.vue` | Похожий функционал для фильтрации |

### 6. Антипаттерны

| Проблема | Файлы |
|----------|-------|
| Inline стили для одинаковых элементов | Все вышеперечисленные |
| Дублирование @keyframes spin | 6+ файлов |
| Несогласованные размеры/отступы | Кнопки, инпуты |
| Отсутствие переиспользования | Модальные окна |

---

## 📋 Чеклист рефакторинга

### Фаза 1: Расширение базовых компонентов

- [x] **1.1** Добавить в `BaseButton` варианты `danger`, `ghost`
- [x] **1.2** Добавить в `BaseButton` размеры `sm`, `md`, `lg`
- [x] **1.3** Добавить в `BaseButton` prop `fullWidth`
- [x] **1.4** Создать `BaseTextarea` компонент
- [x] **1.5** Добавить в `BaseInput` слот для правой иконки/кнопки (action slot)
- [x] **1.6** Создать `BaseIconButton` для круглых кнопок-иконок

### Фаза 2: Рефакторинг форм

- [x] **2.1** `board/Form.vue` → использовать `BaseInput`, `BaseTextarea`, `BaseButton`
- [x] **2.2** `image/EditForm.vue` → использовать `BaseInput`, `BaseTextarea`, `BaseButton`
- [x] **2.3** Убрать дублирующие стили кнопок и инпутов

### Фаза 3: Рефакторинг модальных окон

- [x] **3.1** `upload/UploadModal.vue` → использовать `BaseModal` как основу (оставлена своя структура из-за табов)
- [x] **3.2** Заменить кнопки на `BaseButton`
- [x] **3.3** Заменить спиннеры на `BaseLoader` (используется loading prop в BaseButton)

### Фаза 4: Рефакторинг upload компонентов

- [x] **4.1** `upload/UrlInput.vue` → использовать `BaseInput`, `BaseButton`
- [x] **4.2** `upload/QueueItem.vue` → использовать `BaseIconButton`

### Фаза 5: Рефакторинг search компонентов

- [x] **5.1** `search/Input.vue` → использовать `BaseIconButton`, `BaseLoader`, `BaseButton`
- [x] **5.2** `search/SortSelect.vue` → использовать `BaseButton`
- [x] **5.3** `search/TagFilter.vue` → использовать `BaseButton`

### Фаза 6: Рефакторинг image компонентов

- [x] **6.1** `image/Actions.vue` → использовать `BaseButton`
- [x] **6.2** `image/Modal.vue` → использовать `BaseIconButton`
- [x] **6.3** `image/FullscreenModal.vue` → использовать `BaseIconButton`, `BaseLoader`

### Фаза 7: Рефакторинг layout компонентов

- [x] **7.1** `layout/Header.vue` → использовать `BaseIconButton`, `BaseButton` для поиска
- [x] **7.2** Унифицировать dropdown стили (оставлены как есть - специфичные для каждого компонента)

### Фаза 8: Очистка и оптимизация

- [x] **8.1** Удалить дублирующие @keyframes spin из всех файлов
- [x] **8.2** Создать `assets/styles/_animations.sass` с общими анимациями
- [x] **8.3** Проверить консистентность переменных
- [x] **8.4** Создать `common/BaseTagInput.vue` (объединить `image/TagInput` + `search/TagFilter`)
- [x] **8.5** Обновить `image/EditForm.vue` использовать `BaseTagInput`
- [x] **8.6** Обновить `search/SearchPanel.vue` использовать `BaseTagInput`
- [x] **8.7** Удалить `image/TagInput.vue` (заменён на `BaseTagInput`)
- [x] **8.8** Удалить `search/TagFilter.vue` (заменён на `BaseTagInput`)
- [x] **8.9** Рефакторинг `common/ConfirmModal.vue` → использовать `BaseButton`

---

## �️ Ктомпоненты для удаления/объединения

### Анализ избыточных компонентов

После анализа кодовой базы выявлены компоненты, которые можно удалить или объединить для сокращения размера проекта:

| Компонент | Действие | Причина |
|-----------|----------|---------|
| `image/Skeleton.vue` | ❌ Удалить | Можно заменить на `BaseLoader` или CSS-анимацию в `BaseCard` |
| `search/SearchPanel.vue` | ⚠️ Упростить | Это просто обёртка над другими компонентами, можно встроить логику в страницу |

### Компоненты для объединения

| Компоненты | Действие | Результат |
|------------|----------|-----------|
| `image/TagInput.vue` + `search/TagFilter.vue` | 🔄 Объединить | Создать универсальный `common/BaseTagInput.vue` |
| `image/Modal.vue` + `image/FullscreenModal.vue` | 🔄 Рассмотреть | Возможно объединить в один компонент с режимами |

### Компоненты, которые уже используют Base* (✅ OK)

| Компонент | Использует |
|-----------|------------|
| `auth/LoginForm.vue` | `BaseInput`, `BaseButton` |
| `auth/RegisterForm.vue` | `BaseInput`, `BaseButton` |
| `board/Form.vue` | `BaseInput`, `BaseTextarea`, `BaseButton` |
| `image/EditForm.vue` | `BaseInput`, `BaseTextarea`, `BaseButton` |
| `layout/Header.vue` | `BaseButton` |
| `layout/MobileMenu.vue` | `BaseButton` |

### Компоненты, требующие рефакторинга

| Компонент | Проблема | Решение |
|-----------|----------|---------|
| `upload/UploadModal.vue` | Своя реализация модала, кнопок, спиннера | Использовать `BaseModal`, `BaseButton`, `BaseLoader` |
| `upload/UrlInput.vue` | Свой input, кнопка, спиннер | Использовать `BaseInput` с action slot, `BaseButton` |
| `upload/QueueItem.vue` | Свой input для названия | Использовать `BaseInput` |
| `search/Input.vue` | Свой input, спиннер | Использовать `BaseInput` с кастомизацией |
| `search/SortSelect.vue` | Своя кнопка-триггер | Использовать `BaseButton` variant="ghost" |
| `image/Actions.vue` | Свои кнопки | Использовать `BaseButton` |
| `image/Modal.vue` | Своя реализация модала, кнопки навигации | Частично использовать `BaseModal`, `BaseIconButton` |
| `image/FullscreenModal.vue` | Свои кнопки действий | Использовать `BaseButton`, `BaseIconButton` |
| `layout/Header.vue` | Свой search input | Использовать `BaseInput` или `search/Input.vue` |
| `common/ConfirmModal.vue` | Свой спиннер, кнопки | Использовать `BaseLoader`, `BaseButton` |

---

## 📊 Статистика дублирования

### @keyframes spin (дублируется в 6+ файлах)
- `common/BaseButton.vue` ✅ (основной)
- `common/BaseLoader.vue` ✅ (основной)
- `common/ConfirmModal.vue` ✅ удалён
- `upload/UploadModal.vue` ✅ удалён
- `upload/UrlInput.vue` ✅ удалён
- `search/Input.vue` ✅ удалён

### Дублирование стилей кнопок
- Минимум 9 файлов имеют собственные стили для кнопок
- После рефакторинга: только `BaseButton.vue` и `BaseIconButton.vue`

### Дублирование стилей инпутов
- Минимум 6 файлов имеют собственные стили для полей ввода
- После рефакторинга: только `BaseInput.vue` и `BaseTextarea.vue`

---

## 🔧 Детальный план изменений

### 1. Расширение BaseButton

```vue
<!-- Новые props -->
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  icon?: boolean  // для круглых кнопок-иконок
}
```

### 2. Создание BaseTextarea

```vue
<template>
  <article class="base-textarea">
    <label v-if="label" class="base-textarea__label">
      {{ label }}
      <span v-if="required" class="base-textarea__required">*</span>
    </label>
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      :maxlength="maxlength"
      :class="['base-textarea__field', {'base-textarea__field--error': error}]"
      @input="handleInput"
      @blur="$emit('blur')"
    />
    <p v-if="error" class="base-textarea__error">{{ error }}</p>
    <p v-if="hint && !error" class="base-textarea__hint">{{ hint }}</p>
  </article>
</template>
```

### 3. Создание BaseIconButton

```vue
<template>
  <button
    :class="['icon-btn', `icon-btn--${variant}`, `icon-btn--${size}`]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'primary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}
</script>
```

### 4. Создание BaseTagInput (объединение image/TagInput + search/TagFilter)

```vue
<template>
  <div class="base-tag-input">
    <label v-if="label" class="base-tag-input__label">{{ label }}</label>
    
    <div class="base-tag-input__container">
      <!-- Режим редактирования (editable) -->
      <template v-if="editable">
        <span 
          v-for="(tag, index) in modelValue" 
          :key="index"
          class="base-tag-input__tag base-tag-input__tag--editable"
        >
          {{ tag }}
          <button type="button" @click="removeTag(index)">✕</button>
        </span>
        
        <input
          v-if="modelValue.length < maxTags"
          v-model="newTag"
          type="text"
          :placeholder="placeholder"
          @keydown.enter.prevent="addTag"
          @keydown.comma.prevent="addTag"
        />
      </template>
      
      <!-- Режим фильтрации (selectable) -->
      <template v-else>
        <button
          v-for="tag in displayedTags"
          :key="tag"
          class="base-tag-input__tag"
          :class="{ 'base-tag-input__tag--active': selectedTags.includes(tag) }"
          @click="toggleTag(tag)"
        >
          #{{ tag }}
        </button>
        
        <button v-if="hasMoreTags" @click="showAll = !showAll">
          {{ showAll ? 'Свернуть' : `+${hiddenCount} ещё` }}
        </button>
      </template>
    </div>
    
    <p v-if="hint" class="base-tag-input__hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  // Общие
  label?: string
  hint?: string
  disabled?: boolean
  
  // Для editable режима
  modelValue?: string[]
  editable?: boolean
  placeholder?: string
  maxTags?: number
  
  // Для selectable режима
  tags?: string[]
  selectedTags?: string[]
  maxVisible?: number
}
</script>
```

**Использование:**
```vue
<!-- Режим редактирования (как в image/TagInput) -->
<BaseTagInput
  v-model="imageTags"
  label="Теги"
  editable
  placeholder="Добавить тег..."
/>

<!-- Режим фильтрации (как в search/TagFilter) -->
<BaseTagInput
  :tags="availableTags"
  :selected-tags="selectedTags"
  label="Фильтр по тегам"
  @toggle="handleToggle"
/>
```

---

## 📁 Файлы для изменения

### Новые файлы
| Файл | Описание |
|------|----------|
| `components/common/BaseTextarea.vue` | ✅ Создан - Компонент textarea |
| `components/common/BaseIconButton.vue` | ✅ Создан - Круглая кнопка-иконка |
| `components/common/BaseTagInput.vue` | 🆕 Создать - Универсальный компонент тегов |
| `assets/styles/_animations.sass` | 🆕 Создать - Общие анимации |

### Файлы для удаления (после рефакторинга)
| Файл | Причина |
|------|---------|
| `components/image/TagInput.vue` | Заменён на `BaseTagInput` |
| `components/search/TagFilter.vue` | Заменён на `BaseTagInput` |

### Изменяемые файлы
| Файл | Изменения |
|------|-----------|
| `components/common/BaseButton.vue` | ✅ Готов - варианты, размеры |
| `components/common/BaseInput.vue` | ✅ Готов - слот для action |
| `components/common/ConfirmModal.vue` | Использовать `BaseButton`, `BaseLoader` |
| `components/board/Form.vue` | ✅ Готов - использует Base* компоненты |
| `components/image/EditForm.vue` | ✅ Готов - использует Base* компоненты, обновить на `BaseTagInput` |
| `components/image/Actions.vue` | Использовать `BaseButton` |
| `components/image/Modal.vue` | Использовать `BaseModal`, `BaseIconButton` |
| `components/image/FullscreenModal.vue` | Использовать `BaseButton`, `BaseIconButton` |
| `components/upload/UploadModal.vue` | Использовать `BaseModal`, `BaseButton`, `BaseLoader` |
| `components/upload/UrlInput.vue` | Использовать `BaseInput`, `BaseButton` |
| `components/upload/QueueItem.vue` | Использовать `BaseInput` |
| `components/search/Input.vue` | Рефакторинг с `BaseInput`, `BaseLoader` |
| `components/search/SortSelect.vue` | Использовать `BaseButton` |
| `components/search/SearchPanel.vue` | Использовать `BaseTagInput` |
| `components/layout/Header.vue` | Использовать `BaseInput` для поиска |

---

## ✅ Критерии завершения

1. ✅ Все формы используют `BaseInput`, `BaseTextarea`, `BaseButton`
2. ✅ Все модальные окна используют `BaseModal` как основу (где применимо)
3. ✅ Все спиннеры заменены на `BaseLoader`
4. ✅ Нет дублирования @keyframes spin
5. ✅ Консистентные размеры и отступы во всех компонентах
6. ✅ Нет inline стилей для базовых элементов
7. ✅ Код проходит TypeScript проверку
8. ✅ Визуально всё работает как раньше

### 🧪 Тестирование (29.12.2025)
- ✅ Главная страница загружается без ошибок
- ✅ FullscreenModal открывается и работает (кнопки навигации, избранное, share)
- ✅ Поиск работает (Input с кнопкой очистки, история, dropdown)
- ✅ Консоль браузера без ошибок компонентов
- ✅ Все Base* компоненты используют префикс `Common` (Nuxt auto-import)

---

## 🚀 Порядок выполнения

1. **Фаза 1** - Расширяем базовые компоненты (не ломаем существующий код)
2. **Фаза 2-3** - Рефакторим формы и модалы (основной объём работы)
3. **Фаза 4-7** - Рефакторим остальные компоненты
4. **Фаза 8** - Финальная очистка и проверка

---

## ⚠️ Важные замечания

- `FullscreenModal` - специфичный компонент, может остаться со своими стилями
- `search/Input.vue` - имеет сложную логику dropdown, рефакторить аккуратно
- При рефакторинге сохранять существующее поведение и внешний вид
- Тестировать каждый компонент после изменений

---

## 📈 Ожидаемый результат

### До рефакторинга
- **Компоненты с дублированием**: ~15 файлов
- **Дублирование @keyframes spin**: 6+ файлов
- **Собственные стили кнопок**: 9+ файлов
- **Собственные стили инпутов**: 6+ файлов

### После рефакторинга
- **Базовые UI компоненты**: 8 файлов в `common/`
  - `BaseButton.vue`
  - `BaseIconButton.vue`
  - `BaseInput.vue`
  - `BaseTextarea.vue`
  - `BaseModal.vue`
  - `BaseCard.vue`
  - `BaseLoader.vue`
  - `ConfirmModal.vue`
- **@keyframes spin**: только в `_animations.sass`
- **Консистентные стили**: все компоненты используют Base* компоненты
- **Уменьшение кода**: ~30-40% меньше CSS дублирования

### Преимущества
1. ✅ Единый источник правды для UI компонентов
2. ✅ Легче поддерживать и обновлять стили
3. ✅ Консистентный внешний вид приложения
4. ✅ Меньше кода = меньше багов
5. ✅ Проще добавлять новые фичи
