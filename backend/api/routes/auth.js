import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { pool } from "../../db/database.js"

const router = express.Router()
const SECRET = process.env.JWT_SECRET || "changeme"

router.post("/signup", async (req, res) => {
    const { email, password, name } = req.body
    const hashed = await bcrypt.hash(password, 10)

    try {
        const exists = await pool.query("SELECT id FROM users WHERE email = $1", [email])
        if (exists.rows.length > 0) return res.status(409).json({ error: "Email exists" })

        await pool.query("INSERT INTO users (name, email, pwd_hash) VALUES ($1, $2, $3)", [
            name,
            email,
            hashed
        ])
        res.status(201).json({ message: "User created" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Internal error" })
    }
})

router.post("/login", async (req, res) => {
    const { email, password } = req.body

    try {
        const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email])
        const user = rows[0]
        if (!user) return res.status(401).json({ error: "Invalid credentials" })

        const match = await bcrypt.compare(password, user.pwd_hash)
        if (!match) return res.status(401).json({ error: "Invalid credentials" })

        const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: "7d" })
        res.json({ token })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Internal error" })
    }
})

export default router
