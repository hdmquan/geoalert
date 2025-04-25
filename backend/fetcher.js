import cron from "node-cron";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { geocodeLocation } from "./geocoder.js";
import { writeEvents, getCache, setCache } from "./database.js";

const url = "https://emergency.vic.gov.au/public/textonly.html";
const CACHE_KEY = "emergency_events";
const CACHE_EXPIRY = 5 * 60;

function parseHtmlData(htmlText) {
  const $ = cheerio.load(htmlText);
  const data = [];

  $("#textonly-table tbody tr").each((i, elem) => {
    const $row = $(elem);
    const type = $row.find("td").eq(0).text().trim();
    const status = $row.find("td").eq(1).text().trim();
    const location = $row.find("td").eq(2).text().trim();
    const lastUpdatedTimestamp = $row.find(".lastUpdated").text().trim();

    data.push({
      type,
      status,
      location,
      lastUpdatedTimestamp,
    });
  });

  return data;
}

async function preprocessData(data) {
  const processedData = await Promise.all(
    data.map(async (item) => {
      const typeParts = item.type
        .split(" - ")
        .map((part) => part.replace(/\s+/g, " ").trim());

      const category = typeParts[0] || null;
      const subcategory = typeParts.slice(1).join(" - ") || null;
      const location = item.location.replace(/\s+/g, " ").trim();

      // Cache current location
      const locationCacheKey = `geo_${location.replace(/\s+/g, "_").toLowerCase()}`;

      // Cache first, else
      let geo = await getCache(locationCacheKey);

      if (!geo) {
        geo = await geocodeLocation(location);
        if (geo) {
          await setCache(locationCacheKey, geo, 24 * 60 * 60);
        }
      }

      return {
        category,
        subcategory,
        status: item.status,
        location,
        lastUpdatedTimestamp: item.lastUpdatedTimestamp,
        geometry: geo?.location || null,
        formattedAddress: geo?.formattedAddress || null,
      };
    }),
  );

  return processedData;
}

async function fetchData() {
  try {
    const cachedData = await getCache(CACHE_KEY);

    // curl --compressed https://emergency.vic.gov.au/public/textonly.html
    const response = await fetch(url, {
      headers: {
        "Accept-Encoding": "gzip, deflate, br",
      },
    });

    const htmlText = await response.text();
    const data = parseHtmlData(htmlText);

    // Cache current batch
    await setCache(CACHE_KEY, data, CACHE_EXPIRY);

    if (cachedData && JSON.stringify(cachedData) === JSON.stringify(data)) {
      console.log("No changes in data since last fetch");
      return;
    }

    // Process if changed
    const processedData = await preprocessData(data);
    const results = await writeEvents(processedData);

    console.log(`Processed ${results.length} events: `, {
      created: results.filter((r) => r.created).length,
      updated: results.filter((r) => r.updated).length,
      unchanged: results.filter((r) => r.unchanged).length,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

if (import.meta.url === process.argv[1]) {
  cron.schedule("*/5 * * * *", fetchData);
}

// fetchData();

export { fetchData, preprocessData, parseHtmlData };
