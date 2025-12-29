<template>
  <div class="content-tabs">
    <div class="content-tabs__header">
      <button
        class="content-tabs__tab"
        :class="{ 'content-tabs__tab--active': activeTab === 'boards' }"
        @click="$emit('update:activeTab', 'boards')"
      >
        📋 Мои доски
        <span class="content-tabs__count">{{ boards.length }}</span>
      </button>
      
      <button
        class="content-tabs__tab"
        :class="{ 'content-tabs__tab--active': activeTab === 'images' }"
        @click="$emit('update:activeTab', 'images')"
      >
        🖼️ Мои изображения
        <span class="content-tabs__count">{{ images.length }}</span>
      </button>
    </div>
    
    <div class="content-tabs__content">
      <CommonBaseLoader v-if="isLoading" />
      
      <template v-else-if="activeTab === 'boards'">
        <div v-if="boards.length === 0" class="content-tabs__empty">
          <span class="content-tabs__empty-icon">📋</span>
          <p>У вас пока нет досок</p>
          <CommonBaseButton variant="primary" size="sm" @click="$emit('create-board')">
            Создать доску
          </CommonBaseButton>
        </div>
        
        <div v-else class="content-tabs__boards">
          <BoardCard
            v-for="board in boards"
            :key="board.id"
            :board="board"
            @click="navigateTo(`/boards/${board.id}`)"
          />
        </div>
      </template>
      
      <template v-else-if="activeTab === 'images'">
        <div v-if="images.length === 0" class="content-tabs__empty">
          <span class="content-tabs__empty-icon">🖼️</span>
          <p>У вас пока нет изображений</p>
          <CommonBaseButton variant="primary" size="sm" @click="$emit('upload')">
            Загрузить изображение
          </CommonBaseButton>
        </div>
        
        <ImageMasonryGrid
          v-else
          :images="images"
          @image-click="$emit('image-click', $event)"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Board } from '~/types/board'
import type { Image } from '~/types/image'

interface Props {
  activeTab: 'boards' | 'images'
  boards: Board[]
  images: Image[]
  isLoading: boolean
}

defineProps<Props>()

defineEmits<{
  'update:activeTab': [tab: 'boards' | 'images']
  'create-board': []
  'upload': []
  'image-click': [image: Image]
}>()
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.content-tabs
  background: white
  border-radius: $radius-lg
  overflow: hidden
  
  &__header
    display: flex
    border-bottom: 2px solid $gray-100
  
  &__tab
    flex: 1
    padding: 16px 24px
    background: none
    border: none
    font-size: 15px
    font-weight: 500
    color: $gray-500
    cursor: pointer
    transition: all $transition-fast
    display: flex
    align-items: center
    justify-content: center
    gap: 8px
    
    &:hover
      color: $text-light
      background: $gray-50
    
    &--active
      color: $primary-color
      border-bottom: 2px solid $primary-color
      margin-bottom: -2px
  
  &__count
    background: $gray-100
    padding: 2px 8px
    border-radius: 12px
    font-size: 13px
    
    .content-tabs__tab--active &
      background: rgba($primary-color, 0.1)
      color: $primary-color
  
  &__content
    padding: 24px
    min-height: 200px
    
    @include mobile
      padding: 16px
  
  &__empty
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    gap: 12px
    padding: 48px 24px
    text-align: center
    
    p
      color: $gray-500
      font-size: 15px
  
  &__empty-icon
    font-size: 48px
    opacity: 0.5
  
  &__boards
    display: grid
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))
    gap: 16px
    
    @include mobile
      grid-template-columns: repeat(2, 1fr)
      gap: 12px
</style>
