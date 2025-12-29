<template>
  <form class="image-edit-form" @submit.prevent="handleSubmit">
    <h3 class="image-edit-form__title">Редактировать изображение</h3>
    
    <div class="image-edit-form__field">
      <label for="image-title" class="image-edit-form__label">Название</label>
      <input
        id="image-title"
        v-model="form.title"
        type="text"
        class="image-edit-form__input"
        placeholder="Введите название..."
        :disabled="isSubmitting"
      />
    </div>
    
    <div class="image-edit-form__field">
      <label for="image-description" class="image-edit-form__label">Описание</label>
      <textarea
        id="image-description"
        v-model="form.description"
        class="image-edit-form__textarea"
        placeholder="Добавьте описание..."
        rows="3"
        :disabled="isSubmitting"
      ></textarea>
    </div>
    
    <div class="image-edit-form__field">
      <ImageTagInput
        v-model="form.tags"
        label="Теги"
        :disabled="isSubmitting"
      />
    </div>
    
    <div class="image-edit-form__actions">
      <button
        type="button"
        class="image-edit-form__btn image-edit-form__btn--secondary"
        :disabled="isSubmitting"
        @click="handleCancel"
      >
        Отмена
      </button>
      <button
        type="submit"
        class="image-edit-form__btn image-edit-form__btn--primary"
        :disabled="isSubmitting"
      >
        <span v-if="isSubmitting" class="image-edit-form__spinner"></span>
        {{ isSubmitting ? 'Сохранение...' : 'Сохранить' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { Image, UpdateImageDto } from '~/types/image'

interface Props {
  image: Image
  isSubmitting?: boolean
}

interface FormData {
  title: string
  description: string
  tags: string[]
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false
})

const emit = defineEmits<{
  submit: [data: UpdateImageDto]
  cancel: []
}>()

const form = reactive<FormData>({
  title: props.image.title || '',
  description: props.image.description || '',
  tags: [...(props.image.tags || [])]
})

watch(() => props.image, (newImage) => {
  form.title = newImage.title || ''
  form.description = newImage.description || ''
  form.tags = [...(newImage.tags || [])]
}, { deep: true })

const handleSubmit = () => {
  emit('submit', { ...form })
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.image-edit-form
  &__title
    font-size: 18px
    font-weight: 600
    color: $text-light
    margin-bottom: 20px

  &__field
    margin-bottom: 16px

  &__label
    display: block
    font-size: 14px
    font-weight: 500
    color: $text-light
    margin-bottom: 8px

  &__input,
  &__textarea
    width: 100%
    padding: 12px 16px
    font-size: 14px
    border: 2px solid $gray-200
    border-radius: $radius
    background: white
    transition: border-color $transition-fast

    &:focus
      outline: none
      border-color: $primary-color

    &::placeholder
      color: $gray-400

    &:disabled
      background: $gray-100
      cursor: not-allowed

  &__textarea
    resize: vertical
    min-height: 80px

  &__actions
    display: flex
    gap: 12px
    margin-top: 24px

  &__btn
    flex: 1
    padding: 12px 24px
    font-size: 15px
    font-weight: 600
    border: none
    border-radius: $radius
    cursor: pointer
    transition: all $transition-fast
    display: flex
    align-items: center
    justify-content: center
    gap: 8px

    &--primary
      background: $primary-color
      color: white

      &:hover:not(:disabled)
        background: darken($primary-color, 8%)

      &:disabled
        opacity: 0.5
        cursor: not-allowed

    &--secondary
      background: $gray-100
      color: $text-light

      &:hover:not(:disabled)
        background: $gray-200

      &:disabled
        opacity: 0.5
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
