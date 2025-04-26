<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"

const email = ref("")
const password = ref("")
const router = useRouter()

// Simulate login (replace with real API later)
const login = () => {
    if (email.value && password.value) {
        const fakeUser = { name: "GeoUser", email: email.value }
        localStorage.setItem("user", JSON.stringify(fakeUser))
        router.push("/dashboard")
    }
}
</script>

<template>
    <div class="max-w-sm mx-auto mt-20 p-6 bg-white shadow rounded">
        <h1 class="text-2xl font-bold mb-4">Sign In / Sign Up</h1>
        <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="w-full mb-3 p-2 border rounded"
        />
        <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="w-full mb-3 p-2 border rounded"
        />
        <button
            @click="login"
            class="w-full bg-theme-primary text-white py-2 rounded hover:bg-opacity-90"
        >
            Login
        </button>
    </div>
</template>
