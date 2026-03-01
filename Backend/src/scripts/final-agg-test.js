import mongoose from "mongoose";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import dotenv from "dotenv";

dotenv.config();

const finalCheck = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB");

        const userId = "69986626de244fc12f43e666";
        const user = await User.findById(userId);
        console.log("Found User:", user ? user.fullName : "NOT FOUND");

        const agg = await User.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: "orders",
                    let: { uId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$user", "$$uId"] } } }
                    ],
                    as: "orders"
                }
            },
            { $project: { fullName: 1, email: 1, ordersCount: { $size: "$orders" } } }
        ]);

        console.log("Aggregation Result:", JSON.stringify(agg, null, 2));

        await mongoose.connection.close();
    } catch (error) {
        console.error("Final check failed:", error);
    }
};

finalCheck();
