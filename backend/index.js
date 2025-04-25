import { fetchData } from "./src/fetcher.js"
import cron from "node-cron"

console.log("Running GeoAlert background worker...")

await fetchData()

cron.schedule("*/5 * * * *", async () => {
    console.log("Scheduled fetch...")
    await fetchData()
})
