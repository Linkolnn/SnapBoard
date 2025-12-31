<template>
  <main class="forgot-password">
    <div class="forgot-password__container">
      <h1 class="forgot-password__title">Восстановление пароля</h1>
      <p class="forgot-password__subtitle">
        Введите email, указанный при регистрации
      </p>

      <!-- Форма запроса -->
      <form v-if="!isSuccess" class="forgot-password__form" @submit.prevent="handleSubmit">
        <CommonBaseInput
          v-model="email"
          type="email"
          label="Email"
          placeholder="your@email.com"
          :error="errors.email"
          required
        />

        <p v-if="serverError" class="forgot-password__error">
          {{ serverError }}
        </p>

        <CommonBaseButton
          type="submit"
          variant="primary"
          :disabled="isLoading || !isValid"
          class="forgot-password__btn"
        >
          {{ isLoading ? 'Отправка...' : 'Отправить инструкции' }}
        </CommonBaseButton>
      </form>

      <!-- Успешная отправка -->
      <div v-else class="forgot-password__success">
        <div class="forgot-password__success-icon">✉️</div>
        <h2>Проверьте почту</h2>
        <p>
          Если аккаунт с email <strong>{{ email }}</strong> существует,
          мы отправили инструкции по восстановлению пароля.
        </p>
        <p class="forgot-password__hint">
          Не получили письмо? Проверьте папку "Спам" или попробуйте снова через несколько минут.
        </p>
      </div>

      <NuxtLink to="/login" class="forgot-password__back">
        ← Вернуться к входу
      </NuxtLink>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'auth'
})

useHead({
  title: 'Восстановление пароля - SnapBoard'
})

const { post } = useApi()

const email = ref('')
const isLoading = ref(false)
const isSuccess = ref(false)
const serverError = ref('')

const errors = computed(() => ({
  email: email.value && !isValidEmail(email.value) 
    ? 'Введите корректный email' 
    : ''
}))

const isValid = computed(() => {
  return email.value && isValidEmail(email.value)
})

const isValidEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const handleSubmit = async () => {
  if (!isValid.value) return
  
  isLoading.value = true
  serverError.value = ''
  
  try {
    await post('/auth/forgot-password', { email: email.value })
    isSuccess.value = true
  } catch (e: any) {
    // Всегда показываем успех для безопасности (не раскрываем существование email)
    // Но если это ошибка сервера - показываем
    if (e?.statusCode >= 500) {
      serverError.value = 'Ошибка сервера. Попробуйте позже.'
    } else {
      // Для 404/400 показываем успех (безопасность)
      isSuccess.value = true
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.forgot-password
  display: flex
  align-items: center
  justify-content: center

  &__container
    width: 100%
    max-width: 400px
    text-align: center

  &__title
    font-size: 28px
    font-weight: 700
    color: var(--text-primary)
    margin-bottom: 8px

  &__subtitle
    color: var(--text-secondary)
    margin-bottom: 32px

  &__form
    display: flex
    flex-direction: column
    gap: 16px
    text-align: left

  &__error
    color: var(--error-color)
    font-size: 14px
    text-align: center

  &__btn
    width: 100%
    margin-top: 8px

  &__success
    background: var(--card-bg)
    border: 1px solid var(--card-border)
    border-radius: $radius-lg
    padding: 32px 24px
    margin-bottom: 24px

    &-icon
      font-size: 48px
      margin-bottom: 16px

    h2
      font-size: 20px
      color: var(--text-primary)
      margin-bottom: 12px

    p
      color: var(--text-secondary)
      line-height: 1.5

    strong
      color: var(--text-primary)

  &__hint
    font-size: 13px
    color: var(--text-muted)
    margin-top: 16px

  &__back
    display: inline-block
    margin-top: 24px
    color: var(--accent-color)
    text-decoration: none
    font-weight: 500
    
    &:hover
      text-decoration: underline
</style>
