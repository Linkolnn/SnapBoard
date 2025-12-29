<template>
  <div 
    ref="sentinelElement"
    class="infinite-scroll-sentinel"
    :class="{ 'infinite-scroll-sentinel--hidden': !active }"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  active: true
})

const sentinelElement = ref<HTMLElement | null>(null)

const emit = defineEmits<{
  'mounted': [element: HTMLElement | null]
}>()

watch(sentinelElement, (el) => {
  emit('mounted', el)
}, { immediate: true })

defineExpose({
  element: sentinelElement
})
</script>

<style lang="sass" scoped>
.infinite-scroll-sentinel
  height: 1px
  width: 100%
  
  &--hidden
    display: none
</style>
