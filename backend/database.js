import { Pool } from "pg";
import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});

const redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
});

async function getEventByLocationAndCategory(location, category) {
    const query = `
        SELECT * FROM events 
        WHERE location = $1 AND category = $2
        ORDER BY last_updated_timestamp DESC
        LIMIT 1
    `;
    const { rows } = await pool.query(query, [location, category]);
    return rows.length ? rows[0] : null;
}

async function updateEvent(id, event) {
    const query = `
        UPDATE events
        SET status = $1, 
            last_updated_timestamp = $2
        WHERE id = $3
        RETURNING *
    `;
    const { rows } = await pool.query(query, [
        event.status,
        event.lastUpdatedTimestamp,
        id,
    ]);
    return rows[0];
}

async function insertEvent(event) {
    const query = `
        INSERT INTO events (
            category, subcategory, status, location, 
            formatted_address, geometry, last_updated_timestamp
        ) VALUES (
            $1, $2, $3, $4, $5, 
            ST_SetSRID(ST_MakePoint($6, $7), 4326), 
            $8
        )
        RETURNING *
    `;

    const { rows } = await pool.query(query, [
        event.category,
        event.subcategory,
        event.status,
        event.location,
        event.formattedAddress,
        event.geometry?.lng || null,
        event.geometry?.lat || null,
        event.lastUpdatedTimestamp,
    ]);

    return rows[0];
}

async function writeEvents(events) {
    const results = [];

    for (const event of events) {
        const existingEvent = await getEventByLocationAndCategory(
            event.location,
            event.category,
        );

        if (existingEvent) {
            if (existingEvent.status !== event.status) {
                const updated = await updateEvent(existingEvent.id, event);
                results.push({ ...updated, updated: true });
            } else {
                results.push({ ...existingEvent, unchanged: true });
            }
        } else {
            const newEvent = await insertEvent(event);
            results.push({ ...newEvent, created: true });
        }
    }

    return results;
}

async function getCache(key) {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
}

async function setCache(key, data, expireSeconds = 3600) {
    await redis.set(key, JSON.stringify(data), "EX", expireSeconds);
}

export { pool, redis, writeEvents, getCache, setCache };
