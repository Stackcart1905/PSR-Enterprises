import { DELIVERY_CONFIG } from "../config/constants.js";

/**
 * Validates if the coordinates are within valid geographic bounds.
 */
export const isValidCoordinate = (lat, lng) => {
    return (
        typeof lat === "number" &&
        typeof lng === "number" &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
    );
};

/**
 * Calculates the distance between two points using the Haversine formula (in km).
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
        throw new Error("Invalid coordinates provided for distance calculation");
    }

    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Checks if a location is within the allowed delivery radius.
 */
export const isWithinDeliveryRadius = (customerLat, customerLng) => {
    const { lat: shopLat, lng: shopLng } = DELIVERY_CONFIG.SHOP_COORDINATES;
    const distance = calculateDistance(shopLat, shopLng, customerLat, customerLng);

    return {
        isWithin: distance <= DELIVERY_CONFIG.MAX_RADIUS_KM,
        distance: distance.toFixed(2)
    };
};
