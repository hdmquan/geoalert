import { createRouter, createWebHistory } from "vue-router"
import Home from "../views/Home.vue"
import Dashboard from "../views/Dashboard.vue"
import Login from "../views/Login.vue"

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

export default router
