import { Request, Response } from 'express';
import dbClient from '../libs/database/db';
import { carQueryData, formattedDataProps } from '../constants/carTypes';
import selectedFields from '../utils/queryUtils/selectedFields';
import getFieldData from '../utils/queryUtils/getFieldData';
import filterQueryData from '../utils/queryUtils/filterQueryData';
import protectSession from '../utils/authUtils/protectSession';
import paginate from '../utils/pagination/paginate';

/**
 * AppController handles the application routes and operations.
 * It performs functions such as querying cars and providing sever status information.
 *
 * @class AppController
 * @static
 */

export default class AppController {
    /**
     * Home route handler that returns a welcome message and operational status.
     *
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    static async home(req: Request, res: Response) {
        res.status(200).json({
            message: "Welcome to RideFleet dealership ",
            operations: `${dbClient.isAlive() ? "Fully operational" : "Partially operational" }. Check '/stat' endpoint for more details`,
        });
        return;
    }

    /**
     * Status route handler that returns the application status, including database connection and available cars.
     * It also provides statistics about car brands and user roles restricted to admin users
     *
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     */
    static async stat(req: Request, res: Response) {
        const xToken = req.headers['x-token'];
        let protectedStat = {};
        const brandsAvailable = await dbClient.db?.collection("cars").aggregate([ { $match: { sold: false } }, { $group: { _id: "$brand" } } ]).toArray() || [];
        if (xToken) {
            const { validSession, payload } = protectSession(xToken as string);
            if (validSession) {
                protectedStat = {
                    noBrandsAvailable: brandsAvailable?.length || 0,
                    brandsAvailable: brandsAvailable.map(doc => doc._id) || [],
                    totalNumberOfUsers: payload.role !== 'user' ? (await dbClient.db?.collection("users").countDocuments({}) || 0) : 'Access denied',
                    totalNumberOfStaffs: payload.role !== 'user' ? (await dbClient.db?.collection("users").countDocuments({ role: "staff" }) || 0)  : 'Access denied'
                };

            }
        } else {
            protectedStat = { 
                noBrandsAvailable: brandsAvailable?.length || 0,
                brandsAvailable: brandsAvailable.map(doc => doc._id) || [],
             }
        }

        res.status(200).json({
            name: "RideFleet Dealership API",
            dbStatus: dbClient.isAlive() ? "Connected" : "Not connected",
            carsAvailable: await dbClient.db?.collection("cars").countDocuments({ sold: false }) || 'db not connected',
            ...protectedStat,
        });
        return;
    }

    /**
     * Retrieves a list of cars based on query parameters and pagination.
     *
     * Query parameters can include:
     * - brand: the car brand (e.g., Toyota, Ford)
     * - model: the car model (e.g., Corolla, Focus)
     * - bodyType: the type of car body (e.g., SUV, hatchback)
     * - fuelType: the type of fuel used (e.g., petrol, diesel, electric)
     * - transmission: the type of transmission (e.g., manual, automatic)
     * - price: the maximum price of the car
     * - mileage: the maximum mileage of the car
     * - year: the maximum year of manufacture of the car
     * * Pagination parameters:
     * - page: the page number for pagination
     * - size: the number of items per page for pagination
     * If no query parameters are provided, it returns all available cars.
     * If the user is authenticated with a valid session token and the user role is an admin/user,
     * it returns the full filtered data.
     * If the user is not authenticated, it returns formatted data based on the query parameters.
     * 
     * 
     * 
     * @param {Request} req - The request object containing query parameters.
     * @param {Response} res - The response object to send back containing query result.
     */
    static async getCars(req: Request, res: Response) {
        const xToken = req.headers['x-token'];
        const {
            brand, model, bodyType, fuelType,
            transmission, price, mileage, year, 
         }: carQueryData = req.query;
        const { page, size } = req.query;
        const pageNumber = parseInt(page as string, 10);
        const pageSize = parseInt(size as string, 10);

        if (!dbClient.isAlive()) {
            res.status(500).json({ error: "Internal server error, visit '/stat' endpoint." });
            return;
        }

        const validFields = selectedFields({
            brand, model, bodyType, fuelType,
            transmission, price, mileage, year
        })

        // Return all cars if query parameters are absent
        if (validFields.length === 0) {
            const carsColl = dbClient.db?.collection("cars");
            const cars = await carsColl?.find({ sold: false }).toArray() || [];
            const formattedData: formattedDataProps[] = cars.map((car) => ({
                id: car._id.toString(),
                brand: car.brand,
                model: car.model,
                bodyType: car.bodyType,
                transmission: car.transmission,
                price: car.price,
                horsePower: car.horsePower,
                fuelType: car.fuelType,
                mileage: car.mileage,
                year: car.year,
                imgUrl: car.imgUrl,
            })).reverse();
            let secure;
            if (xToken) {
                const { payload } = protectSession(xToken as string);
                if (payload.role !== "user") secure = true
            }
            if (page && size) {
                const paginatedData = paginate(secure? cars.slice().reverse() : formattedData, pageNumber, pageSize);
                res.status(200).json(paginatedData);
                return;
            }

            // no pagination
            res.status(200).json(formattedData);
            return;
        }

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
                    const paginatedData = paginate(filteredData.slice().reverse(), pageNumber, pageSize);
                    res.status(200).json(paginatedData);
                    return;
                }
                // no pagination
                res.status(200).json(filteredData.slice().reverse());
                return;
            }
        }

        if (page && size) {
            const paginatedData = paginate(formattedData.slice().reverse(), pageNumber, pageSize);
            res.status(200).json(paginatedData);
            return;
        }
        // no pagination
        res.status(200).json(formattedData.slice().reverse());
        return;
    }

    /**
     * Retrieves car sales data, accessible only to admin users.
     * It returns a paginated list of all car sales if the user is authenticated and has the admin role.
     * If the user is not authenticated or does not have the admin role, it returns an error.
     *
     * @param {Request} req - The request object containing headers and query parameters.
     * @param {Response} res - The response object to send back containing the dealership sales.
     */
    static async getCarSales(req: Request, res: Response) {
        const xToken = req.headers['x-token'];
        const { page, size } = req.query;
        const pageNumber = parseInt(page as string, 10);
        const pageSize = parseInt(size as string, 10);
                
        if (!xToken) {
            res.status(401).json({ error: "Unauthorized, no access token provided, procced to '/login' route " });
            return;
        }
        const { validSession, payload } = protectSession(xToken as string);
        if (validSession) {
            if (payload.role === "user") {
                res.status(403).json({ error: "Forbidden, access denied." });
                return;
            }
        } else {
            res.status(401).json({ error: "Invalid session token, or expired session" });
            return;
        }

        if (dbClient.isAlive()) {
            const salesColl = dbClient.db?.collection("sales");
            const data = await salesColl?.find({}).toArray() || [];

            if (page && size) {
                const paginatedData = paginate(data, pageNumber, pageSize);
                res.status(200).json({
                    totalSales: data.length,
                    sales: paginatedData
                });
                return;
            }

            res.status(200).json({
                totalSales: data.length,
                sales: data
            });
            return;
        }

        res.status(500).json({ error: "Internal server error, visit '/stat' endpoint." });
        return;
    }
}