import mongoose from "mongoose";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import dotenv from "dotenv";

dotenv.config();

const verifyAggregation = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB");

        const users = await User.aggregate([
            { $match: { role: "user" } },
            {
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "user",
                    as: "userOrders"
                }
            },
            {
                $addFields: {
                    ordersCount: { $size: "$userOrders" },
                    totalSpent: { $sum: "$userOrders.totalAmount" },
                    lastOrder: {
                        $arrayElemAt: [
                            { $sortArray: { input: "$userOrders", sortBy: { createdAt: -1 } } },
                            0
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    fullName: 1,
                    email: 1,
                    ordersCount: 1,
                    totalSpent: 1,
                    lastOrderDate: "$lastOrder.createdAt"
                }
            }
        ]);

        console.log("Found users:", users.length);
        if (users.length > 0) {
            console.log("Sample user data:", JSON.stringify(users[0], null, 2));
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error("Verification failed:", error);
        process.exit(1);
    }
};

verifyAggregation();
