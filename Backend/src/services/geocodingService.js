import axios from "axios";

/**
 * Converts an address string into { lat, lng } coordinates using OpenStreetMap Nominatim.
 * @param {string} address - The address to geocode.
 * @returns {Promise<{lat: number, lng: number}>}
 */
export const getCoordinatesFromAddress = async (address) => {
    if (!address || address.trim().length < 5) {
        throw new Error("Address is too short. Please provide a more specific address.");
    }

    const url = "https://nominatim.openstreetmap.org/search";

    try {
        console.log(`📡 Geocoding Service: Resolving address: "${address}"`);
        const response = await axios.get(url, {
            params: {
                q: address,
                format: "json",
                limit: 1
            },
            headers: {
                "User-Agent": "Swaadbhog-Mewa-Enterprises-Dev"
            }
        });

        if (!response.data || response.data.length === 0) {
            console.warn(`⚠️ Geocoding Service: No results found for: "${address}"`);
            throw new Error("Address not found. Please try a more specific address (e.g., include city and state).");
        }

        const result = {
            lat: parseFloat(response.data[0].lat),
            lng: parseFloat(response.data[0].lon)
        };

        console.log(`✅ Geocoding Service: Resolved to ${result.lat}, ${result.lng}`);
        return result;

    } catch (error) {
        if (error.response) {
            console.error("❌ Geocoding API Error:", error.response.status, error.response.data);
        } else {
            console.error("❌ Geocoding Service Exception:", error.message);
        }
        throw new Error(error.message || "Failed to resolve address. Please check your internet connection.");
    }
};
