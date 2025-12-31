<template>
  <form class="image-edit-form" @submit.prevent="handleSubmit">
    <h3 class="image-edit-form__title">Редактировать изображение</h3>
    
    <CommonBaseInput
      v-model="form.title"
      label="Название"
      placeholder="Введите название..."
      :disabled="isSubmitting"
    />
    
    <CommonBaseTextarea
      v-model="form.description"
      label="Описание"
      placeholder="Добавьте описание..."
      :rows="3"
      :disabled="isSubmitting"
    />
    
    <div class="image-edit-form__field">
      <CommonBaseTagInput
        v-model="form.tags"
        mode="edit"
        label="Теги"
        :disabled="isSubmitting"
      />
    </div>
    
    <div class="image-edit-form__actions">
      <CommonBaseButton
        variant="secondary"
        :disabled="isSubmitting"
        full-width
        @click="handleCancel"
      >
        Отмена
      </CommonBaseButton>
      <CommonBaseButton
        type="submit"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        full-width
      >
        {{ isSubmitting ? 'Сохранение...' : 'Сохранить' }}
      </CommonBaseButton>
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
    color: var(--text-primary)
    margin-bottom: 20px

  &__field
    margin-bottom: 16px

  &__actions
    display: flex
    gap: 12px
    margin-top: 24px
</style>
