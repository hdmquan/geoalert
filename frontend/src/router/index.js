import { createRouter, createWebHistory } from "vue-router"
import Home from "../views/HomeView.vue"
import Dashboard from "../views/DashboardView.vue"
import Login from "../views/LoginView.vue"

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home
    },
    {
        path: "/app",
        name: "Dashboard",
        component: Dashboard,
        meta: {
            requiresAuth: true,
            layout: "dashboard"
        }
    },
    {
        path: "/login",
        name: "Login",
        component: Login
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        // Always scroll to top when navigating
        return { top: 0 }
    }
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem("token")

    if (to.meta.requiresAuth && !token) {
        next("/login")
    } else {
        next()
    }
})

export default router
