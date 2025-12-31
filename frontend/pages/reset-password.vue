<template>
  <main class="reset-password">
    <div class="reset-password__container">
      <!-- Проверка токена -->
      <div v-if="isVerifying" class="reset-password__loading">
        <CommonBaseLoader size="large" />
        <span>Проверка ссылки...</span>
      </div>

      <!-- Токен недействителен -->
      <div v-else-if="!isTokenValid" class="reset-password__invalid">
        <div class="reset-password__invalid-icon">⚠️</div>
        <h1>Ссылка недействительна</h1>
        <p>
          Ссылка для сброса пароля истекла или уже была использована.
        </p>
        <NuxtLink to="/forgot-password">
          <CommonBaseButton variant="primary">
            Запросить новую ссылку
          </CommonBaseButton>
        </NuxtLink>
      </div>

      <!-- Форма сброса -->
      <template v-else-if="!isSuccess">
        <h1 class="reset-password__title">Новый пароль</h1>
        <p class="reset-password__subtitle">
          Придумайте надёжный пароль для вашего аккаунта
        </p>

        <form class="reset-password__form" @submit.prevent="handleSubmit">
          <CommonBaseInput
            v-model="password"
            type="password"
            label="Новый пароль"
            placeholder="Минимум 6 символов"
            :error="errors.password"
            required
          />

          <CommonBaseInput
            v-model="confirmPassword"
            type="password"
            label="Подтвердите пароль"
            placeholder="Повторите пароль"
            :error="errors.confirmPassword"
            required
          />

          <p v-if="serverError" class="reset-password__error">
            {{ serverError }}
          </p>

          <CommonBaseButton
            type="submit"
            variant="primary"
            :disabled="isLoading || !isValid"
            class="reset-password__btn"
          >
            {{ isLoading ? 'Сохранение...' : 'Сменить пароль' }}
          </CommonBaseButton>
        </form>
      </template>

      <!-- Успех -->
      <div v-else class="reset-password__success">
        <div class="reset-password__success-icon">✅</div>
        <h1>Пароль изменён</h1>
        <p>
          Теперь вы можете войти с новым паролем.
        </p>
        <NuxtLink to="/login">
          <CommonBaseButton variant="primary">
            Войти в аккаунт
          </CommonBaseButton>
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'auth'
})

useHead({
  title: 'Сброс пароля - SnapBoard'
})

const route = useRoute()
const { get, post } = useApi()

const token = computed(() => route.query.token as string || '')

const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const isVerifying = ref(true)
const isTokenValid = ref(false)
const isSuccess = ref(false)
const serverError = ref('')

const errors = computed(() => ({
  password: password.value && password.value.length < 6 
    ? 'Минимум 6 символов' 
    : '',
  confirmPassword: confirmPassword.value && confirmPassword.value !== password.value
    ? 'Пароли не совпадают'
    : ''
}))

const isValid = computed(() => {
  return password.value.length >= 6 && 
         confirmPassword.value === password.value
})

const verifyToken = async () => {
  if (!token.value) {
    isVerifying.value = false
    isTokenValid.value = false
    return
  }

  try {
    const response = await get<{ valid: boolean }>(`/auth/verify-reset-token?token=${token.value}`)
    isTokenValid.value = response.valid
  } catch (e) {
    isTokenValid.value = false
  } finally {
    isVerifying.value = false
  }
}

const handleSubmit = async () => {
  if (!isValid.value || !token.value) return
  
  isLoading.value = true
  serverError.value = ''
  
  try {
    await post('/auth/reset-password', {
      token: token.value,
      password: password.value
    })
    isSuccess.value = true
  } catch (e: any) {
    serverError.value = e?.data?.message || 'Ошибка при сбросе пароля'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  verifyToken()
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.reset-password
  display: flex
  align-items: center
  justify-content: center

  &__container
    width: 100%
    max-width: 400px
    text-align: center

  &__loading
    display: flex
    flex-direction: column
    align-items: center
    gap: 16px
    color: var(--text-muted)

  &__invalid
    background: var(--card-bg)
    border: 1px solid var(--card-border)
    border-radius: $radius-lg
    padding: 32px 24px

    &-icon
      font-size: 48px
      margin-bottom: 16px

    h1
      font-size: 24px
      color: var(--text-primary)
      margin-bottom: 12px

    p
      color: var(--text-secondary)
      margin-bottom: 24px

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
    border-radius: $radius-lg
    padding: 32px 24px

    &-icon
      font-size: 48px
      margin-bottom: 16px

    h1
      font-size: 24px
      color: var(--text-primary)
      margin-bottom: 12px

    p
      color: var(--text-secondary)
      margin-bottom: 24px
</style>
