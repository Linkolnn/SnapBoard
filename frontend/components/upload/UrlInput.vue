<template>
  <div class="url-input">
    <div class="url-input__field">
      <input
        v-model="url"
        type="url"
        class="url-input__input"
        :class="{ 'url-input__input--error': errorMessage }"
        placeholder="Вставьте URL изображения..."
        :disabled="disabled"
        @keydown.enter="handleSubmit"
        @input="clearError"
      />
      
      <button
        class="url-input__btn"
        :disabled="disabled || !url.trim()"
        @click="handleSubmit"
      >
        <span v-if="isLoading" class="url-input__spinner"></span>
        <span v-else>Добавить</span>
      </button>
    </div>

    <p v-if="errorMessage" class="url-input__error">
      {{ errorMessage }}
    </p>

    <div v-if="previewUrl" class="url-input__preview">
      <img 
        :src="previewUrl" 
        alt="Preview"
        @load="handlePreviewLoad"
        @error="handlePreviewError"
      />
      <button 
        class="url-input__preview-remove"
        @click="clearPreview"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { validateImageUrl } from '~/utils/fileHelpers'

interface Props {
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  submit: [url: string]
}>()

const url = ref('')
const previewUrl = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const clearError = () => {
  errorMessage.value = ''
}

const clearPreview = () => {
  previewUrl.value = ''
  url.value = ''
  clearError()
}

const handleSubmit = async () => {
  if (!url.value.trim() || props.disabled) return

  clearError()
  isLoading.value = true

  try {
    const validation = validateImageUrl(url.value)
    if (!validation.valid) {
      errorMessage.value = validation.error || 'Некорректный URL'
      return
    }

    previewUrl.value = url.value
  } finally {
    isLoading.value = false
  }
}

const handlePreviewLoad = () => {
  emit('submit', url.value)
  clearPreview()
}

const handlePreviewError = () => {
  errorMessage.value = 'Не удалось загрузить изображение по этому URL'
  previewUrl.value = ''
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.url-input
  &__field
    display: flex
    gap: 8px

  &__input
    flex: 1
    padding: 12px 16px
    font-size: 14px
    border: 2px solid $gray-200
    border-radius: $radius
    background: white
    transition: all $transition-fast

    &:focus
      outline: none
      border-color: $primary-color

    &--error
      border-color: $error-color

    &::placeholder
      color: $gray-400

    &:disabled
      background: $gray-100
      cursor: not-allowed

  &__btn
    padding: 12px 24px
    background: $primary-color
    color: white
    border: none
    border-radius: $radius
    font-weight: 600
    cursor: pointer
    transition: all $transition-fast
    display: flex
    align-items: center
    gap: 8px
    white-space: nowrap

    &:hover:not(:disabled)
      background: darken($primary-color, 8%)

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

  &__error
    margin-top: 8px
    font-size: 13px
    color: $error-color

  &__preview
    position: relative
    margin-top: 16px
    border-radius: $radius
    overflow: hidden
    max-width: 200px

    img
      width: 100%
      height: auto
      display: block

    &-remove
      position: absolute
      top: 8px
      right: 8px
      width: 24px
      height: 24px
      background: rgba(0, 0, 0, 0.7)
      color: white
      border: none
      border-radius: 50%
      cursor: pointer
      font-size: 12px
      display: flex
      align-items: center
      justify-content: center

      &:hover
        background: $error-color

@keyframes spin
  to
    transform: rotate(360deg)
</style>
