<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="delete-modal" @click.self="close">
        <div class="delete-modal__content">
          <header class="delete-modal__header">
            <span class="delete-modal__icon">⚠️</span>
            <h2>Удаление аккаунта</h2>
          </header>
          
          <div class="delete-modal__body">
            <p class="delete-modal__warning">
              Это действие <strong>необратимо</strong>. Будут удалены:
            </p>
            
            <ul class="delete-modal__list">
              <li>Все ваши доски и изображения</li>
              <li>Все комментарии и избранное</li>
              <li>Ваш профиль и настройки</li>
            </ul>
            
            <p class="delete-modal__confirm-text">
              Для подтверждения введите ваш пароль:
            </p>
            
            <CommonBaseInput
              v-model="password"
              type="password"
              placeholder="Введите пароль"
              :error="error || undefined"
              :disabled="isSubmitting"
            />
          </div>
          
          <footer class="delete-modal__footer">
            <CommonBaseButton
              variant="secondary"
              :disabled="isSubmitting"
              @click="close"
            >
              Отмена
            </CommonBaseButton>
            
            <CommonBaseButton
              variant="danger"
              :loading="isSubmitting"
              :disabled="!password"
              @click="handleDelete"
            >
              Удалить аккаунт
            </CommonBaseButton>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

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
  confirm: [password: string]
}>()

const password = ref('')

// Reset password when modal opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    password.value = ''
  }
})

const close = () => {
  if (!props.isSubmitting) {
    emit('update:modelValue', false)
  }
}

const handleDelete = () => {
  if (password.value) {
    emit('confirm', password.value)
  }
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.delete-modal
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
    max-width: 440px
    background: var(--modal-bg)
    border-radius: $radius-lg
    overflow: hidden
    border: 2px solid var(--error-color)
  
  &__header
    display: flex
    align-items: center
    gap: 12px
    padding: 20px 24px
    background: var(--error-light)
    border-bottom: 1px solid var(--error-color)
    
    h2
      font-size: 18px
      font-weight: 600
      color: var(--error-color)
  
  &__icon
    font-size: 24px
  
  &__body
    padding: 24px
  
  &__warning
    font-size: 15px
    color: var(--text-primary)
    margin-bottom: 16px
    
    strong
      color: var(--error-color)
  
  &__list
    margin: 0 0 20px 20px
    color: var(--text-secondary)
    font-size: 14px
    line-height: 1.8
  
  &__confirm-text
    font-size: 14px
    color: var(--text-secondary)
    margin-bottom: 12px
  
  &__footer
    display: flex
    gap: 12px
    justify-content: flex-end
    padding: 16px 24px
    background: var(--bg-secondary)
    border-top: 1px solid var(--border-color)

// Transitions
.modal-enter-active,
.modal-leave-active
  transition: opacity 0.2s ease

.modal-enter-from,
.modal-leave-to
  opacity: 0
</style>
