<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="password-modal" @click.self="close">
        <div class="password-modal__content">
          <header class="password-modal__header">
            <h2>Смена пароля</h2>
            <CommonBaseIconButton
              icon="✕"
              variant="ghost"
              size="sm"
              aria-label="Закрыть"
              @click="close"
            />
          </header>
          
          <form class="password-modal__form" @submit.prevent="handleSubmit">
            <CommonBaseInput
              v-model="form.currentPassword"
              type="password"
              label="Текущий пароль"
              placeholder="Введите текущий пароль"
              :error="errors.currentPassword"
              :disabled="isSubmitting"
              required
            />
            
            <CommonBaseInput
              v-model="form.newPassword"
              type="password"
              label="Новый пароль"
              placeholder="Минимум 8 символов"
              :error="errors.newPassword"
              :disabled="isSubmitting"
              required
            />
            
            <CommonBaseInput
              v-model="form.confirmPassword"
              type="password"
              label="Подтверждение пароля"
              placeholder="Повторите новый пароль"
              :error="errors.confirmPassword"
              :disabled="isSubmitting"
              required
            />
            
            <p v-if="error" class="password-modal__error">{{ error }}</p>
            
            <div class="password-modal__actions">
              <CommonBaseButton
                variant="secondary"
                :disabled="isSubmitting"
                @click="close"
              >
                Отмена
              </CommonBaseButton>
              
              <CommonBaseButton
                type="submit"
                variant="primary"
                :loading="isSubmitting"
                :disabled="!isValid"
              >
                Сменить пароль
              </CommonBaseButton>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import type { ChangePasswordDto } from '~/types/user'

interface Props {
  modelValue: boolean
  isSubmitting?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false,
  error: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: ChangePasswordDto]
}>()

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const errors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Reset form when modal opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
    errors.currentPassword = ''
    errors.newPassword = ''
    errors.confirmPassword = ''
  }
})

const validate = (): boolean => {
  let valid = true
  
  if (!form.currentPassword) {
    errors.currentPassword = 'Введите текущий пароль'
    valid = false
  } else {
    errors.currentPassword = ''
  }
  
  if (!form.newPassword) {
    errors.newPassword = 'Введите новый пароль'
    valid = false
  } else if (form.newPassword.length < 8) {
    errors.newPassword = 'Пароль должен содержать минимум 8 символов'
    valid = false
  } else {
    errors.newPassword = ''
  }
  
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Подтвердите пароль'
    valid = false
  } else if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = 'Пароли не совпадают'
    valid = false
  } else {
    errors.confirmPassword = ''
  }
  
  return valid
}

const isValid = computed(() => {
  return (
    form.currentPassword.length > 0 &&
    form.newPassword.length >= 8 &&
    form.newPassword === form.confirmPassword
  )
})

const close = () => {
  if (!props.isSubmitting) {
    emit('update:modelValue', false)
  }
}

const handleSubmit = () => {
  if (!validate()) return
  
  emit('submit', {
    currentPassword: form.currentPassword,
    newPassword: form.newPassword
  })
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.password-modal
  position: fixed
  inset: 0
  z-index: 1000
  display: flex
  align-items: center
  justify-content: center
  padding: 24px
  background: var(--modal-overlay)
  
  &__content
    width: 100%
    max-width: 420px
    background: var(--modal-bg)
    border-radius: $radius-lg
    overflow: hidden
  
  &__header
    display: flex
    align-items: center
    justify-content: space-between
    padding: 20px 24px
    border-bottom: 1px solid var(--border-color)
    
    h2
      font-size: 18px
      font-weight: 600
      color: var(--text-primary)
  
  &__form
    padding: 24px
    display: flex
    flex-direction: column
    gap: 16px
  
  &__error
    color: var(--error-color)
    font-size: 14px
    text-align: center
    padding: 8px
    background: var(--error-light)
    border-radius: $radius
  
  &__actions
    display: flex
    gap: 12px
    justify-content: flex-end
    margin-top: 8px

// Transitions
.modal-enter-active,
.modal-leave-active
  transition: opacity 0.2s ease

.modal-enter-from,
.modal-leave-to
  opacity: 0
  
  .password-modal__content
    transform: scale(0.95)
</style>
