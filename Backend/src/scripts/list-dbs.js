import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const listDBs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log("Databases in cluster:", dbs.databases.map(db => db.name));
        await mongoose.connection.close();
    } catch (err) {
        console.error("Failed to list DBs:", err);
    }
};

listDBs();
