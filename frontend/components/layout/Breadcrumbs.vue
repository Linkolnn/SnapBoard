<template>
    <nav class="breadcrumbs" aria-label="Breadcrumb navigation">
        <ol class="breadcrumbs__list">
            <li 
                v-for="(crumb, index) in crumbs"
                :key="crumb.link"
                class="breadcrumbs__item"
            >
                <NuxtLink
                    v-if="index < crumbs.length - 1"
                    :to="crumb.link"
                    class="breadcrumbs__link"
                >
                    {{ crumb.text }}
                </NuxtLink>

                <p v-else class="breadcrumbs__current">
                    {{ crumb.text }}
                </p>

                <p 
                    v-if="index < crumbs.length - 1"
                    class="breadcrumbs__separator"
                >
                    /
                </p>
            </li>
        </ol>
    </nav>
</template>
<script setup lang="ts">

interface Breadcrumb {
    link: string
    text: string
}

interface Props {
    crumbs: Breadcrumb[]
}

defineProps<Props>()
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.breadcrumbs
  margin-bottom: 24px
  
  // Список крошек - горизонтальный
  &__list
    display: flex
    align-items: center
    gap: 8px
    list-style: none
    flex-wrap: wrap
  
  &__item
    display: flex
    align-items: center
    gap: 8px
    font-size: 14px
  
  // Ссылка на предыдущие страницы
  &__link
    color: $gray-500
    text-decoration: none
    transition: color $transition-fast
    
    &:hover
      color: $primary-color
  
  // Текущая страница - жирный текст
  &__current
    color: $text-light
    font-weight: 600
  
  // Разделитель между крошками
  &__separator
    color: $gray-400
    user-select: none
</style>

