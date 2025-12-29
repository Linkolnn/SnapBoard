<template>
  <div class="search-input" :class="{ 'search-input--focused': isFocused }">
    <div class="search-input__icon">🔍</div>
    
    <input
      ref="inputRef"
      v-model="localQuery"
      type="text"
      class="search-input__field"
      :placeholder="placeholder"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown.enter="handleSubmit"
      @keydown.escape="handleClear"
    />
    
    <button
      v-if="localQuery"
      class="search-input__clear"
      type="button"
      @click="handleClear"
    >
      ✕
    </button>
    
    <div v-if="isLoading" class="search-input__loader"></div>
    
    <!-- Dropdown с историей -->
    <Transition name="dropdown">
      <div 
        v-if="showHistory && history.length > 0" 
        class="search-input__dropdown"
      >
        <div class="search-input__dropdown-header">
          <span>Недавние поиски</span>
          <button 
            class="search-input__dropdown-clear"
            @click.stop="$emit('clear-history')"
          >
            Очистить
          </button>
        </div>
        
        <ul class="search-input__dropdown-list">
          <li 
            v-for="item in history" 
            :key="item.id"
            class="search-input__dropdown-item"
            @click="selectHistoryItem(item.query)"
          >
            <span class="search-input__dropdown-icon">🕐</span>
            <span class="search-input__dropdown-text">{{ item.query }}</span>
            <button
              class="search-input__dropdown-remove"
              @click.stop="$emit('remove-history', item.id)"
            >
              ✕
            </button>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { SearchHistoryItem } from '~/types/search'
import { debounce } from '~/utils/debounce'

interface Props {
  modelValue: string
  placeholder?: string
  isLoading?: boolean
  history?: SearchHistoryItem[]
  debounceMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Поиск изображений...',
  isLoading: false,
  history: () => [],
  debounceMs: 300
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [query: string]
  'clear-history': []
  'remove-history': [id: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const localQuery = ref(props.modelValue)
const isFocused = ref(false)

const showHistory = computed(() => 
  isFocused.value && !localQuery.value && props.history.length > 0
)

// Debounced emit
const debouncedEmit = debounce((value: string) => {
  emit('update:modelValue', value)
  emit('search', value)
}, props.debounceMs)

watch(localQuery, (newValue) => {
  debouncedEmit(newValue)
})

watch(() => props.modelValue, (newValue) => {
  if (newValue !== localQuery.value) {
    localQuery.value = newValue
  }
})

const handleFocus = () => {
  isFocused.value = true
}

const handleBlur = () => {
  setTimeout(() => {
    isFocused.value = false
  }, 200)
}

const handleSubmit = () => {
  emit('search', localQuery.value)
}

const handleClear = () => {
  localQuery.value = ''
  emit('update:modelValue', '')
  emit('search', '')
  inputRef.value?.focus()
}

const selectHistoryItem = (query: string) => {
  localQuery.value = query
  emit('update:modelValue', query)
  emit('search', query)
}

const focus = () => {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.search-input
  position: relative
  display: flex
  align-items: center
  gap: 12px
  padding: 12px 16px
  background: white
  border: 2px solid $gray-200
  border-radius: $radius
  transition: all $transition-fast
  flex: 1

  &--focused
    border-color: $primary-color
    box-shadow: 0 0 0 3px rgba($primary-color, 0.1)

  &__icon
    font-size: 18px
    color: $gray-400
    flex-shrink: 0

  &__field
    flex: 1
    border: none
    background: transparent
    font-size: 15px
    color: $text-light
    outline: none

    &::placeholder
      color: $gray-400

  &__clear
    display: flex
    align-items: center
    justify-content: center
    width: 24px
    height: 24px
    background: $gray-100
    border: none
    border-radius: 50%
    color: $gray-500
    font-size: 12px
    cursor: pointer
    transition: all $transition-fast

    &:hover
      background: $gray-200
      color: $text-light

  &__loader
    width: 20px
    height: 20px
    border: 2px solid $gray-200
    border-top-color: $primary-color
    border-radius: 50%
    animation: spin 0.8s linear infinite

  &__dropdown
    position: absolute
    top: calc(100% + 8px)
    left: 0
    right: 0
    background: white
    border: 1px solid $gray-200
    border-radius: $radius
    box-shadow: $shadow-lg
    z-index: $z-index-dropdown
    overflow: hidden

    &-header
      display: flex
      justify-content: space-between
      align-items: center
      padding: 12px 16px
      border-bottom: 1px solid $gray-100
      font-size: 13px
      color: $gray-500

    &-clear
      background: none
      border: none
      color: $primary-color
      font-size: 13px
      cursor: pointer

      &:hover
        text-decoration: underline

    &-list
      list-style: none
      max-height: 240px
      overflow-y: auto
      margin: 0
      padding: 0

    &-item
      display: flex
      align-items: center
      gap: 12px
      padding: 12px 16px
      cursor: pointer
      transition: background $transition-fast

      &:hover
        background: $gray-50

    &-icon
      font-size: 14px
      color: $gray-400

    &-text
      flex: 1
      font-size: 14px
      color: $text-light

    &-remove
      display: flex
      align-items: center
      justify-content: center
      width: 20px
      height: 20px
      background: transparent
      border: none
      color: $gray-400
      font-size: 10px
      cursor: pointer
      opacity: 0
      transition: all $transition-fast

      &:hover
        color: $error-color

    &-item:hover &-remove
      opacity: 1

// Анимации
.dropdown-enter-active,
.dropdown-leave-active
  transition: all 0.2s ease

.dropdown-enter-from,
.dropdown-leave-to
  opacity: 0
  transform: translateY(-8px)

@keyframes spin
  to
    transform: rotate(360deg)
</style>
