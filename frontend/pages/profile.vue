<template>
  <main class="profile-page">
    <div class="profile-page__container">
      <header class="profile-page__header">
        <div class="profile-page__avatar">
          {{ userInitials }}
        </div>
        <div class="profile-page__info">
          <h1 class="profile-page__name">{{ user?.name || 'Пользователь' }}</h1>
          <p class="profile-page__email">{{ user?.email }}</p>
        </div>
      </header>

      <section class="profile-page__section">
        <h2>Настройки профиля</h2>
        
        <form class="profile-page__form" @submit.prevent="handleSubmit">
          <div class="profile-page__field">
            <label for="name">Имя</label>
            <input 
              id="name" 
              v-model="form.name" 
              type="text" 
              placeholder="Ваше имя"
            />
          </div>
          
          <div class="profile-page__field">
            <label for="email">Email</label>
            <input 
              id="email" 
              v-model="form.email" 
              type="email" 
              placeholder="email@example.com"
              disabled
            />
          </div>
          
          <button type="submit" class="profile-page__btn" :disabled="isSaving">
            {{ isSaving ? 'Сохранение...' : 'Сохранить изменения' }}
          </button>
        </form>
      </section>

      <section class="profile-page__section profile-page__section--danger">
        <h2>Опасная зона</h2>
        <p>Удаление аккаунта приведёт к потере всех данных</p>
        <button class="profile-page__btn profile-page__btn--danger">
          Удалить аккаунт
        </button>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import { storeToRefs } from 'pinia'

definePageMeta({
  middleware: ['auth']
})

useHead({
  title: 'Профиль - SnapBoard'
})

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const userInitials = computed(() => {
  const name = user.value?.name || 'U'
  return name.charAt(0).toUpperCase()
})

const form = reactive({
  name: user.value?.name || '',
  email: user.value?.email || ''
})

const isSaving = ref(false)

const handleSubmit = async () => {
  isSaving.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  isSaving.value = false
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.profile-page
  min-height: 100vh
  background: $gray-50
  padding: 32px 0

  &__container
    max-width: 600px
    margin: 0 auto
    padding: 0 24px
    @include mobile
      padding: 0 16px

  &__header
    display: flex
    align-items: center
    gap: 24px
    margin-bottom: 48px
    padding: 32px
    background: white
    border-radius: $radius-lg

  &__avatar
    width: 80px
    height: 80px
    background: $primary-color
    color: white
    border-radius: 50%
    display: flex
    align-items: center
    justify-content: center
    font-size: 32px
    font-weight: 700

  &__name
    font-size: 24px
    font-weight: 700
    color: $text-light
    margin-bottom: 4px

  &__email
    color: $gray-500

  &__section
    background: white
    border-radius: $radius-lg
    padding: 32px
    margin-bottom: 24px

    h2
      font-size: 20px
      font-weight: 600
      color: $text-light
      margin-bottom: 24px

    &--danger
      border: 2px solid $error-color

      p
        color: $gray-500
        margin-bottom: 16px

  &__form
    display: flex
    flex-direction: column
    gap: 20px

  &__field
    display: flex
    flex-direction: column
    gap: 8px

    label
      font-size: 14px
      font-weight: 500
      color: $text-light

    input
      padding: 12px 16px
      border: 2px solid $gray-200
      border-radius: $radius
      font-size: 16px
      transition: border-color $transition-fast

      &:focus
        outline: none
        border-color: $primary-color

      &:disabled
        background: $gray-100
        color: $gray-500

  &__btn
    padding: 12px 24px
    background: $primary-color
    color: white
    border: none
    border-radius: $radius
    font-size: 16px
    font-weight: 600
    cursor: pointer
    transition: background $transition-fast

    &:hover:not(:disabled)
      background: darken($primary-color, 8%)

    &:disabled
      opacity: 0.6
      cursor: not-allowed

    &--danger
      background: $error-color

      &:hover
        background: darken($error-color, 8%)
</style>
