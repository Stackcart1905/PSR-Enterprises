import mongoose from "mongoose";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const aggressiveCleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB");

        const users = await User.find({});
        for (const user of users) {
            let name = user.fullName || "";
            // Remove "undefined", "null", quotes, and extra whitespace
            let cleaned = name
                .replace(/undefined/gi, "")
                .replace(/null/gi, "")
                .replace(/["\\]/g, "")
                .replace(/\s+/g, " ")
                .trim();

            if (!cleaned) cleaned = user.email.split('@')[0];

            if (user.fullName !== cleaned) {
                console.log(`Fixing: "${user.fullName}" -> "${cleaned}"`);
                user.fullName = cleaned;
                await user.save();
            }
        }
        console.log("Cleanup finished.");

        // Now check specifically for vanshikavijay0304@gmail.com
        const vanshikas = await User.find({ email: "vanshikavijay0304@gmail.com" });
        console.log(`\nFound ${vanshikas.length} accounts for vanshikavijay0304@gmail.com:`);
        vanshikas.forEach(v => {
            console.log(`- ID: ${v._id}, Name: ${v.fullName}, Role: ${v.role}, CreatedAt: ${v.createdAt}`);
        });

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

aggressiveCleanup();
