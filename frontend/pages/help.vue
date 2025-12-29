<template>
  <main class="static-page">
    <div class="static-page__container">
      <h1>Помощь</h1>
      
      <section class="static-page__section">
        <h2>Как создать доску?</h2>
        <p>
          Перейдите в раздел "Мои доски" и нажмите кнопку "Создать доску". 
          Введите название и описание, выберите тип доски (публичная или приватная).
        </p>
      </section>

      <section class="static-page__section">
        <h2>Как добавить изображения?</h2>
        <p>
          Откройте нужную доску и нажмите "Добавить изображения". 
          Вы можете загрузить файлы с устройства или вставить URL изображения.
        </p>
      </section>

      <section class="static-page__section">
        <h2>Как искать изображения?</h2>
        <p>
          Используйте поле поиска на странице доски. 
          Вы можете искать по названию или фильтровать по тегам.
        </p>
      </section>

      <section class="static-page__section">
        <h2>Связаться с нами</h2>
        <p>
          Если у вас остались вопросы, напишите нам на 
          <a href="mailto:support@snapboard.app">support@snapboard.app</a>
        </p>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
useHead({
  title: 'Помощь - SnapBoard'
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.static-page
  min-height: 100vh
  background: $gray-50
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
    color: $text-light
    margin-bottom: 32px

  &__section
    background: white
    border-radius: $radius-lg
    padding: 32px
    margin-bottom: 24px

    h2
      font-size: 20px
      font-weight: 600
      color: $text-light
      margin-bottom: 16px

    p
      color: $gray-600
      line-height: 1.7

    a
      color: $primary-color
      text-decoration: none
      
      &:hover
        text-decoration: underline
</style>
