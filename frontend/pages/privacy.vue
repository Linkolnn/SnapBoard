<template>
  <main class="static-page">
    <div class="static-page__container">
      <h1>Политика конфиденциальности</h1>
      
      <section class="static-page__section">
        <h2>Сбор информации</h2>
        <p>
          Мы собираем информацию, которую вы предоставляете при регистрации: 
          имя пользователя, email и пароль. Пароли хранятся в зашифрованном виде.
        </p>
      </section>

      <section class="static-page__section">
        <h2>Использование информации</h2>
        <p>
          Ваша информация используется для предоставления сервиса, 
          улучшения пользовательского опыта и связи с вами при необходимости.
        </p>
      </section>

      <section class="static-page__section">
        <h2>Защита данных</h2>
        <p>
          Мы применяем современные методы защиты данных и не передаём 
          вашу личную информацию третьим лицам без вашего согласия.
        </p>
      </section>

      <section class="static-page__section">
        <h2>Cookies</h2>
        <p>
          Мы используем cookies для аутентификации и улучшения работы сервиса. 
          Вы можете отключить cookies в настройках браузера.
        </p>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
useHead({
  title: 'Конфиденциальность - SnapBoard'
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.static-page
  min-height: 100vh
  background: var(--bg-primary)
  padding: 32px 0

  &__container
    max-width: 800px
    margin: 0 auto
    padding: 0 24px
    @include mobile
      padding: 0 16px

  h1
    font-size: 36px
    font-weight: 700
    color: var(--text-primary)
    margin-bottom: 32px

  &__section
    background: var(--card-bg)
    border: 1px solid var(--card-border)
    border-radius: $radius-lg
    padding: 32px
    margin-bottom: 24px

    h2
      font-size: 20px
      font-weight: 600
      color: var(--text-primary)
      margin-bottom: 16px

    p
      color: var(--text-secondary)
      line-height: 1.7
</style>
