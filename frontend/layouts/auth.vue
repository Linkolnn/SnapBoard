<template>
  <div class="auth-layout">
    <!-- Используем основной Header без поиска -->
    <LayoutHeader :hide-search="true" />

    <main class="auth-layout__main">
      <article class="auth-layout__card">
        <slot />
      </article>
    </main>
    
    <footer class="auth-layout__footer">
      <p>
        <NuxtLink to="/privacy">Конфиденциальность</NuxtLink>
        •
        <NuxtLink to="/terms">Условия использования</NuxtLink>
      </p>
    </footer>
  </div>
</template>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.auth-layout
  min-height: 100vh
  display: flex
  flex-direction: column
  background: linear-gradient(135deg, $gray-100 0%, white 100%)
  
  // Main content
  &__main
    flex: 1
    display: flex
    align-items: center
    justify-content: center
    padding: 48px 24px
    
    @include mobile
      padding: 24px 16px
  
  // Card
  &__card
    background: white
    border-radius: $radius-lg
    box-shadow: $shadow-lg
    padding: 48px
    width: 100%
    max-width: 450px
    
    @include mobile
      padding: 32px 24px
  
  // Footer
  &__footer
    padding: 24px
    text-align: center
    
    p
      font-size: 14px
      color: $gray-500
      margin: 0
    
    a
      color: $gray-500
      text-decoration: none
      transition: color $transition-fast
      
      &:hover
        color: $primary-color
</style>
