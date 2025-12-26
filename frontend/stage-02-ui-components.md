# Этап 2: UI компоненты и дизайн-система SnapBoard

## 🎯 Цель этапа
Создать базовые переиспользуемые UI компоненты с минималистичным дизайном. Все компоненты будут адаптивными и готовыми к использованию в тёмной/светлой теме.

---

## 📋 Чеклист этапа
- [ ] Расширить SASS переменные для компонентов
- [ ] Создать компонент Button
- [ ] Создать компонент Input
- [ ] Создать компонент Card
- [ ] Создать компонент Modal
- [ ] Создать компонент Loader
- [ ] Создать базовый Layout

---

## 1️⃣ Дополнение переменных SASS

Добавьте в файл `assets/styles/_variables.sass` дополнительные переменные:

```sass
// Colors - основные цвета
$primary-color: #00dc82
$secondary-color: #111111
$background-light: #ffffff
$background-dark: #1a1a1a
$text-light: #333333
$text-dark: #ffffff

// Дополнительные цвета для состояний
$error-color: #ff4444
$success-color: #00dc82
$warning-color: #ffaa00
$info-color: #0099ff

// Оттенки серого для границ и фонов
$gray-100: #f5f5f5
$gray-200: #eeeeee
$gray-300: #dddddd
$gray-400: #999999
$gray-500: #666666

// Spacing
$spacing-unit: 8px

// Радиусы
$radius: 20px
$radius-sm: 8px
$radius-lg: 24px

// Тени
$shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1)
$shadow-md: 0 4px 8px rgba(0, 0, 0, 0.15)
$shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.2)

// Transitions
$transition-fast: 0.2s ease
$transition-normal: 0.3s ease

// Breakpoints
$breakpoint-desktop: 1440px
$breakpoint-laptop: 1024px
$breakpoint-tablet: 768px
$breakpoint-mobile: 576px

// Z-index layers
$z-index-dropdown: 10
$z-index-modal: 20
$z-index-tooltip: 30
```

**Объяснение:**
- Добавлены цвета для ошибок, успеха, предупреждений
- Градации серого для фонов и границ
- Разные размеры радиусов и теней
- Переменные для анимаций

---

## 2️⃣ Компонент Button

### Файл: `components/common/BaseButton.vue`

```vue
<template>
  <!-- 
    Базовый компонент кнопки
    - Поддерживает разные варианты (primary, secondary, outline)
    - Может быть заблокирован (disabled)
    - Поддерживает состояние загрузки (loading)
  -->
  <button
    :class="['base-button', `base-button--${variant}`, { 'base-button--loading': loading }]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <!-- Иконка загрузки - показывается только когда loading=true -->
    <span v-if="loading" class="base-button__spinner"></span>
    
    <!-- Слот для содержимого кнопки (текст, иконки и т.д.) -->
    <span v-if="!loading" class="base-button__content">
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
/**
 * Пропсы компонента
 * variant - внешний вид кнопки (primary/secondary/outline)
 * disabled - блокирует кнопку
 * loading - показывает спиннер загрузки
 */
interface Props {
  variant?: 'primary' | 'secondary' | 'outline'
  disabled?: boolean
  loading?: boolean
}

// Устанавливаем значения по умолчанию
withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false,
  loading: false,
})

// Эмиты - события, которые компонент может отправлять родителю
const emit = defineEmits<{
  click: [] // событие клика
}>()

/**
 * Обработчик клика
 * Отправляет событие click родительскому компоненту
 */
const handleClick = () => {
  emit('click')
}
</script>

<style lang="sass" scoped>
// Импортируем переменные для использования в стилях
@import '@/assets/styles/variables'

// Базовые стили кнопки
.base-button
  // Позиционирование и размеры
  position: relative
  display: inline-flex
  align-items: center
  justify-content: center
  padding: $spacing-unit * 1.5 $spacing-unit * 3 // 12px 24px
  min-width: 120px
  
  // Типографика
  font-size: 16px
  font-weight: 600
  line-height: 1.5
  
  // Внешний вид
  border-radius: $radius-sm
  border: 2px solid transparent
  cursor: pointer
  transition: all $transition-normal
  
  // Убираем outline для доступности, но можно вернуть при необходимости
  &:focus
    outline: none
    box-shadow: 0 0 0 3px rgba(0, 220, 130, 0.2)
  
  // Состояние disabled - делаем кнопку полупрозрачной и убираем курсор
  &:disabled
    opacity: 0.5
    cursor: not-allowed
  
  // Состояние loading - также отключаем взаимодействие
  &--loading
    cursor: wait

  // ВАРИАНТ: Primary (основная зелёная кнопка)
  &--primary
    background: $primary-color
    color: white
    
    &:hover:not(:disabled)
      // При наведении делаем чуть темнее
      background: darken($primary-color, 10%)
      transform: translateY(-2px) // Небольшой подъём
      box-shadow: $shadow-md
    
    &:active:not(:disabled)
      // При нажатии возвращаем на место
      transform: translateY(0)

  // ВАРИАНТ: Secondary (тёмная кнопка)
  &--secondary
    background: $secondary-color
    color: white
    
    &:hover:not(:disabled)
      background: lighten($secondary-color, 10%)
      transform: translateY(-2px)
      box-shadow: $shadow-md
    
    &:active:not(:disabled)
      transform: translateY(0)

  // ВАРИАНТ: Outline (прозрачная с рамкой)
  &--outline
    background: transparent
    color: $primary-color
    border-color: $primary-color
    
    &:hover:not(:disabled)
      // При наведении заливаем фон
      background: $primary-color
      color: white
      transform: translateY(-2px)
      box-shadow: $shadow-md
    
    &:active:not(:disabled)
      transform: translateY(0)

  // Контент внутри кнопки
  &__content
    display: flex
    align-items: center
    gap: $spacing-unit

  // Спиннер загрузки - простая вращающаяся окружность
  &__spinner
    width: 20px
    height: 20px
    border: 2px solid rgba(255, 255, 255, 0.3)
    border-top-color: white
    border-radius: 50%
    // Бесконечная анимация вращения
    animation: spin 0.6s linear infinite

// Определяем анимацию вращения
@keyframes spin
  to
    transform: rotate(360deg)
</style>
```

