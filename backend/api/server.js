import express from "express"
import authRoutes from "./routes/auth.js"
import zoneRoutes from "./routes/zones.js"
import cors from "cors"

const app = express()
const port = process.env.PORT || 5001

app.use(cors())
app.use(express.json())

app.use("/api", authRoutes)
app.use("/api", zoneRoutes)

app.listen(port, () => {
    console.log(`API server listening on port ${port}`)
})

export default app
