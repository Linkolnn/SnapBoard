<template>
  <div class="tag-input">
    <label v-if="label" class="tag-input__label">{{ label }}</label>
    
    <div class="tag-input__tags">
      <span 
        v-for="(tag, index) in modelValue" 
        :key="index"
        class="tag-input__tag"
      >
        {{ tag }}
        <button
          v-if="!disabled"
          type="button"
          class="tag-input__tag-remove"
          @click="removeTag(index)"
        >
          ✕
        </button>
      </span>
      
      <input
        v-if="!disabled && modelValue.length < maxTags"
        v-model="newTag"
        type="text"
        class="tag-input__input"
        :placeholder="placeholder"
        @keydown.enter.prevent="addTag"
        @keydown.comma.prevent="addTag"
        @keydown.backspace="handleBackspace"
      />
    </div>
    
    <p v-if="hint && !disabled" class="tag-input__hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: string[]
  label?: string
  placeholder?: string
  hint?: string
  maxTags?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Добавить тег...',
  hint: 'Нажмите Enter или запятую для добавления',
  maxTags: 10,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [tags: string[]]
}>()

const newTag = ref('')

const addTag = () => {
  const tag = newTag.value.trim().toLowerCase()
  
  if (!tag) return
  if (props.modelValue.includes(tag)) {
    newTag.value = ''
    return
  }
  if (props.modelValue.length >= props.maxTags) return
  
  emit('update:modelValue', [...props.modelValue, tag])
  newTag.value = ''
}

const removeTag = (index: number) => {
  const newTags = [...props.modelValue]
  newTags.splice(index, 1)
  emit('update:modelValue', newTags)
}

const handleBackspace = () => {
  if (newTag.value === '' && props.modelValue.length > 0) {
    removeTag(props.modelValue.length - 1)
  }
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.tag-input
  &__label
    display: block
    font-size: 14px
    font-weight: 500
    color: $text-light
    margin-bottom: 8px

  &__tags
    display: flex
    flex-wrap: wrap
    gap: 8px
    padding: 8px 12px
    background: white
    border: 2px solid $gray-200
    border-radius: $radius
    min-height: 48px
    align-items: center
    transition: border-color $transition-fast

    &:focus-within
      border-color: $primary-color

  &__tag
    display: inline-flex
    align-items: center
    gap: 4px
    padding: 4px 8px
    background: $primary-color
    color: white
    border-radius: $radius-sm
    font-size: 13px
    font-weight: 500

    &-remove
      display: flex
      align-items: center
      justify-content: center
      width: 16px
      height: 16px
      background: rgba(white, 0.2)
      border: none
      border-radius: 50%
      color: white
      font-size: 10px
      cursor: pointer
      transition: background $transition-fast

      &:hover
        background: rgba(white, 0.4)

  &__input
    flex: 1
    min-width: 120px
    padding: 4px 0
    border: none
    background: transparent
    font-size: 14px
    color: $text-light

    &:focus
      outline: none

    &::placeholder
      color: $gray-400

  &__hint
    margin-top: 6px
    font-size: 12px
    color: $gray-400
</style>
