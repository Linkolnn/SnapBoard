<template>
  <main class="static-page">
    <div class="static-page__container">
      <h1>О проекте</h1>
      
      <section class="static-page__section">
        <h2>Что такое SnapBoard?</h2>
        <p>
          SnapBoard — это визуальная доска вдохновения, которая помогает вам 
          собирать, организовывать и делиться изображениями. Создавайте тематические 
          доски, добавляйте изображения и находите вдохновение каждый день.
        </p>
      </section>

      <section class="static-page__section">
        <h2>Возможности</h2>
        <ul>
          <li>📋 Создание неограниченного количества досок</li>
          <li>🖼️ Загрузка изображений с устройства или по URL</li>
          <li>🔍 Умный поиск и фильтрация по тегам</li>
          <li>🔒 Приватные и публичные доски</li>
          <li>📱 Адаптивный дизайн для всех устройств</li>
        </ul>
      </section>

      <section class="static-page__section">
        <h2>Технологии</h2>
        <p>
          Проект создан с использованием современных технологий: 
          Nuxt 3, Vue 3, TypeScript, Pinia и SASS.
        </p>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
useHead({
  title: 'О проекте - SnapBoard'
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
      list-style: none
      display: flex
      flex-direction: column
      gap: 12px

      li
        color: var(--text-secondary)
        font-size: 16px
</style>
