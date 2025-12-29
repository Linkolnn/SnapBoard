<template>
  <footer class="app-footer" :class="{ 'app-footer--compact': compact }">
    <div class="app-footer__container">
      <!-- Полная версия footer -->
      <template v-if="!compact">
        <div class="app-footer__content">
          <section class="app-footer__section">
            <h4>SnapBoard</h4>
            <p>Визуальная доска вдохновения</p>
          </section>
          
          <section class="app-footer__section">
            <h4>Навигация</h4>
            <ul class="app-footer__links">
              <li><NuxtLink to="/">Главная</NuxtLink></li>
              <li><NuxtLink to="/boards">Доски</NuxtLink></li>
              <li><NuxtLink to="/about">О проекте</NuxtLink></li>
            </ul>
          </section>
          
          <section class="app-footer__section">
            <h4>Поддержка</h4>
            <ul class="app-footer__links">
              <li><NuxtLink to="/help">Помощь</NuxtLink></li>
              <li><NuxtLink to="/privacy">Конфиденциальность</NuxtLink></li>
              <li><NuxtLink to="/terms">Условия</NuxtLink></li>
            </ul>
          </section>
        </div>
        
        <div class="app-footer__bottom">
          <p>&copy; 2025 SnapBoard. Все права защищены</p>
        </div>
      </template>

      <!-- Компактная версия footer (для auth layout) -->
      <template v-else>
        <p class="app-footer__compact-links">
          <NuxtLink to="/privacy">Конфиденциальность</NuxtLink>
          •
          <NuxtLink to="/terms">Условия использования</NuxtLink>
        </p>
      </template>
    </div>
  </footer>
</template>

<script setup lang="ts">
interface Props {
  compact?: boolean
}

withDefaults(defineProps<Props>(), {
  compact: false
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.app-footer
  background: var(--bg-secondary)
  color: var(--text-primary)
  
  &__container
    max-width: $breakpoint-desktop
    width: 100%
    margin: 0 auto
    padding: 0 24px
    
    @include mobile
      padding: 0 16px

  // Полная версия
  &:not(&--compact)
    padding: 48px 0 24px
    margin-top: 64px
    border-top: 1px solid var(--border-color)

  &__content
    display: grid
    grid-template-columns: repeat(3, 1fr)
    gap: 32px
    margin-bottom: 32px
    
    @include tablet
      grid-template-columns: repeat(2, 1fr)
    
    @include mobile
      grid-template-columns: 1fr

  &__section
    h4
      font-size: 16px
      font-weight: 700
      margin-bottom: 16px
      color: var(--text-primary)
    
    p
      font-size: 14px
      color: var(--text-secondary)
      line-height: 1.6

  &__links
    list-style: none
    display: flex
    flex-direction: column
    gap: 8px
    
    a
      color: var(--text-secondary)
      text-decoration: none
      font-size: 14px
      transition: color $transition-fast
      
      &:hover
        color: var(--accent-color)

  &__bottom
    padding-top: 24px
    border-top: 1px solid var(--border-color)
    text-align: center
    
    p
      font-size: 14px
      color: var(--text-muted)
      margin: 0

  // Компактная версия
  &--compact
    padding: 24px 0
    text-align: center
    background: transparent

  &__compact-links
    font-size: 14px
    color: var(--text-muted)
    margin: 0
    
    a
      color: var(--text-muted)
      text-decoration: none
      transition: color $transition-fast
      
      &:hover
        color: var(--accent-color)
</style>
