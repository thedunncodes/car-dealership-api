/**
 * Server entry point.
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";
import dbClient from "./libs/database/db";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(routes)

const PORT = process.env.PORT || 5000;

if (require.main === module) { // Prevent app from listening during imports i.e during tests
    (async () => {
        await dbClient.initiateConnection();
        if (!dbClient.isAlive()) {
            console.error("Failed to connect to the database. Exiting...");
            process.exit(1);
        }
        const ENV = process.env.NODE_ENV === 'dev' ? "development" : process.env.NODE_ENV;
        app.listen(PORT, () => {
            console.log(`Dealership server running...\nEnvironment: ${ENV}`);
        })
    })();
    
}

export default app;