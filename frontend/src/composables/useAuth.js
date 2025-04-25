import { ref, computed } from "vue"

const user = ref(JSON.parse(localStorage.getItem("user")))

export function useAuth() {
    const isLoggedIn = computed(() => !!user.value)
    const logout = () => {
        localStorage.removeItem("user")
        user.value = null
    }

    return {
        user,
        isLoggedIn,
        logout
    }
}
