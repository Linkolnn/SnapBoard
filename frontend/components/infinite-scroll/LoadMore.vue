<template>
  <div class="load-more">
    <!-- Состояние загрузки -->
    <div v-if="isLoading" class="load-more__loading">
      <div class="load-more__spinner"></div>
      <span class="load-more__text">Загрузка изображений...</span>
    </div>
    
    <!-- Состояние ошибки -->
    <div v-else-if="error" class="load-more__error">
      <div class="load-more__error-icon">⚠️</div>
      <span class="load-more__error-text">{{ error }}</span>
      <button 
        class="load-more__retry-btn"
        @click="$emit('retry')"
      >
        🔄 Повторить
      </button>
    </div>
    
    <!-- Конец списка -->
    <div v-else-if="!hasMore && itemCount > 0" class="load-more__end">
      <div class="load-more__end-line"></div>
      <span class="load-more__end-text">Все изображения загружены</span>
      <div class="load-more__end-line"></div>
    </div>
    
    <!-- Sentinel для Intersection Observer -->
    <InfiniteScrollSentinel 
      v-if="hasMore && !error"
      :active="!isLoading"
      @mounted="handleSentinelMounted"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  isLoading: boolean
  hasMore: boolean
  error: string | null
  itemCount: number
}

defineProps<Props>()

const emit = defineEmits<{
  'retry': []
  'sentinel-mounted': [element: HTMLElement | null]
}>()

const handleSentinelMounted = (element: HTMLElement | null) => {
  emit('sentinel-mounted', element)
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.load-more
  padding: 32px 16px
  display: flex
  flex-direction: column
  align-items: center
  gap: 16px

  &__loading
    display: flex
    flex-direction: column
    align-items: center
    gap: 12px

  &__spinner
    width: 40px
    height: 40px
    border: 3px solid $gray-200
    border-top-color: $primary-color
    border-radius: 50%
    animation: spin 1s linear infinite

  &__text
    font-size: 14px
    color: $gray-500

  &__error
    display: flex
    flex-direction: column
    align-items: center
    gap: 12px
    padding: 24px
    background: rgba($error-color, 0.05)
    border-radius: $radius
    width: 100%
    max-width: 400px

    &-icon
      font-size: 32px

    &-text
      font-size: 14px
      color: $error-color
      text-align: center

  &__retry-btn
    display: flex
    align-items: center
    gap: 8px
    padding: 10px 20px
    background: $primary-color
    color: white
    border: none
    border-radius: $radius
    font-size: 14px
    font-weight: 600
    cursor: pointer
    transition: background $transition-fast

    &:hover
      background: darken($primary-color, 8%)

  &__end
    display: flex
    align-items: center
    gap: 16px
    width: 100%
    max-width: 400px

    &-line
      flex: 1
      height: 1px
      background: $gray-200

    &-text
      font-size: 13px
      color: $gray-400
      white-space: nowrap

@keyframes spin
  to
    transform: rotate(360deg)
</style>
