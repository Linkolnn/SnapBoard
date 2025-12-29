<template>
    <div class="layout">
        <LayoutHeader/>
        <main class="layout__main">
            <slot />
        </main>
        <footer class="layout__footer">
            <div class="layout__container">
                <div class="layout__footer-content">
                    <section class="layout__footer-section">
                        <h4>SnapBoard</h4>
                        <p>Визуальная доска вдохновения</p>
                    </section>
                    
                    <section class="layout__footer-section">
                        <h4>Навигация</h4>
                        <ul class="layout__footer-links">
                        <li><NuxtLink to="/">Главная</NuxtLink></li>
                        <li><NuxtLink to="/boards">Доски</NuxtLink></li>
                        <li><NuxtLink to="/about">О проекте</NuxtLink></li>
                        </ul>
                    </section>
                    
                    <section class="layout__footer-section">
                        <h4>Поддержка</h4>
                        <ul class="layout__footer-links">
                        <li><NuxtLink to="/help">Помощь</NuxtLink></li>
                        <li><NuxtLink to="/privacy">Конфиденциальность</NuxtLink></li>
                        <li><NuxtLink to="/terms">Условия</NuxtLink></li>
                        </ul>
                    </section>
                </div>
                
                <div class="layout__footer-bottom">
                    <p>&copy; 2025 SnapBoard. Все права защищены</p>
                </div>
            </div>
        </footer>
    </div>
</template>
<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.layout
  min-height: 100vh
  display: flex
  flex-direction: column
  background: $gray-100
  
  // Контейнер для ограничения ширины
  &__container
    max-width: $breakpoint-desktop
    width: 100%
    margin: 0 auto
    padding: 0 24px
    
    @include mobile
      padding: 0 16px
  
  // Основной контент - растягивается на всю доступную высоту
  &__main
    flex: 1
    padding: 32px 0
    
    @include mobile
      padding: 24px 0
  
  // Footer
  &__footer
    background: $secondary-color
    color: $text-dark
    padding: 48px 0 24px
    margin-top: 64px
  
  &__footer-content
    display: grid
    grid-template-columns: repeat(3, 1fr)
    gap: 32px
    margin-bottom: 32px
    
    // На планшетах - 2 колонки
    @include tablet
      grid-template-columns: repeat(2, 1fr)
    
    // На мобильных - 1 колонка
    @include mobile
      grid-template-columns: 1fr
  
  &__footer-section
    h4
      font-size: 16px
      font-weight: 700
      margin-bottom: 16px
      color: $text-dark
    
    p
      font-size: 14px
      color: rgba(255, 255, 255, 0.7)
      line-height: 1.6
  
  &__footer-links
    list-style: none
    display: flex
    flex-direction: column
    gap: 8px
    
    a
      color: rgba(255, 255, 255, 0.7)
      text-decoration: none
      font-size: 14px
      transition: color $transition-fast
      
      &:hover
        color: $primary-color
  
  &__footer-bottom
    padding-top: 24px
    border-top: 1px solid rgba(255, 255, 255, 0.1)
    text-align: center
    
    p
      font-size: 14px
      color: rgba(255, 255, 255, 0.5)
      margin: 0
</style>