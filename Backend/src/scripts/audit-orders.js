import mongoose from "mongoose";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import dotenv from "dotenv";

dotenv.config();

const auditData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB");

        const orders = await Order.find({}).limit(5);
        console.log("Total orders found:", await Order.countDocuments());

        if (orders.length > 0) {
            console.log("Sample order user ID:", orders[0].user);
            const user = await User.findById(orders[0].user);
            console.log("User for that order:", user ? user.fullName : "User not found");
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error("Audit failed:", error);
        process.exit(1);
    }
};

auditData();
