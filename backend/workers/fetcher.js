import cron from "node-cron"
import fetch from "node-fetch"
import * as cheerio from "cheerio"
import { geocodeLocation } from "../utils/geocoder.js"
import { writeEvents, getCache, setCache } from "../db/database.js"
import { notifyUsers } from "./notifier.js"

const url = "https://emergency.vic.gov.au/public/textonly.html"
const CACHE_KEY = "emergency_events"
const CACHE_EXPIRY = 6 * 60 // in seconds

function parseHtmlData(htmlText) {
    const $ = cheerio.load(htmlText)
    const data = []

    $("#textonly-table tbody tr").each((i, elem) => {
        const $row = $(elem)
        const type = $row.find("td").eq(0).text().trim()
        const status = $row.find("td").eq(1).text().trim()
        const location = $row.find("td").eq(2).text().trim()
        const lastUpdatedTimestamp = $row.find(".lastUpdated").text().trim()

        data.push({
            type,
            status,
            location,
            lastUpdatedTimestamp
        })
    })

    return data
}

function parseTimestamp(input) {
    if (!input) return null

    if (/^\d{13}$/.test(input)) {
        const date = new Date(Number(input))
        return isNaN(date.getTime()) ? null : date
    }

    const parsed = Date.parse(input)
    return isNaN(parsed) ? null : new Date(parsed)
}

async function preprocessData(data) {
    const results = await Promise.all(
        data.map(async (item) => {
            const typeParts = item.type.split(" - ").map((part) => part.replace(/\s+/g, " ").trim())
            const category = typeParts[0] || null
            const subcategory = typeParts.slice(1).join(" - ") || null
            const location = item.location.replace(/\s+/g, " ").trim()

            const locationCacheKey = `geo_${location.replace(/\s+/g, "_").toLowerCase()}`
            let geo = await getCache(locationCacheKey)

            if (!geo) {
                geo = await geocodeLocation(location)
                if (geo) {
                    await setCache(locationCacheKey, geo, 24 * 60 * 60)
                }
            }

            const parsedTimestamp = parseTimestamp(item.lastUpdatedTimestamp)
            if (!(parsedTimestamp instanceof Date) || isNaN(parsedTimestamp)) {
                console.warn("⚠️ Skipping event with invalid timestamp:", item.lastUpdatedTimestamp)
                return null
            }

            return {
                category,
                subcategory,
                status: item.status,
                location,
                lastUpdatedTimestamp: parsedTimestamp,
                geometry: geo?.location || null,
                formattedAddress: geo?.formattedAddress || null
            }
        })
    )

    return results.filter(Boolean) // remove skipped events
}

async function fetchData() {
    try {
        const cachedData = await getCache(CACHE_KEY)

        const response = await fetch(url, {
            headers: {
                "Accept-Encoding": "gzip, deflate, br"
            }
        })

        const htmlText = await response.text()
        const data = parseHtmlData(htmlText)

        await setCache(CACHE_KEY, data, CACHE_EXPIRY)

        if (cachedData && JSON.stringify(cachedData) === JSON.stringify(data)) {
            console.log("No changes in data since last fetch")
            return
        }

        const processedData = await preprocessData(data)
        const results = await writeEvents(processedData)

        console.log(`Processed ${results.length} events: `, {
            created: results.filter((r) => r.created).length,
            updated: results.filter((r) => r.updated).length,
            unchanged: results.filter((r) => r.unchanged).length
        })

        const eventsToNotify = results.filter((event) => event.created || event.updated)

        if (eventsToNotify.length > 0) {
            console.log(`Sending notifications for ${eventsToNotify.length} new/updated events`)
            await notifyUsers(eventsToNotify)
        }
    } catch (error) {
        console.error("Error fetching data:", error)
    }
}

// fetchData()

export { fetchData, preprocessData, parseHtmlData }
