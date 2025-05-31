import { Request, Response } from 'express';

export default class AppController {
    static home(req: Request, res: Response) {
        res.status(200).json({
            message: "Welcome to RideFleet dealership ",
        });
    }
}