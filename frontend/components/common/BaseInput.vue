<template>
    <article class="base-inp">
        <label v-if="label" :for="inpId" class="base-inp__label">
            {{ label }}
            <span v-if="required" class="base-inp__required">*</span>
        </label>
        <div class="base-inp__wrapper" :class="{ 'base-inp__wrapper--has-action': $slots.action }">
            <input 
                :id="inpId"
                :type="type" 
                :value="modelValue"
                :placeholder="placeholder"
                :disabled="disabled"
                :maxlength="maxlength"
                :class="['base-inp__field', { 'base-inp__field--error': error, 'base-inp__field--has-action': $slots.action }]"
                @input="handleInp"
                @blur="handleBlur"
                @keydown.enter="$emit('enter')"
            />

            <div v-if="$slots.icon" class="base-inp__icon">
                <slot name="icon"></slot>
            </div>

            <div v-if="$slots.action" class="base-inp__action">
                <slot name="action"></slot>
            </div>
        </div>
        
        <p v-if="error" class="base-inp__error">{{ error }}</p>

        <p v-if="hint && !error" class="base-inp__hint">
            {{ hint }}
        </p>
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
    maxlength?: number
};

withDefaults(defineProps<Props>(), {
    type: 'text',
    label: '',
    placeholder: '',
    error: '',
    hint: '',
    disabled: false,
    required: false,
    maxlength: undefined
});

const emit = defineEmits<{
    'update:modelValue': [value: string]
    blur: []
    enter: []
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
    color: var(--text-primary)
  
  // Звёздочка для обязательных полей
  &__required
    color: var(--error-color)
    margin-left: 4px

  // Обёртка для input и иконки
  &__wrapper
    position: relative
    display: flex
    align-items: stretch

    &--has-action
      gap: 8px

  // Само поле ввода
  &__field
    flex: 1
    padding: 10px 16px
    font-size: 15px
    border: 2px solid var(--input-border)
    border-radius: $radius-sm
    background: var(--input-bg)
    color: var(--text-primary)
    transition: all $transition-normal
    
    // Placeholder стили
    &::placeholder
      color: var(--text-muted)
    
    // Фокус - подсвечиваем зелёным
    &:focus
      outline: none
      border-color: var(--input-focus-border)
      box-shadow: 0 0 0 3px var(--accent-light)
    
    // Если есть ошибка - красная рамка
    &--error
      border-color: var(--error-color)
      
      &:focus
        box-shadow: 0 0 0 3px var(--error-light)
    
    // Заблокированное поле
    &:disabled
      background: var(--bg-tertiary)
      cursor: not-allowed
      opacity: 0.6

  // Иконка внутри поля (например, поиск или глаз для пароля)
  &__icon
    position: absolute
    right: 16px
    top: 50%
    transform: translateY(-50%)
    display: flex
    align-items: center
    color: var(--text-muted)
    pointer-events: none // иконка не перехватывает клики

  // Слот для кнопки действия справа от инпута
  &__action
    display: flex
    align-items: center
    flex-shrink: 0

  // Сообщение об ошибке под полем
  &__error
    display: block
    margin-top: 8px
    font-size: 13px
    color: var(--error-color)

  // Подсказка под полем
  &__hint
    display: block
    margin-top: 8px
    font-size: 13px
    color: var(--text-muted)
</style>