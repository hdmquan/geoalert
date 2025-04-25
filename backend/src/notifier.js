import { pool } from "./database.js"

/**
 * Check which users' zones intersect with the given events and send notifications
 * @param {Array} events - Array of processed event objects with geometry data
 */
async function notifyUsers(events) {
    try {
        // Skip if no events
        if (!events || events.length === 0) {
            console.log("No events to process for notifications")
            return []
        }

        const notifications = []

        for (const event of events) {
            // Skip events without geometry
            if (!event.geometry || !event.geometry.lat || !event.geometry.lng) {
                console.log(`Skipping event without valid geometry: ${event.id}`)
                continue
            }

            // Find users whose zones intersect with this event
            const intersectingUsers = await findIntersectingUsers(event)

            // Process each match
            for (const user of intersectingUsers) {
                // Record the alert
                const alertRecord = await recordAlert(user.id, event.id, user.zone_id)

                sendEmail(user, event)

                notifications.push({
                    user,
                    event,
                    alertRecord
                })
            }
        }

        console.log(`Processed ${notifications.length} notifications for ${events.length} events`)
        return notifications
    } catch (error) {
        console.error("Error in notifyUsers:", error)
        throw error
    }
}

/**
 * Find users whose zones intersect with the given event
 * @param {Object} event - Event object with geometry data
 * @returns {Array} - Array of user objects with zones that intersect the event
 */
async function findIntersectingUsers(event) {
    const query = `
    SELECT u.id, u.email, u.name, z.id as zone_id, z.event_types
    FROM users u
    JOIN zones z ON u.id = z.user_id
    WHERE ST_Intersects(
      z.geometry,
      ST_SetSRID(ST_MakePoint($1, $2), 4326)
    )
    AND $3 = ANY(z.event_types)
  `

    const values = [event.geometry.lng, event.geometry.lat, event.category]

    const { rows } = await pool.query(query, values)
    return rows
}

/**
 * Record alert in the alerts table
 * @param {Number} userId - User ID
 * @param {Number} eventId - Event ID
 * @param {Number} zoneId - Zone ID
 * @returns {Object} - Created alert record
 */
async function recordAlert(userId, eventId, zoneId) {
    // Check if alert already exists to prevent duplicates
    const checkQuery = `
    SELECT id FROM alerts
    WHERE zone_id = $1 AND event_id = $2
    LIMIT 1
  `

    const { rows: existing } = await pool.query(checkQuery, [zoneId, eventId])

    if (existing.length > 0) {
        console.log(`[SKIP] Alert already exists for zone ${zoneId}, event ${eventId}`)
        return existing[0]
    }

    // Record new alert
    const insertQuery = `
    INSERT INTO alerts (zone_id, event_id, triggered_at)
    VALUES ($1, $2, NOW())
    RETURNING *
  `

    const { rows } = await pool.query(insertQuery, [zoneId, eventId])
    console.log(`Recorded alert: zone ${zoneId}, event ${eventId}`)

    return rows[0]
}

/**
 * Placeholder for email sending functionality
 * Would be implemented with AWS SES in the future
 */
function sendEmail(user, event) {
    console.log(
        `NOTIFICATION: Alert for user ${user.email} about ${event.category} at ${event.location}`
    )
    console.log(`Event details: ${event.status}, last updated: ${event.last_updated_timestamp}`)
}

export { notifyUsers }
