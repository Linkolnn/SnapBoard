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
import { onMounted } from 'vue'
import { useAuthStore } from '~/store/auth'
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
 * Очищаем ошибку при монтировании компонента
 */
onMounted(() => {
  authStore.clearError()
})

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
      color: var(--text-primary)
      margin-bottom: 8px
    
    p
      font-size: 16px
      color: var(--text-secondary)
  
  // Форма
  &__form
    display: flex
    flex-direction: column
    gap: 20px
  
  // Ошибка от API
  &__error
    padding: 12px 16px
    background: var(--error-light)
    border: 1px solid var(--error-color)
    border-radius: $radius-sm
    color: var(--error-color)
    font-size: 14px
    text-align: center
  
  // Footer с ссылкой на вход
  &__footer
    margin-top: 24px
    text-align: center
    padding-top: 24px
    border-top: 1px solid var(--border-color)
    
    p
      font-size: 14px
      color: var(--text-secondary)
    
    a
      color: var(--accent-color)
      text-decoration: none
      font-weight: 600
      transition: opacity $transition-fast
      
      &:hover
        opacity: 0.8
</style>
