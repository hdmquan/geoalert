import express from "express"
import { pool } from "../../db/database.js"
import auth from "../middleware/auth.js"

const router = express.Router()

router.get("/ping", (req, res) => {
    res.send("Zones API is running pwd: /zones/ping")
})

router.get("/", auth, async (req, res) => {
    const { rows } = await pool.query(
        "SELECT id, ST_AsGeoJSON(geometry) AS geometry FROM zones WHERE user_id = $1",
        [req.user.userId]
    )
    res.json(rows)
})

router.post("/", auth, async (req, res) => {
    const { geometry } = req.body

    try {
        // Log the incoming request body for debugging
        console.log("Received geometry:", geometry)
        console.log("User ID:", req.user.userId)

        // Attempt to insert into the database
        await pool.query(
            "INSERT INTO zones (user_id, geometry) VALUES ($1, ST_SetSRID(ST_GeomFromGeoJSON($2), 4326))",
            [req.user.userId, JSON.stringify(geometry)]
        )
        res.status(201).json({ message: "Zone saved" })
    } catch (err) {
        // Log the full error stack and relevant context
        console.error("Error saving zone:", err)
        console.error("Request body:", req.body)
        console.error("User ID:", req.user ? req.user.userId : "No user")

        // Send detailed error info in response (for development only)
        res.status(500).json({
            error: "Failed to save zone",
            message: err.message,
            stack: err.stack,
            requestBody: req.body,
            userId: req.user ? req.user.userId : null
        })
    }
})

export default router
