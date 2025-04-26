import express from "express"
import { pool } from "../../db/database.js"
import auth from "../middleware/auth.js"

const router = express.Router()

router.get("/ping", (req, res) => {
    res.send("Zones API is running pwd: /zones/ping")
})

router.get("/", auth, async (req, res) => {
    const { rows } = await pool.query(
        "SELECT id, ST_AsGeoJSON(geometry) AS geometry, event_types FROM zones WHERE user_id = $1",
        [req.user.userId]
    )
    res.json(rows)
})

router.post("/", auth, async (req, res) => {
    const { geometry, event_types } = req.body

    try {
        await pool.query(
            "INSERT INTO zones (user_id, geometry, event_types) VALUES ($1, ST_SetSRID(ST_GeomFromGeoJSON($2), 4326), $3)",
            [req.user.userId, JSON.stringify(geometry), event_types]
        )
        res.status(201).json({ message: "Zone saved" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Failed to save zone" })
    }
})

export default router
