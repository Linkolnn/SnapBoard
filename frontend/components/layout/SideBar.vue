<template>
    <aside class="app-sidebar">
        <header class="app-sidebar__header">
            <h3 class="app-sidebar__title">
                title
            </h3>
        </header>
        <div class="app-sidebar__content">
            <slot></slot>
        </div>
    </aside>
</template>
<script setup lang="ts">

interface Props {
    title?: string
}

withDefaults(defineProps<Props>(), {
    title: 'Фильтры'
});
</script>
<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.app-sidebar
  // Ширина sidebar
  width: 280px
  min-width: 280px
  background: white
  border-radius: $radius
  padding: 24px
  height: fit-content
  position: sticky
  top: 80px // отступ от header (16px padding * 2 + 24px logo height + margin)
  
  // На планшетах делаем уже
  @include laptop
    width: 240px
    min-width: 240px
  
  // На мобильных скрываем
  @include tablet
    display: none
  
  // Шапка sidebar
  &__header
    margin-bottom: 24px
    padding-bottom: 16px
    border-bottom: 1px solid $gray-200
  
  &__title
    font-size: 20px
    font-weight: 700
    color: $text-light
    margin: 0
  
  // Контент sidebar
  &__content
    display: flex
    flex-direction: column
    gap: 16px
</style>