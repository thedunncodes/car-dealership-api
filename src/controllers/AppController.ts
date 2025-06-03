import { Request, Response } from 'express';
import dbClient from '../libs/database/db';
import { carQueryData } from '../constants/carTypes';
import selectedFields from '../utils/queryUtils/selectedFields';
import getFieldData from '../utils/queryUtils/getFieldData';
import filterQueryData from '../utils/queryUtils/filterQueryData';
import protectSession from '../utils/authUtils/protectSession';
import paginate from '../utils/pagination/paginate';

export default class AppController {
    static async home(req: Request, res: Response) {
        res.status(200).json({
            message: "Welcome to RideFleet dealership ",
            operations: `${dbClient.isAlive() ? "Fully operational" : "Partially operational" }. Check '/stat' endpoint for more details`,
        });
        return;
    }

    static async stat(req: Request, res: Response) {
        res.status(200).json({
            name: "RideFleet Dealership API",
            dbStatus: dbClient.isAlive() ? "Connected" : "Not connected",
            carsAvailable: await dbClient.db?.collection("cars").countDocuments({ sold: false }) || 'db not connected',
        });
        return;
    }

    static async getCars(req: Request, res: Response) {
        const xToken = req.headers['x-token'];
        const {
            brand, model, bodyType, fuelType,
            transmission, price, mileage, year, 
         }: carQueryData = req.query;
        const { page, size } = req.query;

        const validFields = selectedFields({
            brand, model, bodyType, fuelType,
            transmission, price, mileage, year
        }) 

        const queryData = await getFieldData(
            validFields, {
                brand, model, bodyType, fuelType,
                transmission, price, mileage, year
            }
        )

        const { formattedData, filteredData } = filterQueryData(queryData, validFields, {
            brand, model, bodyType, fuelType,
            transmission, price, mileage, year
        })

        if (xToken) {
            const { payload } = protectSession(xToken as string);
            if (payload.role !== "user") {
                if (page && size) {
                    const pageNumber = parseInt(page as string, 10);
                    const pageSize = parseInt(size as string, 10);

                    const paginatedData = paginate(filteredData, pageNumber, pageSize);
                    res.status(200).json(paginatedData);
                    return;
                }
                // no pagination
                res.status(200).json(filteredData);
                return;
            }
        }

        if (page && size) {
            const pageNumber = parseInt(page as string, 10);
            const pageSize = parseInt(size as string, 10);

            const paginatedData = paginate(formattedData, pageNumber, pageSize);
            res.status(200).json(paginatedData);
            return;
        }
        // no pagination
        res.status(200).json(formattedData);
        return;
    }
}