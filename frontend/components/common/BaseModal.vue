<template>
    <Teleport to="body">
        <Transition name="modal">
            <div 
                v-if="modelValue"
                class="modal-overlay"
                @click="handleOverlayClick"
            >
                <article class="modal" @click.stop>
                    <header class="modal__header">
                        <h2 class="modal__title">
                            {{ title }}
                        </h2>
                        <button class="modal__close" @click="close">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </header>
                    <div class="modal__body">
                        <slot></slot>
                    </div>
                    <footer v-if="$slots.footer" class="modal__footer">
                        <slot name="footer"></slot>
                    </footer>
                </article>
            </div>
        </Transition>
    </Teleport>
</template>
<script setup lang="ts">
import { watch } from 'vue';

interface Props {
    modelValue: boolean
    title?: string
};

const props = withDefaults(defineProps<Props>(), {
    title: '',
});

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
}>();

const close = () => {
    emit('update:modelValue', false)
}
const handleOverlayClick = () => {
    close()
};

watch(
    () => props.modelValue,
    (isOpen) => {
        if (isOpen){
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
    }
);
</script>
<style lang="sass" scoped>
@import '@/assets/styles/variables'
@import '@/assets/styles/mixins'

// Затемнённый фон на весь экран
.modal-overlay
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  background: rgba(0, 0, 0, 0.6) // полупрозрачный чёрный
  display: flex
  align-items: center
  justify-content: center
  z-index: $z-index-modal
  padding: 16px

// Само модальное окно
.modal
  background: white
  border-radius: $radius
  max-width: 600px
  width: 100%
  max-height: 90vh // не больше 90% высоты экрана
  overflow-y: auto // прокрутка если контент большой
  box-shadow: $shadow-lg
  
  // На мобильных занимает почти весь экран
  @include mobile
    max-width: 95%
    max-height: 95vh

  // Шапка модального окна
  &__header
    display: flex
    align-items: center
    justify-content: space-between
    padding: 24px
    border-bottom: 1px solid $gray-200

  &__title
    font-size: 24px
    font-weight: 700
    color: $text-light

  // Кнопка закрытия (крестик)
  &__close
    border: 2px solid $primary-color
    width: 40px
    height: 40px
    display: flex
    align-items: center
    justify-content: center
    border-radius: 50%
    color: $primary-color
    background: $background-light
    transition: all $transition-fast
    
    &:hover
        background: $primary-color
        color: $gray-100

  // Контент модального окна
  &__body
    padding: 24px

  // Footer с кнопками
  &__footer
    padding: 24px
    border-top: 1px solid $gray-200
    display: flex
    gap: 16px
    justify-content: flex-end

// Анимации появления/исчезновения модального окна
.modal-enter-active,
.modal-leave-active
  transition: opacity $transition-normal

.modal-enter-from,
.modal-leave-to
  opacity: 0

// Анимация самого окна (масштабирование)
.modal-enter-active .modal,
.modal-leave-active .modal
  transition: transform $transition-normal

.modal-enter-from .modal,
.modal-leave-to .modal
  transform: scale(0.95)
</style>