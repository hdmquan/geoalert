import jwt from "jsonwebtoken"
const SECRET = process.env.JWT_SECRET || "changeme"

export default function auth(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: "No token" })

    try {
        const token = authHeader.split(" ")[1]
        const payload = jwt.verify(token, SECRET)
        req.user = payload
        next()
    } catch (err) {
        res.status(401).json({ error: "Invalid token" })
    }
}
