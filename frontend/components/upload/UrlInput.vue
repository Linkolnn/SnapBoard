<template>
  <div class="url-input">
    <div class="url-input__field">
      <CommonBaseInput
        v-model="url"
        type="url"
        placeholder="Вставьте URL изображения..."
        :disabled="disabled"
        :error="errorMessage"
        @keydown.enter="handleSubmit"
        @update:model-value="clearError"
      />
      
      <CommonBaseButton
        variant="primary"
        :disabled="disabled || !url.trim()"
        :loading="isLoading"
        @click="handleSubmit"
      >
        Добавить
      </CommonBaseButton>
    </div>

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
    align-items: flex-start

    // BaseInput занимает всю доступную ширину
    > :first-child
      flex: 1

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
</style>