---

## 3️⃣ Компонент Input

### Файл: `components/common/BaseInput.vue`

```vue
<template>
  <!-- 
    Базовый компонент поля ввода
    - Поддерживает label (подпись)
    - Показывает сообщения об ошибках
    - Различные типы input (text, email, password и т.д.)
  -->
  <div class="base-input">
    <!-- Label - если передан prop label -->
    <label v-if="label" :for="inputId" class="base-input__label">
      {{ label }}
      <!-- Звёздочка для обязательных полей -->
      <span v-if="required" class="base-input__required">*</span>
    </label>
    
    <div class="base-input__wrapper">
      <!-- Само поле ввода -->
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="['base-input__field', { 'base-input__field--error': error }]"
        @input="handleInput"
        @blur="handleBlur"
      />
      
      <!-- Иконка - если передана через слот -->
      <div v-if="$slots.icon" class="base-input__icon">
        <slot name="icon"></slot>
      </div>
    </div>
    
    <!-- Сообщение об ошибке -->
    <span v-if="error" class="base-input__error">{{ error }}</span>
    
    <!-- Подсказка под полем -->
    <span v-if="hint && !error" class="base-input__hint">{{ hint }}</span>
  </div>
</template>

<script setup lang="ts">
/**
 * Генерируем уникальный ID для связи label и input
 * Math.random() создаёт случайное число, toString(36) конвертирует в строку
 */
const inputId = `input-${Math.random().toString(36).substr(2, 9)}`

/**
 * Пропсы компонента
 */
interface Props {
  modelValue: string | number // v-model значение
  type?: string               // тип input (text, email, password и т.д.)
  label?: string              // подпись над полем
  placeholder?: string        // placeholder текст
  error?: string              // сообщение об ошибке
  hint?: string               // подсказка
  disabled?: boolean          // блокировка поля
  required?: boolean          // обязательное поле (показывает *)
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  label: '',
  placeholder: '',
  error: '',
  hint: '',
  disabled: false,
  required: false,
})

// Эмиты для v-model и событий
const emit = defineEmits<{
  'update:modelValue': [value: string] // для работы v-model
  blur: []                              // событие потери фокуса
}>()

/**
 * Обработчик ввода текста
 * Обновляет v-model значение в родительском компоненте
 */
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

/**
 * Обработчик потери фокуса
 * Используется для валидации после завершения ввода
 */
const handleBlur = () => {
  emit('blur')
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.base-input
  // Отступ между полями ввода
  margin-bottom: $spacing-unit * 2

  // Label над полем
  &__label
    display: block
    margin-bottom: $spacing-unit
    font-size: 14px
    font-weight: 600
    color: $text-light
  
  // Звёздочка для обязательных полей
  &__required
    color: $error-color
    margin-left: 4px

  // Обёртка для input и иконки
  &__wrapper
    position: relative
    display: flex
    align-items: center

  // Само поле ввода
  &__field
    width: 100%
    padding: $spacing-unit * 1.5 $spacing-unit * 2
    font-size: 16px
    border: 2px solid $gray-300
    border-radius: $radius-sm
    background: white
    transition: all $transition-normal
    
    // Placeholder стили
    &::placeholder
      color: $gray-400
    
    // Фокус - подсвечиваем зелёным
    &:focus
      outline: none
      border-color: $primary-color
      box-shadow: 0 0 0 3px rgba(0, 220, 130, 0.1)
    
    // Если есть ошибка - красная рамка
    &--error
      border-color: $error-color
      
      &:focus
        box-shadow: 0 0 0 3px rgba(255, 68, 68, 0.1)
    
    // Заблокированное поле
    &:disabled
      background: $gray-100
      cursor: not-allowed
      opacity: 0.6

  // Иконка внутри поля (например, поиск или глаз для пароля)
  &__icon
    position: absolute
    right: $spacing-unit * 2
    display: flex
    align-items: center
    color: $gray-400
    pointer-events: none // иконка не перехватывает клики

  // Сообщение об ошибке под полем
  &__error
    display: block
    margin-top: $spacing-unit
    font-size: 14px
    color: $error-color

  // Подсказка под полем
  &__hint
    display: block
    margin-top: $spacing-unit
    font-size: 14px
    color: $gray-400
</style>
```

