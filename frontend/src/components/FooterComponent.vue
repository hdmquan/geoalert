<script setup>
// import { computed } from "vue"
// import { useRouter } from "vue-router"

// const router = useRouter()
// const links = computed(() =>
//     router.options.routes.map((route) => ({
//         name: route.name,
//         path: route.path
//     }))
// )
// const currentPath = computed(() => router.currentRoute.value.path)
</script>

<template>
    <footer>
        <nav class="bg-white shadow">
            <div class="container mx-auto px-4">
                <div class="flex justify-between items-center h-16">
                    <router-link to="/" class="text-xl font-bold text-theme-primary"
                        >GeoAlert</router-link
                    >
                    <ul class="flex space-x-6"></ul>
                </div>
            </div>
        </nav>
    </footer>
</template>
