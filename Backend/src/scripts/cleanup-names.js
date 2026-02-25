import mongoose from "mongoose";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const cleanupNames = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB");

        const users = await User.find({ fullName: /undefined|null|"/i });
        console.log(`Found ${users.length} users with potentially corrupted names.`);

        for (const user of users) {
            const oldName = user.fullName;
            // Remove "undefined", "null", and extra quotes
            let newName = oldName
                .replace(/undefined/gi, "")
                .replace(/null/gi, "")
                .replace(/"/g, "")
                .replace(/\s+/g, " ")
                .trim();

            // If result is empty, use email prefix
            if (!newName) {
                newName = user.email.split('@')[0];
            }

            user.fullName = newName;
            await user.save();
            console.log(`Updated: "${oldName}" -> "${newName}"`);
        }

        console.log("Cleanup complete.");
        await mongoose.connection.close();
    } catch (error) {
        console.error("Cleanup failed:", error);
    }
};

cleanupNames();
