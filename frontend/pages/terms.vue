<template>
  <main class="static-page">
    <div class="static-page__container">
      <h1>Условия использования</h1>
      
      <section class="static-page__section">
        <h2>Общие положения</h2>
        <p>
          Используя SnapBoard, вы соглашаетесь с данными условиями. 
          Если вы не согласны с условиями, пожалуйста, не используйте сервис.
        </p>
      </section>

      <section class="static-page__section">
        <h2>Правила использования</h2>
        <ul>
          <li>Не загружайте контент, нарушающий авторские права</li>
          <li>Не публикуйте незаконный или оскорбительный контент</li>
          <li>Не используйте сервис для спама или мошенничества</li>
          <li>Соблюдайте права других пользователей</li>
        </ul>
      </section>

      <section class="static-page__section">
        <h2>Ответственность</h2>
        <p>
          Вы несёте ответственность за контент, который загружаете. 
          Мы оставляем за собой право удалять контент, нарушающий правила.
        </p>
      </section>

      <section class="static-page__section">
        <h2>Изменения условий</h2>
        <p>
          Мы можем изменять условия использования. 
          О существенных изменениях мы уведомим вас по email.
        </p>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
useHead({
  title: 'Условия использования - SnapBoard'
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

    ul
      list-style: disc
      padding-left: 24px
      display: flex
      flex-direction: column
      gap: 8px

      li
        color: var(--text-secondary)
</style>
