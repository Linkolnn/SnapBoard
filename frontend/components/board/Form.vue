<template>
  <form class="board-form" @submit.prevent="handleSubmit">
    <h2 class="board-form__title">{{ isEditing ? 'Редактировать доску' : 'Создать доску' }}</h2>
    
    <BaseInput
      v-model="formData.title"
      label="Название"
      placeholder="Введите название доски"
      :error="errors.title"
      :disabled="isSubmitting"
      :maxlength="100"
      required
    />
    
    <BaseTextarea
      v-model="formData.description"
      label="Описание"
      placeholder="Добавьте описание (необязательно)"
      :rows="3"
      :maxlength="500"
      :disabled="isSubmitting"
    />
    
    <div class="board-form__field board-form__field--checkbox">
      <label class="board-form__checkbox">
        <input v-model="formData.isPrivate" type="checkbox" :disabled="isSubmitting" />
        <span class="board-form__checkbox-mark"></span>
        <span class="board-form__checkbox-text">Приватная доска</span>
      </label>
      <p class="board-form__hint">Приватные доски видны только вам</p>
    </div>
    
    <div class="board-form__actions">
      <BaseButton variant="secondary" :disabled="isSubmitting" @click="handleCancel">
        Отмена
      </BaseButton>
      <BaseButton type="submit" :loading="isSubmitting" :disabled="isSubmitting">
        {{ isEditing ? 'Сохранить' : 'Создать' }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
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
    color: var(--text-primary)
    margin-bottom: 24px
  
  &__field
    &--checkbox
      margin-bottom: 24px
  
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
      border: 2px solid var(--border-color)
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
        color: var(--text-inverse)
        opacity: 0
        transition: opacity $transition-fast
    
    input:checked + &-mark
      background: var(--accent-color)
      border-color: var(--accent-color)
      &::after
        opacity: 1
    
    input:disabled + &-mark
      opacity: 0.5
      cursor: not-allowed
    
    &-text
      font-size: 15px
      color: var(--text-primary)
  
  &__hint
    font-size: 13px
    color: var(--text-muted)
    margin-top: 6px
    margin-left: 34px
  
  &__actions
    display: flex
    gap: 12px
    justify-content: flex-end
</style>
