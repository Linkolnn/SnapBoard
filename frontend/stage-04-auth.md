# Этап 4: Аутентификация SnapBoard

## 🎯 Цель этапа
Создать полноценную систему аутентификации с регистрацией, входом, валидацией форм, Pinia store для управления состоянием пользователя и middleware для защиты роутов. **Токены хранятся в HTTP-only cookies** для максимальной безопасности.

---

## 📋 Чеклист этапа
- [ ] Pinia Store для аутентификации
- [ ] Composable для работы с API
- [ ] Composable для валидации форм
- [ ] Форма входа (Login)
- [ ] Форма регистрации (Register)
- [ ] Middleware для защищённых роутов
- [ ] Страницы входа и регистрации

---

## 🔐 Важно: Безопасность токенов

**Токены хранятся в HTTP-only cookies, а НЕ в localStorage!**

### Почему cookies безопаснее:
- **HTTP-only флаг** - JavaScript не может прочитать cookie, защита от XSS
- **Secure флаг** - cookie передаются только по HTTPS
- **SameSite** - защита от CSRF атак
- Автоматически отправляются с каждым запросом

### Как это работает:
1. Backend устанавливает cookie при входе/регистрации
2. Frontend читает cookie только для проверки наличия токена
3. Cookie автоматически отправляются с API запросами
4. Backend валидирует токен из cookie

---

## 1️⃣ Pinia Store для аутентификации

### Файл: `stores/auth.ts`

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '~/types'

/**
 * Store для управления аутентификацией
 * - Хранит данные пользователя
 * - Управляет входом, регистрацией, выходом
 * - Проверяет статус аутентификации
 * - Токены хранятся в HTTP-only cookies (управляется backend)
 */
export const useAuthStore = defineStore('auth', () => {
  // ==================== STATE ====================
  
  /**
   * Данные текущего пользователя
   * null - если пользователь не авторизован
   */
  const user = ref<User | null>(null)
  
  /**
   * Состояние загрузки при выполнении операций аутентификации
   */
  const isLoading = ref(false)
  
  /**
   * Ошибка последней операции аутентификации
   */
  const error = ref<string | null>(null)
  
  /**
   * Cookie для access токена
   * Используем useCookie из Nuxt для чтения cookie
   * Сам токен устанавливается backend'ом как HTTP-only cookie
   */
  const accessTokenCookie = useCookie('access_token', {
    maxAge: 60 * 15, // 15 минут
    secure: process.env.NODE_ENV === 'production', // только HTTPS в production
    sameSite: 'strict' // защита от CSRF
  })

  // ==================== GETTERS ====================
  
  /**
   * Проверка: авторизован ли пользователь
   * Возвращает true если есть пользователь и токен в cookie
   */
  const isAuthenticated = computed(() => {
    return !!user.value && !!accessTokenCookie.value
  })

  // ==================== ACTIONS ====================
  
  /**
   * Вход пользователя
   * @param email - email пользователя
   * @param password - пароль
   * @returns Promise с результатом входа
   */
  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      // API запрос для входа
      // Backend установит HTTP-only cookie с токенами в ответе
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password },
        credentials: 'include' // важно: отправляем и получаем cookies
      })
      
      // Сохраняем только данные пользователя
      // Токены уже в cookies, устанавливаются backend'ом
      user.value = response.user
      
      return { success: true }
    } catch (err: any) {
      // Обработка ошибок
      error.value = err.data?.message || 'Ошибка при входе'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Регистрация нового пользователя
   * @param username - имя пользователя
   * @param email - email
   * @param password - пароль
   * @returns Promise с результатом регистрации
   */
  const register = async (username: string, email: string, password: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      // API запрос для регистрации
      // Backend установит HTTP-only cookie с токенами в ответе
      const response = await $fetch('/api/auth/register', {
        method: 'POST',
        body: { username, email, password },
        credentials: 'include' // важно: отправляем и получаем cookies
      })
      
      // После успешной регистрации автоматически входим
      // Токены уже в cookies, устанавливаются backend'ом
      user.value = response.user
      
      return { success: true }
    } catch (err: any) {
      error.value = err.data?.message || 'Ошибка при регистрации'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Выход из системы
   * Очищает данные пользователя и удаляет cookies
   */
  const logout = async () => {
    try {
      // Отправляем запрос на backend для инвалидации токена
      // Backend удалит HTTP-only cookie
      await $fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include' // важно: отправляем cookies для идентификации
      })
    } catch (err) {
      // Игнорируем ошибки при logout
      console.error('Logout error:', err)
    } finally {
      // Очищаем state
      user.value = null
      error.value = null
      
      // Очищаем cookie на клиенте (backend тоже удалит свою)
      accessTokenCookie.value = null
    }
  }
  
  /**
   * Получение данных текущего пользователя
   * Вызывается при загрузке приложения для восстановления сессии
   * Токен автоматически отправляется из cookie
   */
  const fetchCurrentUser = async () => {
    // Проверяем наличие токена в cookie
    if (!accessTokenCookie.value) {
      return
    }
    
    try {
      // Получаем данные пользователя
      // Cookie с токеном автоматически отправляется с запросом
      const response = await $fetch('/api/auth/me', {
        credentials: 'include' // важно: отправляем cookies
      })
      
      user.value = response.user
    } catch (err) {
      // Если токен невалидный - очищаем
      console.error('Failed to fetch current user:', err)
      user.value = null
      accessTokenCookie.value = null
    }
  }
  
  /**
   * Обновление access токена с помощью refresh токена
   * Refresh токен также хранится в HTTP-only cookie
   * Backend автоматически проверит refresh token из cookie
   */
  const refreshAccessToken = async () => {
    try {
      // Запрос на обновление токена
      // Refresh token автоматически отправляется из cookie
      const response = await $fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include' // важно: отправляем cookies
      })
      
      // Backend установит новый access token в cookie
      // На клиенте ничего делать не нужно, cookie обновится автоматически
      
      return true
    } catch (err) {
      // Если refresh token тоже невалиден - разлогиниваем
      console.error('Token refresh failed:', err)
      await logout()
      throw err
    }
  }

  // Возвращаем публичный API store
  return {
    // State
    user,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    // Actions
    login,
    register,
    logout,
    fetchCurrentUser,
    refreshAccessToken
  }
})
```

---

## 2️⃣ Composable для валидации форм

### Файл: `composables/useFormValidation.ts`

```typescript
import { ref, computed } from 'vue'

