<template>
  <main class="profile-page">
    <div class="profile-page__container">
      <!-- Header with Avatar -->
      <ProfileHeader
        v-if="user && !isEditing"
        :user="user"
        :stats="stats"
        :is-editing="isEditing"
        @edit="startEditing"
        @avatar-change="handleAvatarChange"
      />
      
      <!-- Edit Form -->
      <section v-if="isEditing && user" class="profile-page__section">
        <ProfileEditForm
          :user="user"
          :is-submitting="isSubmitting"
          @submit="handleProfileUpdate"
          @cancel="cancelEditing"
        />
      </section>
      
      <!-- Stats -->
      <ProfileStats v-if="!isEditing" :stats="stats" />
      
      <!-- Content Tabs -->
      <ProfileContentTabs
        v-if="!isEditing"
        v-model:active-tab="activeTab"
        :boards="userBoards"
        :images="userImages"
        :is-loading="isLoadingContent"
        @create-board="showCreateBoard = true"
        @upload="showUpload = true"
        @image-click="handleImageClick"
      />
      
      <!-- Danger Zone -->
      <section v-if="!isEditing" class="profile-page__section profile-page__section--danger">
        <h2>⚠️ Опасная зона</h2>
        <p>Эти действия необратимы. Будьте осторожны.</p>
        
        <div class="profile-page__danger-actions">
          <CommonBaseButton
            variant="secondary"
            @click="showPasswordModal = true"
          >
            🔒 Сменить пароль
          </CommonBaseButton>
          
          <CommonBaseButton
            variant="danger"
            @click="showDeleteModal = true"
          >
            🗑️ Удалить аккаунт
          </CommonBaseButton>
        </div>
      </section>
    </div>
    
    <!-- Modals -->
    <ProfilePasswordModal
      v-model="showPasswordModal"
      :is-submitting="isSubmitting"
      :error="error"
      @submit="handlePasswordChange"
    />
    
    <ProfileDeleteAccountModal
      v-model="showDeleteModal"
      :is-submitting="isSubmitting"
      :error="error"
      @confirm="handleDeleteAccount"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProfile } from '~/composables/useProfile'
import type { UpdateProfileDto, ChangePasswordDto } from '~/types/user'
import type { Image } from '~/types/image'

definePageMeta({
  middleware: ['auth']
})

useHead({
  title: 'Профиль - SnapBoard'
})

const {
  user,
  stats,
  isEditing,
  isSubmitting,
  isLoadingContent,
  userBoards,
  userImages,
  error,
  startEditing,
  cancelEditing,
  updateProfile,
  uploadAvatar,
  changePassword,
  deleteAccount,
  loadUserContent
} = useProfile()

// Local state
const activeTab = ref<'boards' | 'images'>('boards')
const showPasswordModal = ref(false)
const showDeleteModal = ref(false)
const showCreateBoard = ref(false)
const showUpload = ref(false)

// Load user content on mount
onMounted(() => {
  loadUserContent()
})

// Handlers
const handleProfileUpdate = async (data: UpdateProfileDto) => {
  const success = await updateProfile(data)
  if (success) {
    // TODO: Show success toast
  }
}

const handleAvatarChange = async (file: File) => {
  const success = await uploadAvatar(file)
  if (success) {
    // TODO: Show success toast
  }
}

const handlePasswordChange = async (data: ChangePasswordDto) => {
  const success = await changePassword(data)
  if (success) {
    showPasswordModal.value = false
    // TODO: Show success toast
  }
}

const handleDeleteAccount = async (password: string) => {
  const success = await deleteAccount(password)
  if (success) {
    // Redirect happens in composable via logout
    navigateTo('/')
  }
}

const handleImageClick = (image: Image) => {
  // TODO: Open image modal or navigate to image page
  console.log('Image clicked:', image.id)
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

.profile-page
  min-height: 100vh
  background: var(--bg-primary)
  padding: 32px 0

  @include mobile
    padding: 16px 0

  &__container
    max-width: 900px
    margin: 0 auto
    padding: 0 24px
    display: flex
    flex-direction: column
    gap: 24px
    
    @include mobile
      padding: 0 16px
      gap: 16px

  &__section
    background: var(--card-bg)
    border-radius: $radius-lg
    padding: 32px
    border: 1px solid var(--card-border)
    
    @include mobile
      padding: 24px 16px

    h2
      font-size: 20px
      font-weight: 600
      color: var(--text-primary)
      margin-bottom: 16px

    &--danger
      border: 2px solid var(--error-color)
      
      h2
        color: var(--error-color)

      p
        color: var(--text-secondary)
        margin-bottom: 20px
        font-size: 14px

  &__danger-actions
    display: flex
    gap: 12px
    flex-wrap: wrap
    
    @include mobile
      flex-direction: column
</style>
