<script setup>
import { computed } from "vue"
import { useRouter } from "vue-router"
import { useAuth } from "../composables/useAuth"
import MainButton from "./MainButton.vue"

const router = useRouter()
const links = computed(() => router.options.routes.filter((r) => r.name !== "Login"))
const currentPath = computed(() => router.currentRoute.value.path)

const { isLoggedIn } = useAuth()

const goLogin = () => router.push("/login")
const goDashboard = () => router.push("/app")
</script>

<template>
    <header>
        <nav class="bg-white shadow">
            <div class="container mx-auto px-4">
                <div class="flex justify-between items-center h-16">
                    <router-link to="/" class="text-xl font-bold text-theme-primary"
                        >GeoAlert</router-link
                    >
                    <ul class="flex space-x-6 items-center">
                        <li v-for="link in links" :key="link.name">
                            <router-link
                                :to="link.path"
                                class="text-gray-600 hover:text-theme-primary transition-colors"
                                :class="{
                                    'text-theme-primary font-medium': link.path === currentPath
                                }"
                            >
                                {{ link.name }}
                            </router-link>
                        </li>
                        <li v-if="isLoggedIn">
                            <MainButton btnType="primary" @click="goDashboard">Dashboard</MainButton>
                        </li>
                        <li v-else>
                            <MainButton btnType="primary" @click="goLogin">Sign In</MainButton>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>
</template>
