<template>
  <div class="sort-select" :class="{ 'sort-select--open': isOpen }">
    <button 
      class="sort-select__trigger"
      @click="toggleDropdown"
    >
      <span class="sort-select__icon">{{ currentOption?.icon }}</span>
      <span class="sort-select__label">{{ currentOption?.label }}</span>
      <span class="sort-select__arrow">▼</span>
    </button>
    
    <Transition name="dropdown">
      <div v-if="isOpen" class="sort-select__dropdown">
        <button
          v-for="option in options"
          :key="option.value"
          class="sort-select__option"
          :class="{ 'sort-select__option--active': modelValue === option.value }"
          @click="selectOption(option.value)"
        >
          <span class="sort-select__option-icon">{{ option.icon }}</span>
          <span class="sort-select__option-label">{{ option.label }}</span>
          <span 
            v-if="modelValue === option.value" 
            class="sort-select__option-check"
          >
            ✓
          </span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { SortOption, SortConfig } from '~/types/search'

interface Props {
  modelValue: SortOption
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: SortOption]
}>()

const isOpen = ref(false)

const options: SortConfig[] = [
  { value: 'newest', label: 'Сначала новые', icon: '🕐' },
  { value: 'oldest', label: 'Сначала старые', icon: '📅' },
  { value: 'title_asc', label: 'По названию (А-Я)', icon: '🔤' },
  { value: 'title_desc', label: 'По названию (Я-А)', icon: '🔠' }
]

const currentOption = computed(() => 
  options.find(opt => opt.value === props.modelValue)
)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (value: SortOption) => {
  emit('update:modelValue', value)
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.sort-select')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.sort-select
  position: relative

  &__trigger
    display: flex
    align-items: center
    gap: 8px
    padding: 10px 16px
    background: white
    border: 2px solid $gray-200
    border-radius: $radius
    font-size: 14px
    color: $text-light
    cursor: pointer
    transition: all $transition-fast

    @include mobile
      width: 100%

    &:hover
      border-color: $gray-300

  &--open &__trigger
    border-color: $primary-color

  &__icon
    font-size: 16px

  &__label
    font-weight: 500

  &__arrow
    font-size: 10px
    color: $gray-400
    transition: transform $transition-fast

  &--open &__arrow
    transform: rotate(180deg)

  &__dropdown
    position: absolute
    top: calc(100% + 8px)
    right: 0
    min-width: 200px
    background: white
    border: 1px solid $gray-200
    border-radius: $radius
    box-shadow: $shadow-lg
    z-index: $z-index-dropdown
    overflow: hidden

    @include mobile
      left: 0

  &__option
    display: flex
    align-items: center
    gap: 12px
    width: 100%
    padding: 12px 16px
    background: transparent
    border: none
    font-size: 14px
    color: $text-light
    cursor: pointer
    transition: background $transition-fast
    text-align: left

    &:hover
      background: $gray-50

    &--active
      background: rgba($primary-color, 0.05)
      color: $primary-color

    &-icon
      font-size: 16px

    &-label
      flex: 1

    &-check
      color: $primary-color
      font-weight: 600

// Анимации
.dropdown-enter-active,
.dropdown-leave-active
  transition: all 0.2s ease

.dropdown-enter-from,
.dropdown-leave-to
  opacity: 0
  transform: translateY(-8px)
</style>
