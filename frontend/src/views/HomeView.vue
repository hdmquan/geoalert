<script setup></script>

<template>
    <div class="py-12 min-h-screen">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-theme-primary mb-4">Welcome to GeoAlert</h1>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                    Stay informed about geological events and natural disasters around the world
                </p>
            </div>

            <div class="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h2 class="text-2xl font-semibold mb-4 text-theme-primary">Real-time Alerts</h2>
                    <p class="text-gray-600 mb-4">
                        Get instant notifications about earthquakes, volcanic activities, and other
                        geological events.
                    </p>
                    <LinkButton
                        href="/app"
                        btnType="primary"
                        class="bg-theme-primary hover:bg-theme-primary-dark text-white"
                    >
                        Go to Dashboard
                    </LinkButton>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
