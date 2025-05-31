import { Request, Response } from 'express';
import dbClient from '../libs/database/db';

export default class AppController {
    static async home(req: Request, res: Response) {
        res.status(200).json({
            message: "Welcome to RideFleet dealership ",
            operations: `${dbClient.isAlive() ? "Fully operational" : "Partially operational" }. Check '/stat' endpoint for more details`,
        });
    }
}