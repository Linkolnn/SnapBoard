<template>
  <!-- Страница регистрации использует auth layout -->
  <AuthRegisterForm />
</template>

<script setup lang="ts">
/**
 * Мета-данные страницы
 * - layout: 'auth' - используем auth layout вместо default
 * - middleware: 'guest' - только для неавторизованных пользователей
 */
definePageMeta({
  layout: 'auth',
})

/**
 * SEO заголовки страницы
 */
useHead({
  title: 'Регистрация - SnapBoard',
  meta: [
    { name: 'description', content: 'Создайте аккаунт SnapBoard' }
  ]
})
</script>