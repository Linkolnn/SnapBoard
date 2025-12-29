<template>
  <header class="profile-header">
    <ProfileAvatar
      :src="user.avatar"
      :name="user.name || user.username"
      size="xl"
      :editable="!isEditing"
      @change="$emit('avatar-change', $event)"
      @error="handleAvatarError"
    />
    
    <div class="profile-header__info">
      <h1 class="profile-header__name">{{ user.name || user.username }}</h1>
      <p class="profile-header__email">{{ user.email }}</p>
      <p v-if="user.bio" class="profile-header__bio">{{ user.bio }}</p>
      <p class="profile-header__joined">
        Участник с {{ formatDate(stats.joinedAt) }}
      </p>
      
      <CommonBaseButton
        v-if="!isEditing"
        variant="secondary"
        size="sm"
        class="profile-header__edit-btn"
        @click="$emit('edit')"
      >
        ✏️ Редактировать профиль
      </CommonBaseButton>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { User, UserStats } from '~/types/user'

interface Props {
  user: User
  stats: UserStats
  isEditing: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  edit: []
  'avatar-change': [file: File]
}>()

const handleAvatarError = (message: string) => {
  // TODO: Show toast notification
  console.error('Avatar error:', message)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', { 
    month: 'long', 
    year: 'numeric' 
  })
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.profile-header
  display: flex
  align-items: flex-start
  gap: 32px
  padding: 32px
  background: white
  border-radius: $radius-lg
  
  @include mobile
    flex-direction: column
    align-items: center
    text-align: center
    gap: 20px
    padding: 24px
  
  &__info
    flex: 1
  
  &__name
    font-size: 28px
    font-weight: 700
    color: $text-light
    margin-bottom: 4px
    
    @include mobile
      font-size: 24px
  
  &__email
    font-size: 16px
    color: $gray-500
    margin-bottom: 8px
  
  &__bio
    font-size: 15px
    color: $gray-600
    margin-bottom: 8px
    line-height: 1.5
  
  &__joined
    font-size: 14px
    color: $gray-400
    margin-bottom: 16px
  
  &__edit-btn
    @include mobile
      width: 100%
</style>
