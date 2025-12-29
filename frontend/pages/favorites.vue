<template>
  <main class="favorites-page">
    <div class="favorites-page__container">
      <header class="favorites-page__header">
        <h1 class="favorites-page__title">Избранное</h1>
        <p class="favorites-page__subtitle">Ваши сохранённые изображения</p>
      </header>

      <div class="favorites-page__empty">
        <div class="favorites-page__empty-icon">⭐</div>
        <h2>Пока пусто</h2>
        <p>Добавляйте изображения в избранное, чтобы они появились здесь</p>
        <NuxtLink to="/boards" class="favorites-page__btn">
          Перейти к доскам
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

useHead({
  title: 'Избранное - SnapBoard'
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.favorites-page
  min-height: 100vh
  background: $gray-50
  padding: 32px 0

  &__container
    max-width: $breakpoint-desktop
    margin: 0 auto
    padding: 0 24px
    @include mobile
      padding: 0 16px

  &__header
    margin-bottom: 32px

  &__title
    font-size: 32px
    font-weight: 700
    color: $text-light
    margin-bottom: 8px

  &__subtitle
    font-size: 16px
    color: $gray-500

  &__empty
    text-align: center
    padding: 64px 24px
    background: white
    border-radius: $radius-lg

    &-icon
      font-size: 64px
      margin-bottom: 16px

    h2
      font-size: 24px
      color: $text-light
      margin-bottom: 8px

    p
      color: $gray-400
      margin-bottom: 24px

  &__btn
    display: inline-block
    padding: 12px 24px
    background: $primary-color
    color: white
    text-decoration: none
    border-radius: $radius
    font-weight: 600
</style>
