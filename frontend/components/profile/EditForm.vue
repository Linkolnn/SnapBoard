<template>
  <form class="profile-edit-form" @submit.prevent="handleSubmit">
    <h3 class="profile-edit-form__title">Редактирование профиля</h3>
    
    <CommonBaseInput
      v-model="form.name"
      label="Имя"
      placeholder="Ваше имя"
      :error="errors.name"
      :disabled="isSubmitting"
      required
    />
    
    <CommonBaseTextarea
      v-model="form.bio"
      label="О себе"
      placeholder="Расскажите немного о себе..."
      :rows="3"
      :maxlength="200"
      :disabled="isSubmitting"
      hint="Максимум 200 символов"
    />
    
    <div class="profile-edit-form__actions">
      <CommonBaseButton
        variant="secondary"
        :disabled="isSubmitting"
        @click="$emit('cancel')"
      >
        Отмена
      </CommonBaseButton>
      
      <CommonBaseButton
        type="submit"
        variant="primary"
        :loading="isSubmitting"
        :disabled="!isValid"
      >
        Сохранить
      </CommonBaseButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import type { User, UpdateProfileDto } from '~/types/user'

interface Props {
  user: User
  isSubmitting: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [data: UpdateProfileDto]
  cancel: []
}>()

const form = reactive({
  name: props.user.name || props.user.username || '',
  bio: props.user.bio || ''
})

const errors = reactive({
  name: ''
})

// Sync form with user prop
watch(() => props.user, (newUser) => {
  form.name = newUser.name || newUser.username || ''
  form.bio = newUser.bio || ''
}, { immediate: true })

const validateName = () => {
  if (!form.name.trim()) {
    errors.name = 'Имя обязательно'
    return false
  }
  if (form.name.trim().length < 2) {
    errors.name = 'Имя должно содержать минимум 2 символа'
    return false
  }
  if (form.name.trim().length > 50) {
    errors.name = 'Имя не должно превышать 50 символов'
    return false
  }
  errors.name = ''
  return true
}

const isValid = computed(() => {
  return form.name.trim().length >= 2 && form.name.trim().length <= 50
})

const handleSubmit = () => {
  if (!validateName()) return
  
  emit('submit', {
    name: form.name.trim(),
    bio: form.bio.trim() || undefined
  })
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.profile-edit-form
  display: flex
  flex-direction: column
  gap: 20px
  
  &__title
    font-size: 20px
    font-weight: 600
    color: var(--text-primary)
    margin-bottom: 8px
  
  &__actions
    display: flex
    gap: 12px
    justify-content: flex-end
    margin-top: 8px
</style>
