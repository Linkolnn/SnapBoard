<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// Убираем инициализацию отсюда - она теперь в plugins/auth.client.ts
// app.vue не должен напрямую работать со store при SSR
</script>