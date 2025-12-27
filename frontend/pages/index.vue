<template>
  <div class="demo-page">
    <h1>SnapBoard UI Components</h1>
    
    <!-- Секция с кнопками -->
    <section class="demo-section">
      <h2>Buttons</h2>
      <div class="demo-row">
        <CommonBaseButton variant="primary">Primary Button</CommonBaseButton>
        <CommonBaseButton variant="secondary">Secondary Button</CommonBaseButton>
        <CommonBaseButton variant="outline">Outline Button</CommonBaseButton>
        <CommonBaseButton variant="primary" :loading="true">Loading...</CommonBaseButton>
        <CommonBaseButton variant="primary" :disabled="true">Disabled</CommonBaseButton>
      </div>
    </section>
    
    <!-- Секция с полями ввода -->
    <section class="demo-section">
      <h2>Inputs</h2>
      <div class="demo-column">
        <CommonBaseInput
          v-model="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          hint="We'll never share your email"
        />
        <CommonBaseInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="Enter password"
          :required="true"
        />
        <CommonBaseInput
          v-model="error"
          label="Field with error"
          error="This field is required"
        />
      </div>
    </section>
    
    <!-- Секция с карточками -->
    <section class="demo-section">
      <h2>Cards</h2>
      <div class="demo-row">
        <CommonBaseCard>
          <div style="padding: 20px">
            <h3>Static Card</h3>
            <p>This is a simple card</p>
          </div>
        </CommonBaseCard>
        <CommonBaseCard :clickable="true" @click="handleCardClick">
          <div style="padding: 20px">
            <h3>Clickable Card</h3>
            <p>Click me!</p>
          </div>
        </CommonBaseCard>
      </div>
    </section>
    
    <!-- Секция с модальным окном -->
    <section class="demo-section">
      <h2>Modal</h2>
      <CommonBaseButton @click="showModal = true">Open Modal</CommonBaseButton>
      
      <CommonBaseModal v-model="showModal" title="Example Modal">
        <p>This is modal content. You can put anything here.</p>
        
        <template #footer>
          <CommonBaseButton variant="outline" @click="showModal = false">
            Cancel
          </CommonBaseButton>
          <CommonBaseButton variant="primary" @click="showModal = false">
            Confirm
          </CommonBaseButton>
        </template>
      </CommonBaseModal>
    </section>
    
    <!-- Секция с загрузчиком -->
    <section class="demo-section">
      <h2>Loader</h2>
      <div class="demo-row">
        <CommonBaseLoader size="small" />
        <CommonBaseLoader size="medium" />
        <CommonBaseLoader size="large" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">

// Реактивные данные для демонстрации
const email = ref('')
const password = ref('')
const error = ref('')
const showModal = ref(false)

// Обработчик клика по карточке
const handleCardClick = () => {
  alert('Card clicked!')
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/reset'

.demo-page
  padding: 32px
  
  h1
    font-size: 32px
    margin-bottom: 32px
    color: $text-light

.demo-section
  margin-bottom: 48px
  
  h2
    font-size: 24px
    margin-bottom: 24px
    color: $text-light

.demo-row
  display: flex
  gap: 16px
  flex-wrap: wrap

.demo-column
  display: flex
  flex-direction: column
  gap: 16px
  max-width: 400px
</style>