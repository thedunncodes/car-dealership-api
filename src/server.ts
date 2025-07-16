/**
 * Server entry point.
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(routes)

const PORT = process.env.PORT || 5000;

if (require.main === module) { // Prevent app from listening during imports i.e during tests
    app.listen(PORT, () => {
        console.log(`Dealership server running...`);
    })
}

export default app;