---

## 4️⃣ Компонент Card

### Файл: `components/common/BaseCard.vue`

```vue
<template>
  <!-- 
    Базовая карточка - контейнер для контента
    - Может быть кликабельной (clickable)
    - Поддерживает hover эффекты
    - Используется для изображений, досок и т.д.
  -->
  <div
    :class="['base-card', { 'base-card--clickable': clickable }]"
    @click="handleClick"
  >
    <!-- Слот для содержимого карточки -->
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
/**
 * Пропсы компонента
 */
interface Props {
  clickable?: boolean // делает карточку кликабельной с hover эффектами
}

withDefaults(defineProps<Props>(), {
  clickable: false,
})

const emit = defineEmits<{
  click: [] // событие клика по карточке
}>()

/**
 * Обработчик клика
 * Срабатывает только если карточка кликабельная
 */
const handleClick = () => {
  emit('click')
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.base-card
  // Внешний вид
  background: white
  border-radius: $radius
  box-shadow: $shadow-sm
  overflow: hidden // чтобы контент не выходил за скруглённые углы
  transition: all $transition-normal
  
  // Кликабельная карточка
  &--clickable
    cursor: pointer
    
    // При наведении поднимаем и увеличиваем тень
    &:hover
      transform: translateY(-4px)
      box-shadow: $shadow-lg
    
    // При клике возвращаем на место
    &:active
      transform: translateY(-2px)
      box-shadow: $shadow-md
</style>
```

---

## 5️⃣ Компонент Modal

### Файл: `components/common/BaseModal.vue`

```vue
<template>
  <!-- 
    Модальное окно
    - Открывается/закрывается через prop modelValue
    - Блокирует прокрутку body когда открыто
    - Закрывается по клику на overlay или кнопку закрытия
  -->
  <Teleport to="body">
    <!-- Transition для плавной анимации появления/исчезновения -->
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
        <!-- Само модальное окно -->
        <div class="modal" @click.stop>
          <!-- Заголовок и кнопка закрытия -->
          <div class="modal__header">
            <h2 class="modal__title">{{ title }}</h2>
            <button class="modal__close" @click="close">
              <!-- SVG иконка крестика -->
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          
          <!-- Контент модального окна -->
          <div class="modal__body">
            <slot></slot>
          </div>
          
          <!-- Footer с кнопками действий (опционально) -->
          <div v-if="$slots.footer" class="modal__footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'

/**
 * Пропсы компонента
 */
interface Props {
  modelValue: boolean // управляет открытием/закрытием модального окна
  title?: string      // заголовок модального окна
}

withDefaults(defineProps<Props>(), {
  title: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean] // для работы v-model
}>()

/**
 * Закрывает модальное окно
 */
const close = () => {
  emit('update:modelValue', false)
}

/**
 * Закрытие по клику на затемнённую область (overlay)
 */
const handleOverlayClick = () => {
  close()
}

/**
 * Блокируем прокрутку body когда модалка открыта
 * Наблюдаем за изменением modelValue
 */
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      // Блокируем прокрутку
      document.body.style.overflow = 'hidden'
    } else {
      // Возвращаем прокрутку
      document.body.style.overflow = ''
    }
  }
)
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

// Затемнённый фон на весь экран
.modal-overlay
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  background: rgba(0, 0, 0, 0.6) // полупрозрачный чёрный
  display: flex
  align-items: center
  justify-content: center
  z-index: $z-index-modal
  padding: $spacing-unit * 2

// Само модальное окно
.modal
  background: white
  border-radius: $radius
  max-width: 600px
  width: 100%
  max-height: 90vh // не больше 90% высоты экрана
  overflow-y: auto // прокрутка если контент большой
  box-shadow: $shadow-lg
  
  // На мобильных занимает почти весь экран
  @include mobile
    max-width: 95%
    max-height: 95vh

  // Шапка модального окна
  &__header
    display: flex
    align-items: center
    justify-content: space-between
    padding: $spacing-unit * 3
    border-bottom: 1px solid $gray-200

  &__title
    font-size: 24px
    font-weight: 700
    color: $text-light

  // Кнопка закрытия (крестик)
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

  // Контент модального окна
  &__body
    padding: $spacing-unit * 3

  // Footer с кнопками
  &__footer
    padding: $spacing-unit * 3
    border-top: 1px solid $gray-200
    display: flex
    gap: $spacing-unit * 2
    justify-content: flex-end

// Анимации появления/исчезновения модального окна
.modal-enter-active,
.modal-leave-active
  transition: opacity $transition-normal

.modal-enter-from,
.modal-leave-to
  opacity: 0

// Анимация самого окна (масштабирование)
.modal-enter-active .modal,
.modal-leave-active .modal
  transition: transform $transition-normal

.modal-enter-from .modal,
.modal-leave-to .modal
  transform: scale(0.95)
</style>
```

