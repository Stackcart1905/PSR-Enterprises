import mongoose from "mongoose";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import dotenv from "dotenv";

dotenv.config();

const cleanupAndAudit = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB");

        const users = await User.find({});
        console.log(`Total users found: ${users.length}`);

        for (const user of users) {
            let oldName = user.fullName || "";
            // Aggressive cleanup: remove "undefined", "null", quotes, and extra spaces
            let newName = oldName
                .replace(/undefined/gi, "")
                .replace(/null/gi, "")
                .replace(/[\\"]/g, "") // remove quotes and backslashes
                .replace(/\s+/g, " ")
                .trim();

            if (!newName || newName === "") {
                newName = user.email.split('@')[0];
            }

            if (oldName !== newName) {
                user.fullName = newName;
                await user.save();
                console.log(`Updated Name: "${oldName}" -> "${newName}" (${user.email})`);
            }
        }

        // Now audit order associations
        console.log("\n--- User Order Audit ---");
        const adminList = await User.aggregate([
            { $match: { role: "user" } },
            {
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "user",
                    as: "orders"
                }
            },
            {
                $project: {
                    fullName: 1,
                    email: 1,
                    role: 1,
                    createdAt: 1,
                    ordersCount: { $size: "$orders" }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        adminList.forEach(u => {
            console.log(`[${u.createdAt.toISOString()}] ${u.fullName} (${u.email}) - Orders: ${u.ordersCount} (ID: ${u._id})`);
        });

        await mongoose.connection.close();
    } catch (error) {
        console.error("Cleanup/Audit failed:", error);
    }
};

cleanupAndAudit();
