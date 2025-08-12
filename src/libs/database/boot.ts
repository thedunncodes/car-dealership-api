import { Db } from "mongodb";
import { DateTime } from "luxon";
import userSchema from "./schema/userSchema";
import data from "./cars_inventory.json";

/**
 * Boot function to initialize the database.
 * It checks if the database and collections exist, creates them if they don't,
 * and ensures that the necessary indexes are set up.
 *
 * @param {Db} db - The MongoDB database instance.
 */

export default async function boot(db: Db) {
    const DEV_ENV: boolean = process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test';
    const DB_NAME: string = DEV_ENV ? 'test-db' : (process.env.DB_NAME || 'no-database-specified'); ;

    const dbExists = (await db.admin().listDatabases()).databases.some(database => database.name === DB_NAME)
    const usersColl = db.collection("users");
    const userCollExists = (await db.collections()).some(c => c.collectionName === "users");
    const carCollExists = (await db.collections()).some(c => c.collectionName === "cars");

    if (!dbExists) {
        // create 'users' schema

        await db.createCollection("users", userSchema);
        usersColl.createIndex({"email": 1}, { unique: true, name: "unique_email_index" });

    } else if (!userCollExists) {
        // if the database exists but the collection does not, create the collection

        await db.createCollection("users", userSchema);
        await usersColl.createIndex({"email": 1}, { unique: true, name: "unique_email_index" });
    }
    
    if (userCollExists) {
        // check if schema has a unique email index

        const constraints = await usersColl.indexes()
        const constraintExists = constraints.some(c => c.name === "unique_email_index");
        try {
            if (!constraintExists) usersColl.createIndex({"email": 1}, { unique: true, name: "unique_email_index" });
        } catch (error) {
            throw new Error(`Failed to create unique email index, collection corrupted: ${error}`);
        }
    }

    if (!carCollExists) {
        // create cars collection if it doesn't exist and insert data

        const carsColl = db.collection("cars");
        await carsColl.insertMany(data.map(car => ({
            ...car,
            sold: false,
            createdAt: DateTime.utc().toISO(),
            updatedAt: DateTime.utc().toISO(),
            updatedBy: null
        })));
    }
}