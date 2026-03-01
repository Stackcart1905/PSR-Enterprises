import mongoose from "mongoose";
import { listUsers } from "../controllers/user.controller.js";
import dotenv from "dotenv";

dotenv.config();

const simulateAPI = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB");

        const req = {};
        const res = {
            status: function (s) {
                this.statusCode = s;
                return this;
            },
            json: function (data) {
                this.data = data;
                return this;
            }
        };

        await listUsers(req, res);

        console.log("Status Code:", res.statusCode);
        console.log("Users Count:", res.data.users.length);

        // Log the first few users
        res.data.users.slice(0, 5).forEach((u, i) => {
            console.log(`\nUser ${i + 1}:`);
            console.log(`  ID: ${u._id}`);
            console.log(`  Name: [${u.fullName}]`);
            console.log(`  Email: ${u.email}`);
            console.log(`  Orders: ${u.ordersCount}`);
            console.log(`  TotalSpent: ${u.totalSpent}`);
        });

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

simulateAPI();
