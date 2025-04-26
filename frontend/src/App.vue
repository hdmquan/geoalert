<script setup>
import { useRoute } from 'vue-router'
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';

const route = useRoute()
</script>

<template>
    <Header v-if="route.meta.layout !== 'dashboard'" />

    <router-view />

    <Footer v-if="route.meta.layout !== 'dashboard'" />
</template>

<style scoped></style>