---

## 6️⃣ Компонент Loader (Спиннер)

### Файл: `components/common/BaseLoader.vue`

```vue
<template>
  <!-- 
    Компонент загрузки (спиннер)
    - Показывает индикатор загрузки
    - Может быть разных размеров
  -->
  <div :class="['base-loader', `base-loader--${size}`]">
    <div class="base-loader__spinner"></div>
  </div>
</template>

<script setup lang="ts">
/**
 * Пропсы компонента
 */
interface Props {
  size?: 'small' | 'medium' | 'large' // размер спиннера
}

withDefaults(defineProps<Props>(), {
  size: 'medium',
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.base-loader
  display: flex
  align-items: center
  justify-content: center
  
  // Сам спиннер - вращающийся круг
  &__spinner
    border-radius: 50%
    border: 3px solid $gray-200
    border-top-color: $primary-color
    animation: spin 0.8s linear infinite
  
  // Размеры спиннера
  &--small &__spinner
    width: 20px
    height: 20px
    border-width: 2px
  
  &--medium &__spinner
    width: 40px
    height: 40px
    border-width: 3px
  
  &--large &__spinner
    width: 60px
    height: 60px
    border-width: 4px

// Анимация вращения
@keyframes spin
  to
    transform: rotate(360deg)
</style>
```

---

## 7️⃣ Базовый Layout

### Файл: `layouts/default.vue`

```vue
<template>
  <!-- 
    Базовый layout приложения
    - Используется на всех страницах по умолчанию
    - Включает Header, основной контент и Footer
  -->
  <div class="layout">
    <!-- Header - будет создан в следующих этапах -->
    <header class="layout__header">
      <div class="layout__container">
        <h1>SnapBoard</h1>
        <!-- Здесь будет навигация -->
      </div>
    </header>
    
    <!-- Основной контент страницы -->
    <main class="layout__main">
      <div class="layout__container">
        <!-- slot - сюда вставляется содержимое страницы -->
        <slot />
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="layout__footer">
      <div class="layout__container">
        <p>&copy; 2024 SnapBoard. Visual Inspiration Board</p>
      </div>
    </footer>
  </div>
</template>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.layout
  // Layout на всю высоту экрана
  min-height: 100vh
  display: flex
  flex-direction: column
  background: $gray-100

  // Контейнер для ограничения ширины контента
  &__container
    max-width: $breakpoint-desktop
    width: 100%
    margin: 0 auto
    padding: 0 $spacing-unit * 3
    
    // На мобильных уменьшаем отступы
    @include mobile
      padding: 0 $spacing-unit * 2

  // Header приложения
  &__header
    background: white
    border-bottom: 1px solid $gray-200
    padding: $spacing-unit * 2 0
    position: sticky // прилипает к верху при прокрутке
    top: 0
    z-index: $z-index-dropdown
    
    h1
      font-size: 24px
      color: $text-light

  // Основной контент
  &__main
    flex: 1 // занимает всё доступное пространство
    padding: $spacing-unit * 4 0

  // Footer
  &__footer
    background: $secondary-color
    color: $text-dark
    padding: $spacing-unit * 3 0
    text-align: center
    
    p
      margin: 0
      font-size: 14px
</style>
```

