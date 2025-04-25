import { jest } from "@jest/globals"

const mockQuery = jest.fn()

jest.unstable_mockModule("../../db/database.js", () => ({
    pool: { query: mockQuery }
}))

const { notifyUsers } = await import("../../workers/notifier.js")

beforeEach(() => {
    mockQuery.mockReset()
})

test("notifyUsers processes a valid event", async () => {
    const testEvent = {
        id: 123,
        category: "Flood",
        status: "Active",
        location: "Test Location",
        last_updated_timestamp: "Now",
        geometry: { lat: -37.0, lng: 149.0 }
    }

    mockQuery.mockResolvedValueOnce({
        rows: [
            {
                id: 1,
                email: "user@example.com",
                name: "Alice",
                zone_id: 42,
                event_types: ["Flood"]
            }
        ]
    })

    mockQuery.mockResolvedValueOnce({ rows: [] })

    mockQuery.mockResolvedValueOnce({
        rows: [{ id: 999, zone_id: 42, event_id: 123 }]
    })

    const logs = []
    const originalLog = console.log
    console.log = (msg) => logs.push(msg)

    const result = await notifyUsers([testEvent])

    expect(result.length).toBe(1)
    expect(result[0].user.email).toBe("user@example.com")
    expect(logs.some((line) => line.includes("NOTIFICATION"))).toBe(true)

    console.log = originalLog
})
