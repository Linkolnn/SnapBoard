<template>
  <div 
    class="profile-avatar" 
    :class="[`profile-avatar--${size}`, { 'profile-avatar--editable': editable }]"
    @click="handleClick"
  >
    <img 
      v-if="src" 
      :src="src" 
      :alt="name"
      class="profile-avatar__image"
    />
    <span v-else class="profile-avatar__initials">
      {{ initials }}
    </span>
    
    <div v-if="editable" class="profile-avatar__overlay">
      <span class="profile-avatar__edit-icon">📷</span>
    </div>
    
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="profile-avatar__input"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  src?: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'lg',
  editable: false
})

const emit = defineEmits<{
  change: [file: File]
  error: [message: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

const initials = computed(() => {
  return props.name.charAt(0).toUpperCase()
})

const handleClick = () => {
  if (props.editable && fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return
  
  // Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    emit('error', 'Поддерживаются только форматы JPEG, PNG и WebP')
    input.value = ''
    return
  }
  
  // Validate size
  if (file.size > MAX_SIZE) {
    emit('error', 'Размер файла не должен превышать 5MB')
    input.value = ''
    return
  }
  
  emit('change', file)
  input.value = ''
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'

.profile-avatar
  position: relative
  border-radius: 50%
  overflow: hidden
  background: $primary-color
  display: flex
  align-items: center
  justify-content: center
  flex-shrink: 0
  
  &--sm
    width: 40px
    height: 40px
    font-size: 16px
  
  &--md
    width: 64px
    height: 64px
    font-size: 24px
  
  &--lg
    width: 96px
    height: 96px
    font-size: 36px
  
  &--xl
    width: 128px
    height: 128px
    font-size: 48px
  
  &--editable
    cursor: pointer
    
    &:hover .profile-avatar__overlay
      opacity: 1
  
  &__image
    width: 100%
    height: 100%
    object-fit: cover
  
  &__initials
    color: white
    font-weight: 700
  
  &__overlay
    position: absolute
    inset: 0
    background: rgba(0, 0, 0, 0.5)
    display: flex
    align-items: center
    justify-content: center
    opacity: 0
    transition: opacity $transition-fast
  
  &__edit-icon
    font-size: 24px
  
  &__input
    display: none
</style>
