import cron from "node-cron";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const url = "https://emergency.vic.gov.au/public/textonly.html";

async function preprocessData(data) {
    const data = await Promise.all(
        data.map(async (item) => {
            const typeParts = item.type
                .split(" - ")
                .map((part) => part.replace(/\s+/g, " ").trim());

            const category = typeParts[0] || null;
            const subcategory = typeParts.slice(1).join(" - ") || null;
            const location = item.location.replace(/\s+/g, " ").trim();

            const geo = await geocodeLocation(location);

            return {
                category,
                subcategory,
                status: item.status,
                location,
                lastUpdatedTimestamp: item.lastUpdatedTimestamp,
                geometry: geo?.location || null,
                formattedAddress: geo?.formattedAddress || null,
            };
        })
    );

    console.log(data);
    return data;
}

async function fetchData() {
    try {
        const response = await fetch(url, {
            headers: {
                "Accept-Encoding": "gzip, deflate, br",
            },
        });

        const htmlText = await response.text();
        const $ = cheerio.load(htmlText);
        const data = [];

        $("#textonly-table tbody tr").each((i, elem) => {
            const $row = $(elem);
            const type = $row.find("td").eq(0).text().trim();
            const status = $row.find("td").eq(1).text().trim();
            const location = $row.find("td").eq(2).text().trim();
            const lastUpdatedTimestamp = $row
                .find(".lastUpdated")
                .text()
                .trim();

            data.push({
                type,
                status,
                location,
                lastUpdatedTimestamp,
            });
        });

        preprocessData(data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

cron.schedule("*/5 * * * *", fetchData);

fetchData();
