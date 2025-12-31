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
          <CommonBaseButton variant="primary" size="sm" @click="goToBoards">
            Создать доску
          </CommonBaseButton>
        </div>
        
        <div v-else class="content-tabs__boards">
          <BoardCard
            v-for="board in boards"
            :key="board.id"
            :board="board"
            @click="goToBoard(board.id)"
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

const router = useRouter()

const goToBoards = () => {
  router.push('/boards')
}

const goToBoard = (boardId: string) => {
  router.push(`/boards/${boardId}`)
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.content-tabs
  background: var(--card-bg)
  border: 1px solid var(--card-border)
  border-radius: $radius-lg
  overflow: hidden
  
  &__header
    display: flex
    border-bottom: 2px solid var(--border-color)
  
  &__tab
    flex: 1
    padding: 16px 24px
    background: none
    border: none
    font-size: 15px
    font-weight: 500
    color: var(--text-secondary)
    cursor: pointer
    transition: all $transition-fast
    display: flex
    align-items: center
    justify-content: center
    gap: 8px
    
    &:hover
      color: var(--text-primary)
      background: var(--bg-hover)
    
    &--active
      color: var(--accent-color)
      border-bottom: 2px solid var(--accent-color)
      margin-bottom: -2px
  
  &__count
    background: var(--bg-tertiary)
    padding: 2px 8px
    border-radius: 12px
    font-size: 13px
    color: var(--text-secondary)
    
    .content-tabs__tab--active &
      background: var(--accent-light)
      color: var(--accent-color)
  
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
      color: var(--text-secondary)
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
