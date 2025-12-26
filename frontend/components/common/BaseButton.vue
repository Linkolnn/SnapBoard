<template>
    <button
        :class="['base-btn', `base-btn--${variant}`, {'base-btn--loading': loading}]"
        :disabled="disabled || loading"
        @click="handleClick"
    >
        <span v-if="loading" class="base-btn base-btn__spinner"></span>
        <span v-if="!loading" class="base-btn__content">
            <slot></slot>            
        </span>
    </button>
</template>
<script setup lang="ts">

interface Props {
    variant?: 'primary' | 'secondary' | 'outline'
    disabled?: boolean
    loading: boolean
}

withDefaults(defineProps<Props>(), {
    variant: 'primary',
    disabled: false,
    loading: false
});

const emit = defineEmits<{
    click: []
}>()

</script>
<style lang="sass">

</style>