import { getCoordinatesFromAddress } from "./src/services/geocodingService.js";
import dotenv from "dotenv";
dotenv.config();

const testAddress = "Muzaffarpur, Bihar";

console.log(`🧪 Testing Geocoding with: "${testAddress}"`);

getCoordinatesFromAddress(testAddress)
    .then(coords => {
        console.log("✅ Geocoding Success:", coords);
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ Geocoding Failed:", err.message);
        process.exit(1);
    });
