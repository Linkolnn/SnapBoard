<template>
  <div class="tag-filter">
    <div class="tag-filter__header">
      <span class="tag-filter__title">{{ title }}</span>
      <button
        v-if="selectedTags.length > 0"
        class="tag-filter__clear"
        @click="clearTags"
      >
        Сбросить
      </button>
    </div>
    
    <div class="tag-filter__tags">
      <button
        v-for="tag in displayedTags"
        :key="tag"
        class="tag-filter__tag"
        :class="{ 'tag-filter__tag--active': selectedTags.includes(tag) }"
        @click="toggleTag(tag)"
      >
        #{{ tag }}
      </button>
      
      <button
        v-if="hasMoreTags"
        class="tag-filter__more"
        @click="showAll = !showAll"
      >
        {{ showAll ? 'Свернуть' : `+${hiddenTagsCount} ещё` }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  tags: string[]
  selectedTags: string[]
  title?: string
  maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Теги',
  maxVisible: 8
})

const emit = defineEmits<{
  'update:selectedTags': [tags: string[]]
  'toggle': [tag: string]
}>()

const showAll = ref(false)

const displayedTags = computed(() => {
  if (showAll.value || props.tags.length <= props.maxVisible) {
    return props.tags
  }
  return props.tags.slice(0, props.maxVisible)
})

const hasMoreTags = computed(() => props.tags.length > props.maxVisible)

const hiddenTagsCount = computed(() => 
  props.tags.length - props.maxVisible
)

const toggleTag = (tag: string) => {
  emit('toggle', tag)
}

const clearTags = () => {
  // Clear all selected tags by toggling each one off
  props.selectedTags.forEach(tag => emit('toggle', tag))
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.tag-filter
  &__header
    display: flex
    justify-content: space-between
    align-items: center
    margin-bottom: 12px

  &__title
    font-size: 14px
    font-weight: 600
    color: $text-light

  &__clear
    background: none
    border: none
    color: $primary-color
    font-size: 13px
    cursor: pointer

    &:hover
      text-decoration: underline

  &__tags
    display: flex
    flex-wrap: wrap
    gap: 8px

  &__tag
    padding: 6px 12px
    background: $gray-100
    border: 2px solid transparent
    border-radius: $radius-full
    font-size: 13px
    font-weight: 500
    color: $gray-600
    cursor: pointer
    transition: all $transition-fast

    &:hover
      background: $gray-200

    &--active
      background: rgba($primary-color, 0.1)
      border-color: $primary-color
      color: $primary-color

  &__more
    padding: 6px 12px
    background: transparent
    border: 2px dashed $gray-300
    border-radius: $radius-full
    font-size: 13px
    color: $gray-500
    cursor: pointer
    transition: all $transition-fast

    &:hover
      border-color: $primary-color
      color: $primary-color
</style>
