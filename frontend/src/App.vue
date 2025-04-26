<script setup>
import { useRoute } from "vue-router"
import HeaderComponent from "./components/HeaderComponent.vue"
import FooterComponent from "./components/FooterComponent.vue"

const route = useRoute()
</script>

<template>
    <HeaderComponent v-if="route.meta.layout !== 'dashboard'" />

    <router-view />

    <FooterComponent v-if="route.meta.layout !== 'dashboard'" />
</template>

<style scoped></style>
