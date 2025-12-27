<template>
  <!-- Страница входа использует auth layout -->
  <AuthLoginForm />
</template>

<script setup lang="ts">
/**
 * Мета-данные страницы
 * - layout: 'auth' - используем auth layout вместо default
 * - middleware: 'guest' - только для неавторизованных пользователей
 */
definePageMeta({
  layout: 'auth'
})

/**
 * SEO заголовки страницы
 */
useHead({
  title: 'Вход - SnapBoard',
  meta: [
    { name: 'description', content: 'Войдите в свой аккаунт SnapBoard' }
  ]
})
</script>