import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const searchAllDBs = async () => {
    try {
        const conn = await mongoose.createConnection(process.env.MONGODB_URL).asPromise();
        const admin = conn.db.admin();
        const { databases } = await admin.listDatabases();
        const dbNames = databases.map(db => db.name).filter(n => !['admin', 'local', 'config', 'sample_mflix'].includes(n));

        console.log("Searching databases:", dbNames);
        await conn.close();

        for (const dbName of dbNames) {
            const url = process.env.MONGODB_URL.replace(/\/psr-enterprises(\?|$)/, `/${dbName}$1`);
            const dbConn = await mongoose.createConnection(url).asPromise();
            const usersCol = dbConn.db.collection('users');
            const found = await usersCol.find({ fullName: /Anand/i }).toArray();

            if (found.length > 0) {
                console.log(`\n[${dbName}] Found ${found.length} users:`);
                found.forEach(u => console.log(`  - Name: [${u.fullName}], Email: ${u.email}`));
            }
            await dbConn.close();
        }
        console.log("\nSearch complete.");
    } catch (err) {
        console.error(err);
    }
};

searchAllDBs();
