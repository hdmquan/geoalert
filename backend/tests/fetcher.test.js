import { jest } from "@jest/globals";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const mockGetCache = jest.fn();
const mockSetCache = jest.fn();
const mockGeocodeLocation = jest.fn();

jest.unstable_mockModule("../database.js", () => ({
  getCache: mockGetCache,
  setCache: mockSetCache,
  writeEvents: jest.fn(),
}));

jest.unstable_mockModule("../geocoder.js", () => ({
  geocodeLocation: mockGeocodeLocation,
}));

const { parseHtmlData, preprocessData } = await import("../fetcher.js");
const __dirname = path.dirname(fileURLToPath(import.meta.url));

beforeEach(() => {
  mockGetCache.mockReset();
  mockSetCache.mockReset();
  mockGeocodeLocation.mockReset();
});

test("parseHtmlData correctly extracts event data from HTML", async () => {
  const html = await fs.readFile(path.join(__dirname, "test.html"), "utf-8");

  const result = parseHtmlData(html);

  expect(result).toBeInstanceOf(Array);
  expect(result.length).toBeGreaterThan(0);

  expect(result[0]).toHaveProperty("type");
  expect(result[0]).toHaveProperty("status");
  expect(result[0]).toHaveProperty("location");
  expect(result[0]).toHaveProperty("lastUpdatedTimestamp");
});

test("preprocessData correctly processes event data with geocoding", async () => {
  const geocodeData = JSON.parse(
    await fs.readFile(path.join(__dirname, "geocode.json"), "utf-8"),
  );

  const inputData = [
    {
      type: "Watch and Act - Met - Avoid the Flooded Area",
      status: "Moderate",
      location: "Genoa River",
      lastUpdatedTimestamp: "Today at 12:21 PM",
    },
  ];

  mockGetCache.mockResolvedValue(null);
  mockGeocodeLocation.mockResolvedValue({
    location: geocodeData.geometry.location,
    formattedAddress: geocodeData.formatted_address,
  });

  const result = await preprocessData(inputData);

  expect(result).toBeInstanceOf(Array);
  expect(result.length).toBe(inputData.length);

  expect(result[0]).toHaveProperty("category");
  expect(result[0]).toHaveProperty("subcategory");
  expect(result[0]).toHaveProperty("geometry");
  expect(result[0]).toHaveProperty("formattedAddress");

  expect(mockGeocodeLocation).toHaveBeenCalledWith(inputData[0].location);
});

test("end-to-end parsing and processing using HTML fixture", async () => {
  const html = await fs.readFile(path.join(__dirname, "test.html"), "utf-8");

  const geocodeData = JSON.parse(
    await fs.readFile(path.join(__dirname, "geocode.json"), "utf-8"),
  );

  mockGetCache.mockResolvedValue(null);
  mockGeocodeLocation.mockResolvedValue({
    location: geocodeData.geometry.location,
    formattedAddress: geocodeData.formatted_address,
  });

  const parsedData = parseHtmlData(html);

  const processedData = await preprocessData(parsedData);

  expect(processedData).toBeInstanceOf(Array);
  expect(processedData.length).toBe(parsedData.length);

  expect(processedData[0]).toHaveProperty("category");
  expect(processedData[0]).toHaveProperty("subcategory");
  expect(processedData[0]).toHaveProperty("geometry");
  expect(processedData[0]).toHaveProperty("formattedAddress");
});
