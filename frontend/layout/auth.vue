<template>
    <div class="auth-layout">
        <header class="auth-layout__header">
            <NuxtLink to="/" class="auth-layout__logo-link">
                <span class="auth-layout__logo-text">SnapBoard</span>
            </NuxtLink>
        </header>

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
  align-items: center
  justify-content: center
  background: linear-gradient(135deg, $gray-100 0%, white 100%)
  padding: 24px
  
  // Header с логотипом
  &__header
    position: absolute
    top: 32px
    left: 32px
    
    @include mobile
      position: static
      margin-bottom: 32px
  
  &__logo
    text-decoration: none
    color: $text-light
    font-weight: 700
    font-size: 24px
    transition: color $transition-fast
    
    &:hover
      color: $primary-color
  
  // Основной контент - центрированная карточка
  &__main
    flex: 1
    display: flex
    align-items: center
    justify-content: center
    width: 100%
  
  // Карточка с формой
  &__card
    background: white
    border-radius: $radius-lg
    box-shadow: $shadow-lg
    padding: 48px
    width: 100%
    max-width: 450px
    
    @include mobile
      padding: 32px
      max-width: 100%
  
  // Footer с ссылками
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