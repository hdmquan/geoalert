<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const links = computed(() => router.options.routes.filter(r => r.name !== 'Login'))
const currentPath = computed(() => router.currentRoute.value.path)

const { user, isLoggedIn, logout } = useAuth()

const goLogin = () => router.push('/login')
</script>

<template>
    <header>
        <nav class="bg-white shadow">
            <div class="container mx-auto px-4">
                <div class="flex justify-between items-center h-16">
                    <router-link to="/" class="text-xl font-bold text-theme-primary">GeoAlert</router-link>
                    <ul class="flex space-x-6 items-center">
                        <li v-for="link in links" :key="link.name">
                            <router-link 
                                :to="link.path"
                                class="text-gray-600 hover:text-theme-primary transition-colors" 
                                :class="{ 'text-theme-primary font-medium': link.path === currentPath }">
                                {{ link.name }}
                            </router-link>
                        </li>
                        <li v-if="isLoggedIn">
                            <span class="text-gray-700">Hello, {{ user.name }}</span>
                            <button @click="logout" class="ml-2 text-sm text-red-500 hover:underline">Logout</button>
                        </li>
                        <li v-else>
                            <button @click="goLogin" class="text-theme-primary border border-theme-primary px-3 py-1 rounded hover:bg-theme-primary hover:text-white">
                                Sign In
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>
</template>
