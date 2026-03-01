import mongoose from "mongoose";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import dotenv from "dotenv";

dotenv.config();

const fullOrderAudit = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB");

        const orders = await Order.find({});
        console.log(`Total orders in DB: ${orders.length}`);

        for (const order of orders) {
            const user = await User.findById(order.user);
            console.log(`Order ${order.orderNumber}: UserID=${order.user}, Name=${user ? user.fullName : "NOT FOUND"}, Email=${user ? user.email : "N/A"}`);
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error("Audit failed:", error);
    }
};

fullOrderAudit();