---

## 8️⃣ Тестовая страница компонентов

### Файл: `pages/index.vue`

```vue
<template>
  <div class="demo-page">
    <h1>SnapBoard UI Components</h1>
    
    <!-- Секция с кнопками -->
    <section class="demo-section">
      <h2>Buttons</h2>
      <div class="demo-row">
        <BaseButton variant="primary">Primary Button</BaseButton>
        <BaseButton variant="secondary">Secondary Button</BaseButton>
        <BaseButton variant="outline">Outline Button</BaseButton>
        <BaseButton variant="primary" :loading="true">Loading...</BaseButton>
        <BaseButton variant="primary" :disabled="true">Disabled</BaseButton>
      </div>
    </section>
    
    <!-- Секция с полями ввода -->
    <section class="demo-section">
      <h2>Inputs</h2>
      <div class="demo-column">
        <BaseInput
          v-model="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          hint="We'll never share your email"
        />
        <BaseInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="Enter password"
          :required="true"
        />
        <BaseInput
          v-model="error"
          label="Field with error"
          error="This field is required"
        />
      </div>
    </section>
    
    <!-- Секция с карточками -->
    <section class="demo-section">
      <h2>Cards</h2>
      <div class="demo-row">
        <BaseCard>
          <div style="padding: 20px">
            <h3>Static Card</h3>
            <p>This is a simple card</p>
          </div>
        </BaseCard>
        <BaseCard :clickable="true" @click="handleCardClick">
          <div style="padding: 20px">
            <h3>Clickable Card</h3>
            <p>Click me!</p>
          </div>
        </BaseCard>
      </div>
    </section>
    
    <!-- Секция с модальным окном -->
    <section class="demo-section">
      <h2>Modal</h2>
      <BaseButton @click="showModal = true">Open Modal</BaseButton>
      
      <BaseModal v-model="showModal" title="Example Modal">
        <p>This is modal content. You can put anything here.</p>
        
        <template #footer>
          <BaseButton variant="outline" @click="showModal = false">
            Cancel
          </BaseButton>
          <BaseButton variant="primary" @click="showModal = false">
            Confirm
          </BaseButton>
        </template>
      </BaseModal>
    </section>
    
    <!-- Секция с загрузчиком -->
    <section class="demo-section">
      <h2>Loader</h2>
      <div class="demo-row">
        <BaseLoader size="small" />
        <BaseLoader size="medium" />
        <BaseLoader size="large" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Реактивные данные для демонстрации
const email = ref('')
const password = ref('')
const error = ref('')
const showModal = ref(false)

// Обработчик клика по карточке
const handleCardClick = () => {
  alert('Card clicked!')
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.demo-page
  padding: $spacing-unit * 4
  
  h1
    font-size: 32px
    margin-bottom: $spacing-unit * 4
    color: $text-light

.demo-section
  margin-bottom: $spacing-unit * 6
  
  h2
    font-size: 24px
    margin-bottom: $spacing-unit * 3
    color: $text-light

.demo-row
  display: flex
  gap: $spacing-unit * 2
  flex-wrap: wrap

.demo-column
  display: flex
  flex-direction: column
  gap: $spacing-unit * 2
  max-width: 400px
</style>
```

---

## ✅ Результат этапа

После завершения этапа у вас будут:

1. ✅ Расширенные SASS переменные
2. ✅ Компонент BaseButton с 3 вариантами стилей
3. ✅ Компонент BaseInput с валидацией
4. ✅ Компонент BaseCard для контента
5. ✅ Компонент BaseModal для диалогов
6. ✅ Компонент BaseLoader для загрузки
7. ✅ Базовый Layout со структурой
8. ✅ Тестовая страница для проверки компонентов

---

## 🎯 Следующий этап

**Этап 3: Layout и навигация**

В следующем этапе создадим:
- Полноценный Header с навигацией
- Адаптивное мобильное меню
- Sidebar для фильтров
- Breadcrumbs для навигации

---

## 💡 Советы по использованию

1. **Переиспользуйте компоненты** - все компоненты из `/common` можно использовать где угодно
2. **v-model** - работает с BaseInput и BaseModal из коробки
3. **Слоты** - используйте слоты для гибкости (иконки, footer модалки и т.д.)
4. **Комментарии** - все комментарии в коде объясняют почему именно так

---

Готовы перейти к следующему этапу? 🚀