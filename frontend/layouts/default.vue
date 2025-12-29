<template>
    <div class="layout">
        <LayoutHeader/>
        <main class="layout__main">
            <slot />
        </main>
        <LayoutFooter />
    </div>
</template>
<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.layout
  min-height: 100vh
  display: flex
  flex-direction: column
  background: var(--bg-primary)
  
  // Основной контент - растягивается на всю доступную высоту
  &__main
    flex: 1
    padding: 32px 0
    
    @include mobile
      padding: 24px 0
</style>