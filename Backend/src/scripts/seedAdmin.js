import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

const seedAdmin = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB.");

        const adminEmail = process.env.ADMIN_EMAIL1 || "admin@example.com";
        const adminPassword = "Admin@123"; // You should change this after first login

        // Check if admin already exists
        let admin = await User.findOne({ email: adminEmail.toLowerCase() });

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        if (admin) {
            console.log(`Admin user with email ${adminEmail} already exists. Updating credentials...`);
            admin.password = hashedPassword;
            admin.role = "admin";
            admin.isVerified = true;
            await admin.save();
            console.log("Admin user updated successfully.");
        } else {
            console.log(`Creating new admin user with email ${adminEmail}...`);
            admin = new User({
                fullName: "System Admin",
                email: adminEmail.toLowerCase(),
                password: hashedPassword,
                role: "admin",
                isVerified: true,
            });
            await admin.save();
            console.log("Admin user created successfully.");
        }

        console.log("\n-----------------------------------");
        console.log("Admin Credentials:");
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log("-----------------------------------\n");

        process.exit(0);
    } catch (error) {
        console.error("Error seeding admin user:", error);
        process.exit(1);
    }
};

seedAdmin();
