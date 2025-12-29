<template>
  <article class="base-textarea">
    <label v-if="label" :for="textareaId" class="base-textarea__label">
      {{ label }}
      <span v-if="required" class="base-textarea__required">*</span>
    </label>
    <div class="base-textarea__wrapper">
      <textarea
        :id="textareaId"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :rows="rows"
        :maxlength="maxlength"
        :class="['base-textarea__field', { 'base-textarea__field--error': error }]"
        @input="handleInput"
        @blur="$emit('blur')"
      />
      <p v-if="error" class="base-textarea__error">{{ error }}</p>
      <p v-if="hint && !error" class="base-textarea__hint">{{ hint }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
const textareaId = `textarea-${Math.random().toString(36).substr(2, 9)}`

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  rows?: number
  maxlength?: number
}

withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: '',
  error: '',
  hint: '',
  disabled: false,
  required: false,
  rows: 3,
  maxlength: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.base-textarea
  margin-bottom: 16px

  &__label
    display: block
    margin-bottom: 8px
    font-size: 14px
    font-weight: 600
    color: var(--text-primary)

  &__required
    color: var(--error-color)
    margin-left: 4px

  &__wrapper
    position: relative
    display: flex
    flex-direction: column

  &__field
    padding: 12px 16px
    font-size: 15px
    border: 2px solid var(--input-border)
    border-radius: $radius-sm
    background: var(--input-bg)
    color: var(--text-primary)
    transition: all $transition-normal
    resize: vertical
    min-height: 80px
    font-family: inherit

    &::placeholder
      color: var(--text-muted)

    &:focus
      outline: none
      border-color: var(--input-focus-border)
      box-shadow: 0 0 0 3px var(--accent-light)

    &--error
      border-color: var(--error-color)

      &:focus
        box-shadow: 0 0 0 3px var(--error-light)

    &:disabled
      background: var(--bg-tertiary)
      cursor: not-allowed
      opacity: 0.6

  &__error
    display: block
    margin-top: 8px
    font-size: 13px
    color: var(--error-color)

  &__hint
    display: block
    margin-top: 8px
    font-size: 13px
    color: var(--text-muted)
</style>
