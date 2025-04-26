import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import path from "path"

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    },
    server: {
        host: true,
        port: 5173,
        proxy: {
            "/api": {
                target: "http://localhost:5001/",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, "/api")
            }
        }
    }
})