/**
 * Интерфейс для правил валидации
 */
interface ValidationRule {
  validator: (value: string) => boolean  // функция проверки
  message: string                        // сообщение об ошибке
}

/**
 * Интерфейс для поля формы с валидацией
 */
interface FormField {
  value: string                          // значение поля
  error: string                          // ошибка валидации
  touched: boolean                       // было ли поле изменено пользователем
}

/**
 * Composable для валидации форм
 * Переиспользуемая логика для всех форм в приложении
 * 
 * @example
 * const { fields, validate, resetForm } = useFormValidation({
 *   email: [emailRule, requiredRule],
 *   password: [requiredRule, minLengthRule(6)]
 * })
 */
export const useFormValidation = (rules: Record<string, ValidationRule[]>) => {
  /**
   * Объект с полями формы
   * Каждое поле содержит: value (значение), error (ошибка), touched (изменялось ли)
   */
  const fields = ref<Record<string, FormField>>(
    Object.keys(rules).reduce((acc, fieldName) => {
      acc[fieldName] = {
        value: '',
        error: '',
        touched: false
      }
      return acc
    }, {} as Record<string, FormField>)
  )
  
  /**
   * Валидация одного поля
   * Проходит по всем правилам для поля и находит первую ошибку
   * 
   * @param fieldName - имя поля для валидации
   * @returns true если валидация прошла, false если есть ошибки
   */
  const validateField = (fieldName: string): boolean => {
    const field = fields.value[fieldName]
    const fieldRules = rules[fieldName]
    
    // Очищаем предыдущую ошибку
    field.error = ''
    
    // Проверяем каждое правило
    for (const rule of fieldRules) {
      if (!rule.validator(field.value)) {
        field.error = rule.message
        return false
      }
    }
    
    return true
  }
  
  /**
   * Валидация всей формы
   * Проверяет все поля и возвращает результат
   * 
   * @returns true если вся форма валидна, false если есть ошибки
   */
  const validate = (): boolean => {
    let isValid = true
    
    // Валидируем каждое поле
    for (const fieldName in fields.value) {
      const fieldValid = validateField(fieldName)
      if (!fieldValid) {
        isValid = false
      }
    }
    
    return isValid
  }
  
  /**
   * Обработчик изменения поля
   * Вызывается при вводе текста в поле
   * 
   * @param fieldName - имя поля
   * @param value - новое значение
   */
  const handleInput = (fieldName: string, value: string) => {
    fields.value[fieldName].value = value
    fields.value[fieldName].touched = true
    
    // Валидируем поле только если оно уже было изменено
    if (fields.value[fieldName].touched) {
      validateField(fieldName)
    }
  }
  
  /**
   * Обработчик потери фокуса поля
   * Валидирует поле когда пользователь уходит с него
   * 
   * @param fieldName - имя поля
   */
  const handleBlur = (fieldName: string) => {
    fields.value[fieldName].touched = true
    validateField(fieldName)
  }
  
  /**
   * Сброс формы в начальное состояние
   * Очищает все значения и ошибки
   */
  const resetForm = () => {
    for (const fieldName in fields.value) {
      fields.value[fieldName].value = ''
      fields.value[fieldName].error = ''
      fields.value[fieldName].touched = false
    }
  }
  
  /**
   * Computed: форма валидна и готова к отправке
   * Проверяет что все поля заполнены и нет ошибок
   */
  const isFormValid = computed(() => {
    return Object.values(fields.value).every(
      field => field.value && !field.error
    )
  })
  
  return {
    fields,
    validate,
    validateField,
    handleInput,
    handleBlur,
    resetForm,
    isFormValid
  }
}

