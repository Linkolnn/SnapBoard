<template>
    <article 
        :class="['base-card', {'base-card--clickable': clickable}]"
        @click="handleClick"
    >
        <slot></slot>
    </article>
</template>
<script setup lang="ts">

interface Props {
    clickable?: boolean
};

withDefaults(defineProps<Props>(), {
    clickable: false
});

const emit = defineEmits<{
    click: []
}>();

const handleClick = () => {
    emit('click')
}
</script>
<style lang="sass" scoped>
@import '@/assets/styles/variables'

.base-card
  // Внешний вид
  background: white
  border-radius: $radius
  box-shadow: $shadow-sm
  overflow: hidden // чтобы контент не выходил за скруглённые углы
  transition: all $transition-normal
  
  // Кликабельная карточка
  &--clickable
    cursor: pointer
    
    // При наведении поднимаем и увеличиваем тень
    &:hover
      transform: translateY(-4px)
      box-shadow: $shadow-lg
    
    // При клике возвращаем на место
    &:active
      transform: translateY(-2px)
      box-shadow: $shadow-md
</style>