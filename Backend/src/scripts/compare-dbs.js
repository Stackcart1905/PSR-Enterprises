import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const compareDBs = async () => {
    const dbsToCheck = ['psr-enterprises', 'PSREnterprises'];
    const results = {};

    try {
        for (const dbName of dbsToCheck) {
            const url = process.env.MONGODB_URL.replace(/\/psr-enterprises(\?|$)/, `/${dbName}$1`);
            console.log(`Connecting to ${dbName}...`);
            const conn = await mongoose.createConnection(url).asPromise();
            const usersCol = conn.db.collection('users');
            const users = await usersCol.find({}).toArray();

            results[dbName] = users.map(u => ({
                id: u._id,
                name: u.fullName,
                email: u.email
            }));

            console.log(`Found ${users.length} users in ${dbName}`);
            await conn.close();
        }

        console.log("\n--- Comparison ---");
        console.log(JSON.stringify(results, null, 2));

    } catch (err) {
        console.error(err);
    }
};

compareDBs();