// ==================== ГОТОВЫЕ ПРАВИЛА ВАЛИДАЦИИ ====================

/**
 * Правило: поле обязательно для заполнения
 */
export const requiredRule: ValidationRule = {
  validator: (value: string) => value.trim().length > 0,
  message: 'Это поле обязательно для заполнения'
}

/**
 * Правило: валидация email
 */
export const emailRule: ValidationRule = {
  validator: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },
  message: 'Введите корректный email адрес'
}

/**
 * Правило: минимальная длина строки
 * @param minLength - минимальное количество символов
 */
export const minLengthRule = (minLength: number): ValidationRule => ({
  validator: (value: string) => value.length >= minLength,
  message: `Минимальная длина ${minLength} символов`
})

/**
 * Правило: максимальная длина строки
 * @param maxLength - максимальное количество символов
 */
export const maxLengthRule = (maxLength: number): ValidationRule => ({
  validator: (value: string) => value.length <= maxLength,
  message: `Максимальная длина ${maxLength} символов`
})

/**
 * Правило: пароли должны совпадать
 * @param getPasswordValue - функция для получения значения пароля для сравнения
 */
export const passwordMatchRule = (getPasswordValue: () => string): ValidationRule => ({
  validator: (value: string) => value === getPasswordValue(),
  message: 'Пароли не совпадают'
})
```

---

## 3️⃣ Форма входа

### Файл: `components/auth/LoginForm.vue`

```vue
<template>
  <!-- 
    Форма входа в систему
    - Валидация email и пароля
    - Обработка ошибок от API
    - Состояние загрузки
  -->
  <article class="login-form">
    <header class="login-form__header">
      <h1>Вход</h1>
      <p>Войдите в свой аккаунт SnapBoard</p>
    </header>
    
    <!-- Форма входа -->
    <form class="login-form__form" @submit.prevent="handleSubmit">
      <!-- Поле Email -->
      <CommonBaseInput
        :model-value="fields.email.value"
        type="email"
        label="Email"
        placeholder="your@email.com"
        :error="fields.email.error"
        :required="true"
        @update:model-value="(val) => handleInput('email', val)"
        @blur="handleBlur('email')"
      />
      
      <!-- Поле Password -->
      <CommonBaseInput
        :model-value="fields.password.value"
        type="password"
        label="Пароль"
        placeholder="Введите пароль"
        :error="fields.password.error"
        :required="true"
        @update:model-value="(val) => handleInput('password', val)"
        @blur="handleBlur('password')"
      />
      
      <!-- Ссылка "Забыли пароль?" -->
      <div class="login-form__forgot">
        <NuxtLink to="/forgot-password">Забыли пароль?</NuxtLink>
      </div>
      
      <!-- Ошибка от API (если есть) -->
      <div v-if="authStore.error" class="login-form__error">
        {{ authStore.error }}
      </div>
      
      <!-- Кнопка отправки формы -->
      <CommonBaseButton
        type="submit"
        variant="primary"
        :loading="authStore.isLoading"
        :disabled="!isFormValid || authStore.isLoading"
      >
        Войти
      </CommonBaseButton>
    </form>
    
    <!-- Ссылка на регистрацию -->
    <footer class="login-form__footer">
      <p>
        Нет аккаунта?
        <NuxtLink to="/register">Зарегистрироваться</NuxtLink>
      </p>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useFormValidation, requiredRule, emailRule, minLengthRule } from '~/composables/useFormValidation'

