<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import axios from "axios"

const email = ref("")
const password = ref("")
const name = ref("")
const isSignup = ref(false)
const router = useRouter()

const toggleMode = () => {
    isSignup.value = !isSignup.value

    email.value = ""
    password.value = ""
    name.value = ""
}

const submit = async () => {
    try {
        if (isSignup.value) {
            // Signup flow
            await axios.post("/api/auth/signup", {
                name: name.value,
                email: email.value,
                password: password.value
            })
            alert("Signup successful! Please login.")
            toggleMode() // Switch to login after signup
        } else {
            // Login flow
            const response = await axios.post("/api/auth/login", {
                email: email.value,
                password: password.value
            })
            const token = response.data.token
            localStorage.setItem("token", token)
            router.push("/app")
        }
    } catch (err) {
        console.error(err)
        alert(err.response?.data?.error || "Something went wrong")
    }
}
</script>

<template>
    <div class="py-8 h-[calc(100vh-8rem)] flex items-center justify-center">
        <div class="max-w-sm mx-auto mt-20 p-6 bg-white shadow rounded">
            <h1 class="text-2xl font-bold mb-4">{{ isSignup ? "Sign Up" : "Login" }}</h1>

            <div v-if="isSignup" class="mb-3">
                <input
                    v-model="name"
                    type="text"
                    placeholder="Name"
                    class="w-full p-2 border rounded"
                />
            </div>

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
                @click="submit"
                class="w-full bg-theme-primary text-white py-2 rounded hover:bg-opacity-90 mb-3"
            >
                {{ isSignup ? "Create Account" : "Login" }}
            </button>

            <button
                @click="toggleMode"
                class="w-full text-sm text-theme-primary hover:underline"
            >
                {{ isSignup ? "Already have an account? Login" : "Don't have an account? Sign up" }}
            </button>
        </div>
    </div>
</template>
