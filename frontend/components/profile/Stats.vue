<template>
  <div class="profile-stats">
    <div class="profile-stats__item">
      <span class="profile-stats__value">{{ stats.boardsCount }}</span>
      <span class="profile-stats__label">Досок</span>
    </div>
    
    <div class="profile-stats__divider"></div>
    
    <div class="profile-stats__item">
      <span class="profile-stats__value">{{ stats.imagesCount }}</span>
      <span class="profile-stats__label">Изображений</span>
    </div>
    
    <div class="profile-stats__divider"></div>
    
    <div class="profile-stats__item">
      <span class="profile-stats__value">{{ stats.favoritesCount }}</span>
      <span class="profile-stats__label">Избранных</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserStats } from '~/types/user'

interface Props {
  stats: UserStats
}

defineProps<Props>()
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.profile-stats
  display: flex
  align-items: center
  gap: 24px
  padding: 24px
  background: white
  border-radius: $radius-lg
  
  @include mobile
    gap: 16px
    padding: 16px
    justify-content: space-around
  
  &__item
    display: flex
    flex-direction: column
    align-items: center
    gap: 4px
  
  &__value
    font-size: 28px
    font-weight: 700
    color: $text-light
    
    @include mobile
      font-size: 24px
  
  &__label
    font-size: 14px
    color: $gray-500
    
    @include mobile
      font-size: 12px
  
  &__divider
    width: 1px
    height: 40px
    background: $gray-200
    
    @include mobile
      height: 32px
</style>