/**
 * Store аутентификации
 */
const authStore = useAuthStore()

/**
 * Router для навигации после успешного входа
 */
const router = useRouter()

/**
 * Инициализация валидации формы
 * Определяем правила для каждого поля
 */
const {
  fields,
  validate,
  handleInput,
  handleBlur,
  isFormValid
} = useFormValidation({
  email: [requiredRule, emailRule],
  password: [requiredRule, minLengthRule(6)]
})

/**
 * Обработчик отправки формы
 * - Валидирует форму
 * - Отправляет запрос на вход
 * - Перенаправляет на главную при успехе
 */
const handleSubmit = async () => {
  // Валидируем форму
  if (!validate()) {
    return
  }
  
  // Отправляем данные для входа
  // Токены автоматически устанавливаются в cookies backend'ом
  const result = await authStore.login(
    fields.value.email.value,
    fields.value.password.value
  )
  
  // Если успешно - перенаправляем на главную
  if (result.success) {
    router.push('/')
  }
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.login-form
  width: 100%
  
  // Заголовок формы
  &__header
    text-align: center
    margin-bottom: 32px
    
    h1
      font-size: 28px
      font-weight: 700
      color: $text-light
      margin-bottom: 8px
    
    p
      font-size: 16px
      color: $gray-500
  
  // Форма
  &__form
    display: flex
    flex-direction: column
    gap: 24px
  
  // Ссылка "Забыли пароль?"
  &__forgot
    text-align: right
    margin-top: -8px
    
    a
      color: $primary-color
      text-decoration: none
      font-size: 14px
      transition: opacity $transition-fast
      
      &:hover
        opacity: 0.8
  
  // Ошибка от API
  &__error
    padding: 12px 16px
    background: rgba(255, 68, 68, 0.1)
    border: 1px solid $error-color
    border-radius: $radius-sm
    color: $error-color
    font-size: 14px
    text-align: center
  
  // Footer с ссылкой на регистрацию
  &__footer
    margin-top: 24px
    text-align: center
    padding-top: 24px
    border-top: 1px solid $gray-200
    
    p
      font-size: 14px
      color: $gray-500
    
    a
      color: $primary-color
      text-decoration: none
      font-weight: 600
      transition: opacity $transition-fast
      
      &:hover
        opacity: 0.8
</style>
```

---

## 4️⃣ Форма регистрации

### Файл: `components/auth/RegisterForm.vue`

```vue
<template>
  <!-- 
    Форма регистрации нового пользователя
    - Валидация username, email, password, confirmPassword
    - Обработка ошибок от API
    - Состояние загрузки
  -->
  <article class="register-form">
    <header class="register-form__header">
      <h1>Регистрация</h1>
      <p>Создайте аккаунт SnapBoard</p>
    </header>
    
    <!-- Форма регистрации -->
    <form class="register-form__form" @submit.prevent="handleSubmit">
      <!-- Поле Username -->
      <CommonBaseInput
        :model-value="fields.username.value"
        type="text"
        label="Имя пользователя"
        placeholder="Ваше имя"
        :error="fields.username.error"
        :required="true"
        @update:model-value="(val) => handleInput('username', val)"
        @blur="handleBlur('username')"
      />
      
      <!-- Поле Email -->
      <CommonBaseInput
        :model-value="fields.email.value"
        type="email"
        label="Email"
        placeholder="your@email.com"
        :error="fields.email.error"
        :required="true"
        @update:model-value="(val) => handleInput('email', val)"
        @blur="handleBlur('email')"
      />
      
      <!-- Поле Password -->
      <CommonBaseInput
        :model-value="fields.password.value"
        type="password"
        label="Пароль"
        placeholder="Минимум 6 символов"
        :error="fields.password.error"
        :required="true"
        hint="Минимум 6 символов"
        @update:model-value="(val) => handleInput('password', val)"
        @blur="handleBlur('password')"
      />
      
      <!-- Поле Confirm Password -->
      <CommonBaseInput
        :model-value="fields.confirmPassword.value"
        type="password"
        label="Подтвердите пароль"
        placeholder="Повторите пароль"
        :error="fields.confirmPassword.error"
        :required="true"
        @update:model-value="(val) => handleInput('confirmPassword', val)"
        @blur="handleBlur('confirmPassword')"
      />
      
      <!-- Ошибка от API (если есть) -->
      <div v-if="authStore.error" class="register-form__error">
        {{ authStore.error }}
      </div>
      
      <!-- Кнопка отправки формы -->
      <CommonBaseButton
        type="submit"
        variant="primary"
        :loading="authStore.isLoading"
        :disabled="!isFormValid || authStore.isLoading"
      >
        Зарегистрироваться
      </CommonBaseButton>
    </form>
    
    <!-- Ссылка на вход -->
    <footer class="register-form__footer">
      <p>
        Уже есть аккаунт?
        <NuxtLink to="/login">Войти</NuxtLink>
      </p>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { 
  useFormValidation, 
  requiredRule, 
  emailRule, 
  minLengthRule,
  maxLengthRule,
  passwordMatchRule
} from '~/composables/useFormValidation'

/**
 * Store аутентификации
 */
const authStore = useAuthStore()

/**
 * Router для навигации после успешной регистрации
 */
const router = useRouter()

/**
 * Инициализация валидации формы
 * Определяем правила для каждого поля
 */
const {
  fields,
  validate,
  handleInput,
  handleBlur,
  isFormValid
} = useFormValidation({
  username: [
    requiredRule, 
    minLengthRule(3),
    maxLengthRule(20)
  ],
  email: [
    requiredRule, 
    emailRule
  ],
  password: [
    requiredRule, 
    minLengthRule(6)
  ],
  confirmPassword: [
    requiredRule,
    passwordMatchRule(() => fields.value.password.value)
  ]
})

/**
 * Обработчик отправки формы
 * - Валидирует форму
 * - Отправляет запрос на регистрацию
 * - Перенаправляет на главную при успехе
 */
const handleSubmit = async () => {
  // Валидируем форму
  if (!validate()) {
    return
  }
  
  // Отправляем данные для регистрации
  // Токены автоматически устанавливаются в cookies backend'ом
  const result = await authStore.register(
    fields.value.username.value,
    fields.value.email.value,
    fields.value.password.value
  )
  
  // Если успешно - перенаправляем на главную
  if (result.success) {
    router.push('/')
  }
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.register-form
  width: 100%
  
  // Заголовок формы
  &__header
    text-align: center
    margin-bottom: 32px
    
    h1
      font-size: 28px
      font-weight: 700
      color: $text-light
      margin-bottom: 8px
    
    p
      font-size: 16px
      color: $gray-500
  
  // Форма
  &__form
    display: flex
    flex-direction: column
    gap: 20px
  
  // Ошибка от API
  &__error
    padding: 12px 16px
    background: rgba(255, 68, 68, 0.1)
    border: 1px solid $error-color
    border-radius: $radius-sm
    color: $error-color
    font-size: 14px
    text-align: center
  
  // Footer с ссылкой на вход
  &__footer
    margin-top: 24px
    text-align: center
    padding-top: 24px
    border-top: 1px solid $gray-200
    
    p
      font-size: 14px
      color: $gray-500
    
    a
      color: $primary-color
      text-decoration: none
      font-weight: 600
      transition: opacity $transition-fast
      
      &:hover
        opacity: 0.8
</style>
```

---

## 5️⃣ Middleware для защиты роутов

### Файл: `middleware/auth.ts`

```typescript
/**
 * Middleware для защиты приватных страниц
 * Проверяет авторизацию пользователя
 * Если не авторизован - перенаправляет на страницу входа
 * 
 * Использование:
 * definePageMeta({
 *   middleware: 'auth'
 * })
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // Получаем store аутентификации
  const authStore = useAuthStore()
  
  // Проверяем авторизацию
  // isAuthenticated проверяет наличие пользователя и токена в cookie
  if (!authStore.isAuthenticated) {
    // Если не авторизован - перенаправляем на страницу входа
    // Сохраняем путь куда пользователь хотел попасть для редиректа после входа
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
})
```

### Файл: `middleware/guest.ts`

```typescript
/**
 * Middleware для страниц только для гостей (login, register)
 * Если пользователь уже авторизован - перенаправляет на главную
 * 
 * Использование:
 * definePageMeta({
 *   middleware: 'guest'
 * })
 */
export default defineNuxtRouteMiddleware(() => {
  // Получаем store аутентификации
  const authStore = useAuthStore()
  
  // Если уже авторизован - перенаправляем на главную
  if (authStore.isAuthenticated) {
    return navigateTo('/')
  }
})
```

---

## 6️⃣ Страница входа

### Файл: `pages/login.vue`

```vue
<template>
  <!-- Страница входа использует auth layout -->
  <AuthLoginForm />
</template>

<script setup lang="ts">
/**
 * Мета-данные страницы
 * - layout: 'auth' - используем auth layout вместо default
 * - middleware: 'guest' - только для неавторизованных пользователей
 */
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

/**
 * SEO заголовки страницы
 */
useHead({
  title: 'Вход - SnapBoard',
  meta: [
    { name: 'description', content: 'Войдите в свой аккаунт SnapBoard' }
  ]
})
</script>
```

---

## 7️⃣ Страница регистрации

### Файл: `pages/register.vue`

```vue
<template>
  <!-- Страница регистрации использует auth layout -->
  <AuthRegisterForm />
</template>

<script setup lang="ts">
/**
 * Мета-данные страницы
 * - layout: 'auth' - используем auth layout вместо default
 * - middleware: 'guest' - только для неавторизованных пользователей
 */
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

/**
 * SEO заголовки страницы
 */
useHead({
  title: 'Регистрация - SnapBoard',
  meta: [
    { name: 'description', content: 'Создайте аккаунт SnapBoard' }
  ]
})
</script>
```

---

## 8️⃣ Инициализация auth при запуске приложения

### Файл: `app.vue`

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

/**
 * Инициализация при запуске приложения
 * Получаем данные пользователя если токен есть в cookie
 */
const authStore = useAuthStore()

// Получаем данные пользователя только на клиенте
onMounted(async () => {
  await authStore.fetchCurrentUser()
})
</script>
```

---

## 9️⃣ Обновление Header для авторизованных пользователей

### Файл: `components/layout/HeaderActions.vue`

```vue
<template>
  <!-- 
    Действия в header в зависимости от статуса авторизации
    - Для гостей: кнопки входа и регистрации
    - Для авторизованных: меню профиля и выход
  -->
  <div class="header-actions">
    <!-- Если НЕ авторизован - показываем кнопки входа/регистрации -->
    <template v-if="!authStore.isAuthenticated">
      <CommonBaseButton variant="outline" @click="navigateTo('/login')">
        Войти
      </CommonBaseButton>
      <CommonBaseButton variant="primary" @click="navigateTo('/register')">
        Регистрация
      </CommonBaseButton>
    </template>
    
    <!-- Если авторизован - показываем меню пользователя -->
    <template v-else>
      <div class="header-actions__user">
        <!-- Аватар пользователя -->
        <button class="header-actions__avatar" @click="toggleUserMenu">
          <img 
            v-if="authStore.user?.avatar" 
            :src="authStore.user.avatar" 
            :alt="authStore.user.username"
          />
          <span v-else>{{ userInitials }}</span>
        </button>
        
        <!-- Выпадающее меню пользователя -->
        <nav v-if="isUserMenuOpen" class="header-actions__menu">
          <ul>
            <li>
              <NuxtLink to="/profile" @click="closeUserMenu">
                Профиль
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/boards" @click="closeUserMenu">
                Мои доски
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/settings" @click="closeUserMenu">
                Настройки
              </NuxtLink>
            </li>
            <li>
              <button @click="handleLogout">
                Выйти
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

/**
 * Store аутентификации
 */
const authStore = useAuthStore()

/**
 * Router для навигации
 */
const router = useRouter()

/**
 * Состояние выпадающего меню пользователя
 */
const isUserMenuOpen = ref(false)

/**
 * Инициалы пользователя для аватара (если нет изображения)
 * Берём первую букву username
 */
const userInitials = computed(() => {
  if (!authStore.user?.username) return '?'
  return authStore.user.username.charAt(0).toUpperCase()
})

/**
 * Переключение меню пользователя
 */
const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

/**
 * Закрытие меню пользователя
 */
const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

/**
 * Обработчик выхода из системы
 * Токены удаляются из cookies backend'ом
 */
const handleLogout = async () => {
  closeUserMenu()
  await authStore.logout()
  router.push('/login')
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.header-actions
  display: flex
  align-items: center
  gap: 8px
  position: relative
  
  // Контейнер пользователя с аватаром и меню
  &__user
    position: relative
  
  // Аватар пользователя
  &__avatar
    width: 40px
    height: 40px
    border-radius: 50%
    background: $primary-color
    color: white
    display: flex
    align-items: center
    justify-content: center
    font-weight: 600
    font-size: 16px
    cursor: pointer
    transition: transform $transition-fast
    overflow: hidden
    
    &:hover
      transform: scale(1.05)
    
    img
      width: 100%
      height: 100%
      object-fit: cover
  
  // Выпадающее меню
  &__menu
    position: absolute
    top: calc(100% + 8px)
    right: 0
    background: white
    border-radius: $radius-sm
    box-shadow: $shadow-lg
    padding: 8px 0
    min-width: 200px
    z-index: $z-index-dropdown
    
    ul
      list-style: none
      
      li
        a,
        button
          display: block
          width: 100%
          padding: 12px 16px
          color: $text-light
          text-decoration: none
          text-align: left
          transition: background $transition-fast
          font-size: 14px
          
          &:hover
            background: $gray-100
</style>
```

---

## 🔟 Конфигурация Nuxt для cookies

### Обновите `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  // ... остальная конфигурация
  
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:3001/api'
    }
  },
  
  // Настройки для работы с cookies
  nitro: {
    experimental: {
      // Включаем поддержку cookies в SSR
      payloadExtraction: false
    }
  }
})
```

---

## ✅ Результат этапа

После завершения этапа у вас будут:

1. ✅ Pinia Store для управления аутентификацией
2. ✅ **Токены в HTTP-only cookies** (устанавливаются backend'ом)
3. ✅ Composable для валидации форм (переиспользуемый)
4. ✅ Форма входа с валидацией
5. ✅ Форма регистрации с валидацией
6. ✅ Middleware для защиты приватных роутов
7. ✅ Middleware для страниц только для гостей
8. ✅ Страницы входа и регистрации
9. ✅ Автоматическое получение данных пользователя при загрузке
10. ✅ Интеграция с Header (меню пользователя)

---

## 🔐 Безопасность: Cookies vs localStorage

### Почему cookies безопаснее:

| Аспект | localStorage | HTTP-only Cookies |
|--------|--------------|-------------------|
| **XSS атаки** | ❌ Уязвим | ✅ Защищён |
| **CSRF атаки** | ✅ Не уязвим | ⚠️ Требует SameSite |
| **Доступ из JS** | ✅ Полный доступ | ❌ Недоступен |
| **Auto-send** | ❌ Нужно вручную | ✅ Автоматически |
| **Срок жизни** | ♾️ Бессрочно | ⏰ Можно ограничить |

### Backend должен установить cookies с флагами:

```javascript
// Пример ответа backend при входе/регистрации
res.cookie('access_token', accessToken, {
  httpOnly: true,      // JS не может прочитать
  secure: true,        // только HTTPS
  sameSite: 'strict',  // защита от CSRF
  maxAge: 15 * 60 * 1000 // 15 минут
})

res.cookie('refresh_token', refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
})
```

---

## 🎯 Следующий этап

**Этап 5: Masonry Grid для изображений**

В следующем этапе создадим:
- Компонент Masonry Grid
- Lazy loading изображений
- Skeleton loader
- Адаптивность под разные экраны

---

Готовы перейти к **Этапу 5: Masonry Grid**? 🚀