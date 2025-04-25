// TODO: Return the entire river instead of just the coordinates
// TODO: Return polygon also (switch to OSMNx instead of Google Maps)
// TODO: Deal with relative locations (e.g. "53km Nne of Licola")
import fetch from "node-fetch"
import dotenv from "dotenv"
dotenv.config()

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
// const test_location = "Genoa River"

export async function geocodeLocation(locationString) {
    const query = `${locationString}, Australia`
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`

    try {
        const response = await fetch(url)
        const data = await response.json()

        if (data.status === "OK" && data.results.length > 0) {
            const result = data.results[0]

            // if (test_location !== undefined) // console.log(result)

            return {
                formattedAddress: result.formatted_address,
                location: result.geometry.location, // { lat, lng }
                types: result.types
                // raw: result,
            }
        } else {
            console.warn(`Google API responded with status: ${data.status}`)
            if (data.error_message) {
                console.warn("Error message from Google:", data.error_message)
            }
            return null
        }
    } catch (error) {
        console.error("Fetch or parsing error:", error)
        return null
    }
}

// geocodeLocation(test_location)
