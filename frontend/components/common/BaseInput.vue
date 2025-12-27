<template>
    <article class="base-inp">
        <label v-if="label" :for="inpId" class="base-inp__label">
            {{ label }}
            <span v-if="required" class="base-inp__required">*</span>
        </label>
        <div class="base-inp__wrapper">
            <input 
                :id="inpId"
                :type="type" 
                :value="modelValue"
                :placeholder="placeholder"
                :disabled="disabled"
                :class="['base-inp__field', {'base-inp__field--error': error}]"
                @input="handleInp"
                @blur="handleBlur"
            />

            <div v-if="$slots.icon" class="base-inp__icon">
                <slot name="icon"></slot>
            </div>

            <p v-if="error" class="base-inp__error">{{ error }}</p>

            <p v-if="hint && !error" class="base-inp__hint">
                {{ hint }}
            </p>
        </div>
    </article>
</template>
<script setup lang="ts">

const inpId = `input-${Math.random().toString(36).substr(2,9)}`;

interface Props {
    modelValue: string | number
    type?: string
    label?: string
    placeholder?: string
    error?: string
    hint?: string
    disabled?: boolean
    required?: boolean
};

withDefaults(defineProps<Props>(), {
    type: 'text',
    label: '',
    placeholder: '',
    error: '',
    hint: '',
    disabled: false,
    required: false,
});

const emit = defineEmits<{
    'update:modelValue': [value: string]
    blur: []
}>()

const handleInp = (event: Event) => {
    const target = event.target as HTMLInputElement
    emit('update:modelValue', target.value)
}

const handleBlur = () => {
    emit('blur')
}
</script>
<style lang="sass">
@import '@/assets/styles/variables'

.base-inp
  // Отступ между полями ввода
  margin-bottom: 16px

  // Label над полем
  &__label
    display: block
    margin-bottom: 8px
    font-size: 14px
    font-weight: 600
    color: $text-light
  
  // Звёздочка для обязательных полей
  &__required
    color: $error-color
    margin-left: 4px

  // Обёртка для input и иконки
  &__wrapper
    position: relative
    display: flex
    flex-direction: column

  // Само поле ввода
  &__field
    padding: 10px 16px
    font-size: 16px
    border: 2px solid $gray-300
    border-radius: $radius-sm
    background: white
    transition: all $transition-normal
    
    // Placeholder стили
    &::placeholder
      color: $gray-400
    
    // Фокус - подсвечиваем зелёным
    &:focus
      outline: none
      border-color: $primary-color
      box-shadow: 0 0 0 3px rgba(0, 220, 130, 0.1)
    
    // Если есть ошибка - красная рамка
    &--error
      border-color: $error-color
      
      &:focus
        box-shadow: 0 0 0 3px rgba(255, 68, 68, 0.1)
    
    // Заблокированное поле
    &:disabled
      background: $gray-100
      cursor: not-allowed
      opacity: 0.6

  // Иконка внутри поля (например, поиск или глаз для пароля)
  &__icon
    position: absolute
    right: 16px
    display: flex
    align-items: center
    color: $gray-400
    pointer-events: none // иконка не перехватывает клики

  // Сообщение об ошибке под полем
  &__error
    display: block
    margin-top: 8px
    font-size: 14px
    color: $error-color

  // Подсказка под полем
  &__hint
    display: block
    margin-top: 8px
    font-size: 14px
    color: $gray-400
</style>