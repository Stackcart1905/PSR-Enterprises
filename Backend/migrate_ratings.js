import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./src/models/productSchema.js";

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const result = await Product.updateMany(
            { averageRating: { $exists: false } },
            [
                {
                    $set: {
                        averageRating: { $ifNull: ["$ratings", 0] },
                        numReviews: { $ifNull: ["$numReviews", 0] }
                    }
                }
            ]
        );

        console.log(`Migration complete. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

migrate();
