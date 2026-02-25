import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const deepAudit = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB");

        const usersCol = mongoose.connection.db.collection('users');
        const users = await usersCol.find({}).sort({ createdAt: -1 }).toArray();

        console.log("--- FULL USER LIST (Sorted by CreatedAt DESC) ---");
        users.forEach((u, i) => {
            console.log(`${i + 1}. ID: ${u._id}`);
            console.log(`   Name: [${u.fullName}]`);
            console.log(`   Email: ${u.email}`);
            console.log(`   Joined: ${u.createdAt}`);
            console.log(`   Role: ${u.role}`);
        });

        // Count orders per user ID
        const ordersCol = mongoose.connection.db.collection('orders');
        console.log("\n--- ORDER COUNTS ---");
        for (const u of users) {
            const count = await ordersCol.countDocuments({ user: u._id });
            if (count > 0) {
                console.log(`User ${u.fullName} (${u.email}) has ${count} orders.`);
            }
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

deepAudit();
