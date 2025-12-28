<template>
    <article class="login-form">
        <header class="login-form__header">
            <h1 class="login-form__title">Вход</h1>
            <p class="login-from__subtitle">Войдите в свой аккаунт SnapBoard</p>
        </header>

        <form 
            class="login-form__form"
            @submit.prevent="handleSubmit"
        >
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
            <CommonBaseInput
                :model-value="fields.password.value"
                type="password"
                label="password"
                placeholder="Пароль"
                :error="fields.password.error"
                :required="true"
                @update:model-value="(val) => handleInput('password', val)"
                @blur="handleBlur('password')"
            />
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

        <footer class="login-form__footer">
            <p>
                Нет аккаунта?
                <NuxtLink to="/register">Зарегистрироваться</NuxtLink>
            </p>
        </footer>
    </article>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '~/store/auth'
import { useFormValidation, requiredRule, emailRule, minLengthRule } from '~/composables/useFormValidation'

/**
 * Store аутентификации
 */
const authStore = useAuthStore()

/**
 * Router для навигации после успешного входа
 */
const router = useRouter()
const route = useRoute()

/**
 * Получаем redirect URL из query параметров
 */
const redirectUrl = computed(() => {
  const redirect = route.query.redirect as string
  return redirect || '/'
})

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
  
  // Если успешно - перенаправляем на redirect URL или главную
  if (result.success) {
    router.push(redirectUrl.value)
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
