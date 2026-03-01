import mongoose from "mongoose";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import dotenv from "dotenv";

dotenv.config();

const verifyData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB");

        const vanshika = await User.findOne({ fullName: /VANSHIKA/i });
        if (vanshika) {
            console.log("Vanshika ID:", vanshika._id);
            const orders = await Order.find({ user: vanshika._id });
            console.log(`Vanshika has ${orders.length} orders found via direct find.`);

            const agg = await User.aggregate([
                { $match: { _id: vanshika._id } },
                {
                    $lookup: {
                        from: "orders",
                        localField: "_id",
                        foreignField: "user",
                        as: "orders"
                    }
                },
                { $project: { fullName: 1, ordersCount: { $size: "$orders" } } }
            ]);
            console.log("Vanshika Agg Result:", JSON.stringify(agg, null, 2));
        } else {
            console.log("Vanshika not found.");
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error("Verification failed:", error);
    }
};

verifyData();
