import express from "express"

const app = express()
const port = process.env.PORT || 5001

app.get("/api/ping", (req, res) => {
    res.json({ message: "Backend is running!" })
})

// Future: app.get("/api/events"), etc.

app.listen(port, () => {
    console.log(`Express server listening on port ${port}`)
})
