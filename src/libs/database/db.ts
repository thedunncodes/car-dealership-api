import dotenv from 'dotenv';
import { Db, MongoClient } from 'mongodb';
import boot from './boot';

/**
 * Database client for MongoDB.
 * This class handles the connection to the MongoDB database and provides methods
 * to interact with the database collections.
 */

// Load environment variables from .env file
dotenv.config();

// If the environment variables are not set, it will use 'localhost' and '27017' for host and port as defaults.
const DEFAULT_DB_NAME = 'no-database-specified';

class DBClient {
    db: Db | null = null;
    connected: boolean = false;
    private mongoClient: MongoClient = new MongoClient('mongodb://localhost:27017');

    constructor() {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || 27017;
        const database = process.env.DB_NAME || DEFAULT_DB_NAME;
        const url = `mongodb://${host}:${port}`;
        try {
            this.mongoClient = new MongoClient(url);
            this.connect(database);
        } catch (err) {
            console.error('Failed to connect to MongoDB:', err);
            this.connected = false;
        }
    }

    private async connect(database: string) {
        try {
            await this.mongoClient.connect();
            this.db = this.mongoClient.db(database);
            this.connected = this.db.databaseName !== DEFAULT_DB_NAME;
            if (this.connected) await boot(this.db)
        } catch (err) {
            console.error('Failed to connect to MongoDB:', err);
            this.connected = false;
            this.db = null;
        }
    }

    isAlive() {
        return this.connected && this.db !== null;
    }
}

const dbClient = new DBClient();
export type DBClientClass = DBClient;
export default dbClient;