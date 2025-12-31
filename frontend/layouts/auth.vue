<template>
  <div class="auth-layout">
    <!-- Используем основной Header без поиска -->
    <LayoutHeader :hide-search="true" />

    <main class="auth-layout__main">
      <article class="auth-layout__card">
        <slot />
      </article>
    </main>
    
    <LayoutFooter />
  </div>
</template>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.auth-layout
  min-height: 100vh
  display: flex
  flex-direction: column
  background: var(--bg-secondary)
  
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
    background: var(--card-bg)
    border-radius: $radius-lg
    box-shadow: var(--shadow-lg)
    padding: 48px
    width: 100%
    max-width: 450px
    border: 1px solid var(--card-border)
    
    @include mobile
      padding: 32px 24px
</style>
