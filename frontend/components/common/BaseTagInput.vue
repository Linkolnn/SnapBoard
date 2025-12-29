<template>
  <div class="base-tag-input">
    <div v-if="label || (mode === 'filter' && selectedTags.length > 0)" class="base-tag-input__header">
      <label v-if="label" class="base-tag-input__label">{{ label }}</label>
      <CommonBaseButton
        v-if="mode === 'filter' && selectedTags.length > 0"
        variant="ghost"
        size="sm"
        @click="clearAllTags"
      >
        Сбросить
      </CommonBaseButton>
    </div>
    
    <!-- Режим редактирования (editable) -->
    <div v-if="mode === 'edit'" class="base-tag-input__container base-tag-input__container--edit">
      <span 
        v-for="(tag, index) in modelValue" 
        :key="index"
        class="base-tag-input__tag base-tag-input__tag--editable"
      >
        {{ tag }}
        <button
          v-if="!disabled"
          type="button"
          class="base-tag-input__tag-remove"
          @click="removeTag(index)"
        >
          ✕
        </button>
      </span>
      
      <input
        v-if="!disabled && modelValue.length < maxTags"
        v-model="newTag"
        type="text"
        class="base-tag-input__input"
        :placeholder="placeholder"
        @keydown.enter.prevent="addTag"
        @keydown.comma.prevent="addTag"
        @keydown.backspace="handleBackspace"
      />
    </div>
    
    <!-- Режим фильтрации (filter) -->
    <div v-else class="base-tag-input__container base-tag-input__container--filter">
      <button
        v-for="tag in displayedTags"
        :key="tag"
        class="base-tag-input__tag base-tag-input__tag--selectable"
        :class="{ 'base-tag-input__tag--active': selectedTags.includes(tag) }"
        :disabled="disabled"
        @click="toggleTag(tag)"
      >
        #{{ tag }}
      </button>
      
      <CommonBaseButton
        v-if="hasMoreTags"
        variant="outline"
        size="sm"
        class="base-tag-input__more"
        @click="showAll = !showAll"
      >
        {{ showAll ? 'Свернуть' : `+${hiddenTagsCount} ещё` }}
      </CommonBaseButton>
    </div>
    
    <p v-if="hint && mode === 'edit' && !disabled" class="base-tag-input__hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  // Общие
  label?: string
  hint?: string
  disabled?: boolean
  mode?: 'edit' | 'filter'
  
  // Для edit режима
  modelValue?: string[]
  placeholder?: string
  maxTags?: number
  
  // Для filter режима
  tags?: string[]
  selectedTags?: string[]
  maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'edit',
  modelValue: () => [],
  placeholder: 'Добавить тег...',
  hint: 'Нажмите Enter или запятую для добавления',
  maxTags: 10,
  disabled: false,
  tags: () => [],
  selectedTags: () => [],
  maxVisible: 8
})

const emit = defineEmits<{
  'update:modelValue': [tags: string[]]
  'update:selectedTags': [tags: string[]]
  'toggle': [tag: string]
}>()

// Edit mode state
const newTag = ref('')

// Filter mode state
const showAll = ref(false)

// Filter mode computed
const displayedTags = computed(() => {
  if (showAll.value || props.tags.length <= props.maxVisible) {
    return props.tags
  }
  return props.tags.slice(0, props.maxVisible)
})

const hasMoreTags = computed(() => props.tags.length > props.maxVisible)

const hiddenTagsCount = computed(() => props.tags.length - props.maxVisible)

// Edit mode methods
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

// Filter mode methods
const toggleTag = (tag: string) => {
  emit('toggle', tag)
}

const clearAllTags = () => {
  props.selectedTags.forEach(tag => emit('toggle', tag))
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.base-tag-input
  &__header
    display: flex
    justify-content: space-between
    align-items: center
    margin-bottom: 8px

  &__label
    font-size: 14px
    font-weight: 500
    color: var(--text-primary)

  &__container
    display: flex
    flex-wrap: wrap
    gap: 8px
    
    &--edit
      padding: 8px 12px
      background: var(--input-bg)
      border: 2px solid var(--input-border)
      border-radius: $radius
      min-height: 48px
      align-items: center
      transition: border-color $transition-fast

      &:focus-within
        border-color: var(--input-focus-border)

    &--filter
      align-items: center

  &__tag
    font-size: 13px
    font-weight: 500
    transition: all $transition-fast
    
    &--editable
      display: inline-flex
      align-items: center
      gap: 4px
      padding: 4px 8px
      background: var(--accent-color)
      color: var(--text-inverse)
      border-radius: $radius-sm

    &--selectable
      padding: 6px 12px
      background: var(--bg-tertiary)
      border: 2px solid transparent
      border-radius: $radius-full
      color: var(--text-secondary)
      cursor: pointer

      &:hover:not(:disabled)
        background: var(--bg-hover)

      &:disabled
        opacity: 0.5
        cursor: not-allowed

    &--active
      background: var(--accent-light)
      border-color: var(--accent-color)
      color: var(--accent-color)

  &__tag-remove
    display: flex
    align-items: center
    justify-content: center
    width: 16px
    height: 16px
    background: rgba(255, 255, 255, 0.2)
    border: none
    border-radius: 50%
    color: var(--text-inverse)
    font-size: 10px
    cursor: pointer
    transition: background $transition-fast

    &:hover
      background: rgba(255, 255, 255, 0.4)

  &__input
    flex: 1
    min-width: 120px
    padding: 4px 0
    border: none
    background: transparent
    font-size: 14px
    color: var(--text-primary)

    &:focus
      outline: none

    &::placeholder
      color: var(--text-muted)

  &__more
    border-radius: $radius-full !important
    border-style: dashed !important

  &__hint
    margin-top: 6px
    font-size: 12px
    color: var(--text-muted)
</style>
