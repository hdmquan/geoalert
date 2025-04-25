import { jest } from "@jest/globals";

const mockGetCache = jest.fn();
const mockSetCache = jest.fn();
const mockGeocodeLocation = jest.fn();

jest.unstable_mockModule("../database.js", () => ({
    getCache: mockGetCache,
    setCache: mockSetCache,
    writeEvents: jest.fn(), // stub if used
}));

jest.unstable_mockModule("../geocoder.js", () => ({
    geocodeLocation: mockGeocodeLocation,
}));

const { preprocessData } = await import("../fetcher.js");

beforeEach(() => {
    mockGetCache.mockReset();
    mockSetCache.mockReset();
    mockGeocodeLocation.mockReset();
});

test("preprocessData splits type correctly", async () => {
    const input = [
        {
            type: "Flood - Warning",
            status: "Active",
            location: "Some River",
            lastUpdatedTimestamp: "Now",
        },
    ];

    mockGetCache.mockResolvedValue(null);
    mockGeocodeLocation.mockResolvedValue({
        location: { lat: -37.0, lng: 149.0 },
        formattedAddress: "Some River, VIC",
    });

    const result = await preprocessData(input);

    expect(result[0].category).toBe("Flood");
    expect(result[0].subcategory).toBe("Warning");
    expect(result[0].formattedAddress).toBe("Some River, VIC");
});
