<script setup>
const props = defineProps({
    btnType: String,
    type: {
        type: String,
        default: "button"
    }
})
</script>

<template>
    <button
        :type="type"
        v-if="btnType === 'secondary'"
        class="font-theme-heading bg-theme-secondary px-6 py-2 text-white rounded shadow-md hover:bg-white border-2 border-transparent hover:border-theme-secondary hover:text-theme-secondary cursor-pointer transition duration-200 w-full lg:w-auto mt-4 lg:mt-0 focus:outline-none"
    >
        <slot></slot>
    </button>
    <button
        :type="type"
        v-else-if="btnType === 'primary'"
        class="font-theme-heading bg-theme-primary px-6 py-2 text-white rounded shadow-md hover:bg-white border-2 border-transparent hover:border-theme-primary hover:text-theme-primary cursor-pointer transition duration-200 w-full lg:w-auto mt-4 lg:mt-0 focus:outline-none"
    >
        <slot></slot>
    </button>
</template>
