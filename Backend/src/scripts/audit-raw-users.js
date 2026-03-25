import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const auditRaw = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB");

        const usersCol = mongoose.connection.db.collection('users');
        const users = await usersCol.find({}).sort({ createdAt: -1 }).toArray();
        console.log("Total users found:", users.length);

        users.forEach(u => {
            console.log(`ID: ${u._id}, Name: "${u.fullName}", Email: ${u.email}, Role: ${u.role}, Joined: ${u.createdAt}`);
        });

        await mongoose.connection.close();
    } catch (error) {
        console.error("Audit failed:", error);
    }
};

auditRaw();
