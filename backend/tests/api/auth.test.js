import request from "supertest"
import { pool } from "../../db/database.js"
import app from "../../api/server.js"
import dotenv from "dotenv"
dotenv.config()

const testEmail = `test+${Date.now()}@example.com`
const testPassword = "password123"
const testName = "Test User"

console.log({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    db: process.env.DB_NAME
})

beforeAll(async () => {
    const client = await pool.connect()
    const { rows } = await client.query(
        "SELECT current_database(), inet_server_addr(), inet_server_port()"
    )
    console.log("✅ Connected to DB:", rows[0])
    client.release()
})

describe("Auth API", () => {
    afterAll(async () => {
        // Clean up test user if it still exists
        await pool.query("DELETE FROM users WHERE email = $1", [testEmail])
        await pool.end()
    })

    test("signup creates a new user", async () => {
        const res = await request(app).post("/api/auth/signup").send({
            name: testName,
            email: testEmail,
            password: testPassword
        })

        expect(res.status).toBe(201)
        expect(res.body.message).toBe("User created")
    })

    test("signup fails for duplicate email", async () => {
        // Run once more with same email
        const res = await request(app).post("/api/auth/signup").send({
            name: testName,
            email: testEmail,
            password: testPassword
        })

        expect(res.status).toBe(409)
        expect(res.body.error).toBeDefined()
    })

    test("login returns a valid token", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: testEmail,
            password: testPassword
        })

        expect(res.status).toBe(200)
        expect(res.body.token).toBeDefined()
        expect(typeof res.body.token).toBe("string")
    })

    test("login fails with incorrect password", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: testEmail,
            password: "wrong-password"
        })

        expect(res.status).toBe(401)
        expect(res.body.error).toBe("Invalid credentials")
    })

    test("login fails with nonexistent email", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: "ghost@void.com",
            password: "anything"
        })

        expect(res.status).toBe(401)
        expect(res.body.error).toBe("Invalid credentials")
    })
})
