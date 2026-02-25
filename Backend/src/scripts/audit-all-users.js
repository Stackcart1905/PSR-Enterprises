import mongoose from "mongoose";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const auditUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB");

        const users = await User.find({}).sort({ createdAt: -1 });
        console.log("Total users found:", users.length);

        users.forEach(u => {
            console.log(`ID: ${u._id}, Name: "${u.fullName}", Email: ${u.email}, Role: ${u.role}, Joined: ${u.createdAt.toISOString()}`);
        });

        await mongoose.connection.close();
    } catch (error) {
        console.error("Audit failed:", error);
    }
};

auditUsers();
