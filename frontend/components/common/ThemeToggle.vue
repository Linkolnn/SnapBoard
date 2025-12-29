<template>
  <button 
    class="theme-toggle"
    :class="[`theme-toggle--${size}`, { 'theme-toggle--with-label': showLabel }]"
    @click="handleClick"
    :title="themeName"
    aria-label="Переключить тему"
  >
    <span class="theme-toggle__icon" :class="{ 'theme-toggle__icon--rotating': isAnimating }">
      <template v-if="isDark">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </template>
      <template v-else>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </template>
    </span>
    <span v-if="showLabel" class="theme-toggle__label">
      {{ themeName }}
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showLabel: false
})

const { isDark, themeName, toggleTheme } = useTheme()

const isAnimating = ref(false)

const handleClick = () => {
  isAnimating.value = true
  toggleTheme()
  
  setTimeout(() => {
    isAnimating.value = false
  }, 300)
}
</script>

<style lang="sass" scoped>
.theme-toggle
  display: inline-flex
  align-items: center
  justify-content: center
  gap: 8px
  padding: 8px
  border-radius: 50%
  background: var(--bg-tertiary)
  color: var(--text-primary)
  cursor: pointer
  transition: all 0.2s ease
  
  &:hover
    background: var(--bg-hover)
    color: var(--accent-color)
  
  &--with-label
    border-radius: 20px
    padding: 8px 16px
  
  // Размеры
  &--sm
    padding: 6px
    
    .theme-toggle__icon
      width: 18px
      height: 18px
  
  &--md
    padding: 8px
    
    .theme-toggle__icon
      width: 22px
      height: 22px
  
  &--lg
    padding: 10px
    
    .theme-toggle__icon
      width: 26px
      height: 26px
  
  &__icon
    display: flex
    align-items: center
    justify-content: center
    transition: transform 0.3s ease
    
    svg
      width: 100%
      height: 100%
    
    &--rotating
      transform: rotate(360deg)
  
  &__label
    font-size: 14px
    font-weight: 500
    white-space: nowrap
</style>
