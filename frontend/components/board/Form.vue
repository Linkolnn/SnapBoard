<template>
  <form class="board-form" @submit.prevent="handleSubmit">
    <h2 class="board-form__title">{{ isEditing ? 'Редактировать доску' : 'Создать доску' }}</h2>
    
    <div class="board-form__field">
      <label for="title" class="board-form__label">Название *</label>
      <input
        id="title"
        v-model="formData.title"
        type="text"
        class="board-form__input"
        :class="{ 'board-form__input--error': errors.title }"
        placeholder="Введите название доски"
        maxlength="100"
      />
      <span v-if="errors.title" class="board-form__error">{{ errors.title }}</span>
    </div>
    
    <div class="board-form__field">
      <label for="description" class="board-form__label">Описание</label>
      <textarea
        id="description"
        v-model="formData.description"
        class="board-form__textarea"
        placeholder="Добавьте описание (необязательно)"
        rows="3"
        maxlength="500"
      ></textarea>
    </div>
    
    <div class="board-form__field board-form__field--checkbox">
      <label class="board-form__checkbox">
        <input v-model="formData.isPrivate" type="checkbox" />
        <span class="board-form__checkbox-mark"></span>
        <span class="board-form__checkbox-text">Приватная доска</span>
      </label>
      <p class="board-form__hint">Приватные доски видны только вам</p>
    </div>
    
    <div class="board-form__actions">
      <button type="button" class="board-form__btn board-form__btn--secondary" @click="handleCancel">
        Отмена
      </button>
      <button type="submit" class="board-form__btn board-form__btn--primary" :disabled="isSubmitting">
        <span v-if="isSubmitting" class="board-form__spinner"></span>
        {{ isEditing ? 'Сохранить' : 'Создать' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { Board, CreateBoardDto, UpdateBoardDto } from '~/types/board'

interface Props {
  board?: Board | null
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  board: null,
  isSubmitting: false
})

const emit = defineEmits<{
  submit: [data: CreateBoardDto | UpdateBoardDto]
  cancel: []
}>()

const isEditing = computed(() => !!props.board)

const formData = reactive({
  title: '',
  description: '',
  isPrivate: false
})

const errors = reactive({
  title: ''
})

watch(() => props.board, (newBoard) => {
  if (newBoard) {
    formData.title = newBoard.title
    formData.description = newBoard.description || ''
    formData.isPrivate = newBoard.isPrivate
  } else {
    formData.title = ''
    formData.description = ''
    formData.isPrivate = false
  }
}, { immediate: true })

const validate = (): boolean => {
  errors.title = ''
  if (!formData.title.trim()) {
    errors.title = 'Название обязательно'
    return false
  }
  if (formData.title.trim().length < 2) {
    errors.title = 'Минимум 2 символа'
    return false
  }
  return true
}

const handleSubmit = () => {
  if (!validate()) return
  emit('submit', {
    title: formData.title.trim(),
    description: formData.description.trim() || undefined,
    isPrivate: formData.isPrivate
  })
}

const handleCancel = () => emit('cancel')
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.board-form
  &__title
    font-size: 24px
    font-weight: 700
    color: $text-light
    margin-bottom: 24px
  
  &__field
    display: flex
    flex-direction: column
    margin-bottom: 20px
    
    &--checkbox
      margin-bottom: 24px
  
  &__label
    display: block
    font-size: 14px
    font-weight: 600
    color: $text-light
    margin-bottom: 8px
  
  &__input, &__textarea
    padding: 12px 16px
    font-size: 15px
    border: 2px solid $gray-200
    border-radius: $radius-sm
    transition: border-color $transition-fast
    
    &:focus
      outline: none
      border-color: $primary-color
    
    &--error
      border-color: $error
  
  &__textarea
    resize: vertical
    min-height: 80px
  
  &__error
    display: block
    font-size: 13px
    color: $error
    margin-top: 6px
  
  &__checkbox
    display: flex
    align-items: center
    gap: 12px
    cursor: pointer
    
    input
      display: none
    
    &-mark
      width: 22px
      height: 22px
      border: 2px solid $gray-300
      border-radius: 6px
      position: relative
      transition: all $transition-fast
      
      &::after
        content: '✓'
        position: absolute
        inset: 0
        display: flex
        align-items: center
        justify-content: center
        font-size: 14px
        color: white
        opacity: 0
        transition: opacity $transition-fast
    
    input:checked + &-mark
      background: $primary-color
      border-color: $primary-color
      &::after
        opacity: 1
    
    &-text
      font-size: 15px
      color: $text-light
  
  &__hint
    font-size: 13px
    color: $gray-400
    margin-top: 6px
    margin-left: 34px
  
  &__actions
    display: flex
    gap: 12px
    justify-content: flex-end
  
  &__btn
    padding: 12px 24px
    font-size: 15px
    font-weight: 600
    border: none
    border-radius: $radius
    cursor: pointer
    transition: all $transition-fast
    display: flex
    align-items: center
    gap: 8px
    
    &--secondary
      background: $gray-100
      color: $text-light
      &:hover
        background: $gray-200
    
    &--primary
      background: $primary-color
      color: white
      &:hover:not(:disabled)
        background: darken($primary-color, 8%)
    
    &:disabled
      opacity: 0.6
      cursor: not-allowed
  
  &__spinner
    width: 16px
    height: 16px
    border: 2px solid rgba(white, 0.3)
    border-top-color: white
    border-radius: 50%
    animation: spin 0.8s linear infinite

@keyframes spin
  to
    transform: rotate(360deg)
</style>
