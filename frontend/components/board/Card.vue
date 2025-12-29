<template>
  <article class="board-card" @click="handleClick">
    <div class="board-card__cover">
      <img
        v-if="board.coverImage"
        :src="board.coverImage"
        :alt="board.title"
        class="board-card__img"
        loading="lazy"
      />
      <div v-else class="board-card__placeholder">
        <span class="board-card__placeholder-icon">📋</span>
      </div>
      <span v-if="board.isPrivate" class="board-card__badge">🔒</span>
    </div>
    
    <div class="board-card__content">
      <h3 class="board-card__title">{{ board.title }}</h3>
      <p v-if="board.description" class="board-card__desc">{{ board.description }}</p>
      <div class="board-card__meta">
        <span class="board-card__count">{{ board.imageCount }} изобр.</span>
        <span class="board-card__date">{{ formatDate(board.updatedAt) }}</span>
      </div>
    </div>
    
    <div class="board-card__actions" @click.stop>
      <button class="board-card__action" title="Редактировать" @click="handleEdit">✏️</button>
      <button class="board-card__action board-card__action--danger" title="Удалить" @click="handleDelete">🗑️</button>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Board } from '~/types/board'

interface Props {
  board: Board
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: [board: Board]
  edit: [board: Board]
  delete: [board: Board]
}>()

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

const handleClick = () => emit('click', props.board)
const handleEdit = () => emit('edit', props.board)
const handleDelete = () => emit('delete', props.board)
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.board-card
  position: relative
  background: var(--card-bg)
  border-radius: $radius-lg
  overflow: hidden
  cursor: pointer
  transition: all $transition-normal
  box-shadow: var(--shadow-sm)
  border: 1px solid var(--card-border)
  
  &:hover
    transform: translateY(-4px)
    box-shadow: var(--shadow-lg)
    .board-card__actions
      opacity: 1
  
  &__cover
    position: relative
    width: 100%
    height: 180px
    background: var(--bg-tertiary)
    overflow: hidden
  
  &__img
    width: 100%
    height: 100%
    object-fit: cover
    transition: transform $transition-normal
    .board-card:hover &
      transform: scale(1.05)
  
  &__placeholder
    width: 100%
    height: 100%
    display: flex
    align-items: center
    justify-content: center
    background: var(--bg-tertiary)
    &-icon
      font-size: 48px
      opacity: 0.5
  
  &__badge
    position: absolute
    top: 12px
    left: 12px
    padding: 4px 8px
    background: rgba(0, 0, 0, 0.7)
    color: white
    font-size: 12px
    border-radius: $radius-sm
  
  &__content
    padding: 16px
  
  &__title
    font-size: 18px
    font-weight: 600
    color: var(--text-primary)
    margin-bottom: 8px
    display: -webkit-box
    -webkit-line-clamp: 1
    -webkit-box-orient: vertical
    overflow: hidden
  
  &__desc
    font-size: 14px
    color: var(--text-secondary)
    margin-bottom: 12px
    display: -webkit-box
    -webkit-line-clamp: 2
    -webkit-box-orient: vertical
    overflow: hidden
  
  &__meta
    display: flex
    justify-content: space-between
    align-items: center
    font-size: 13px
    color: var(--text-muted)
  
  &__actions
    position: absolute
    top: 12px
    right: 12px
    display: flex
    gap: 8px
    opacity: 0
    transition: opacity $transition-normal
  
  &__action
    width: 36px
    height: 36px
    border: none
    border-radius: 50%
    background: var(--card-bg)
    cursor: pointer
    display: flex
    align-items: center
    justify-content: center
    font-size: 16px
    transition: all $transition-fast
    box-shadow: var(--shadow-sm)
    
    &:hover
      transform: scale(1.1)
    &--danger:hover
      background: var(--error-color)
</style>
