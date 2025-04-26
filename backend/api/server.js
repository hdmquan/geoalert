import express from "express"
import authRoutes from "./routes/auth.js"
import zoneRoutes from "./routes/zones.js"
import cors from "cors"

const app = express()

// app.use((req, res, next) => {
//     console.log(`[DEBUG] Incoming request:`, req.method, req.url)
//     next()
// })

const port = process.env.PORT || 5001

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/zones", zoneRoutes)

app.get("/ping", (req, res) => {
    res.send("Backend API is running pwd: /ping")
})

app.get("/", (req, res) => {
    res.send("Backend API is running pwd: /")
})

app.listen(port, () => {
    console.log(`API server listening on port ${port}`)
})

export default app
