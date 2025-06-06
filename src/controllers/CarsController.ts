import { DateTime } from "luxon";
import { ObjectId, WithId, Document } from "mongodb";
import dbClient from "../libs/database/db";
import { Request, Response } from "express";
import { carsData, carsUpdateData } from "../constants/carTypes";
import protectSession from "../utils/authUtils/protectSession";
import validateCarData from "../utils/inputValidations/validateCarsInputs";
import validateCarUpdate from "../utils/inputValidations/validateCarUpdate";
import checkCarExists from "../utils/dbUtils/checkCarExists";
import updateCarData from "../utils/dbUtils/updateCarData";

/**
 * CarsController handles operations related to car management such as creating, updating,
 * deleting, and buying cars. It ensures that only authorized users can perform these actions.
 *
 * @class CarsController
 * @static
 */
export default class CarsController {
    /**
     * Creates a new car entry in the database.
     * Validates the input data and checks for user authorization before adding the car.
     * Only users with the 'admin' or 'staff' role can create cars.
     *
     * @param {Request} req - The request object containing car data.
     * @param {Response} res - The response object to send back the result.
     */
    static async createCar(req: Request, res: Response) {
        const {
            brand, model, bodyType, transmission, price,
            horsePower, fuelType,  mileage, year, imgUrl
        }: carsData = req.body || {};
        const xToken = req.headers['x-token'];
                
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

        const err = validateCarData({
            brand, model, bodyType, transmission, price,
            horsePower, fuelType,  mileage, year, imgUrl
        })

        if (err.error) {
            res.status(400).json({ error: err.error });
            return;
        }

        if (dbClient.isAlive() && payload.id) {
            const carsColl = dbClient.db?.collection("cars");
            const data = {
                brand, model, bodyType, transmission, price,
                horsePower, fuelType,  mileage, year, imgUrl
            }
            try {
                await carsColl?.insertOne({
                    ...data,
                    sold: false,
                    createdAt: DateTime.utc().toISO(),
                    updatedAt: DateTime.utc().toISO(),
                    updatedBy: new ObjectId(payload.id)
                }) 

                res.status(201).json({ message: `Car '${data.brand} ${data.model}' created and added to inventory succesfully` });
                return;
            } catch (err) {
                console.error("Error creating car:", err);
                res.status(500).json({ error: "Error adding car to the inventory" });
                return;
            }

        }

        res.status(500).json({ error: "Internal server error, visit '/stat' endpoint." });
        return;
    }

    /**
     * Updates an existing car entry in the database.
     * Validates the input data and checks for user authorization before updating the car.
     * Only users with the 'admin' or 'staff' role can update cars.
     *
     * @param {Request} req - The request object containing car data and car ID.
     * @param {Response} res - The response object to send back the result.
     */
    static async updateCar(req: Request, res: Response) {
        const {
            brand, model, bodyType, transmission, price,
            horsePower, fuelType,  mileage, year, imgUrl, sold
        }: carsUpdateData = req.body || {};
        const carId = req.params.carId; 
        const xToken = req.headers['x-token'];
                
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

        const err = validateCarUpdate({
            brand, model, bodyType, transmission, price,
            horsePower, fuelType,  mileage, year, imgUrl, sold
        })
        
        if (err.error) {
            res.status(400).json({ error: err.error });
            return;
        }
        
        if (dbClient.isAlive() && payload.id) {
            if (!carId) {
                res.status(400).json({ error: "Car ID is required" });
                return;
            } else {
                const { carPresent } = await checkCarExists(carId);
                if (!carPresent) {
                    res.status(404).json({ error: "Car not found" });
                    return;
                }
            }
            const result = await updateCarData(carId, payload.id, {
                brand, model, bodyType, transmission, price,
                horsePower, fuelType,  mileage, year, imgUrl, sold
            })

            if (result.updated) {
                if (result.changes) {
                    res.status(200).json({ message: `Car with id '${carId}' updated successfully` });
                    return; 
                }
                res.status(200).json({ message: `No changes made` });
                return; 
            } else {
                res.status(result.code? result.code : 400).json({ error: result.error });
                return;
            }
        }

        res.status(500).json({ error: "Internal server error, visit '/stat' endpoint." });
        return;
    }

    /**
     * Deletes a car entry from the database.
     * Validates the session token and checks for user authorization before deleting the car.
     * Only users with the 'admin' or 'staff' role can delete cars.
     *
     * @param {Request} req - The request object containing car ID.
     * @param {Response} res - The response object to send back the result.
     */
    static async deleteCar(req: Request, res: Response) {
        const xToken = req.headers['x-token'];
        const carId = req.params.carId;
                
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

        if (!carId) {
            res.status(400).json({ error: "Car ID is required" });
            return;
            }

        if (dbClient.isAlive()) {
            const carsColl = dbClient.db?.collection("cars");
            try {
                const result = await carsColl?.deleteOne({ _id: new ObjectId(carId) });
        
                if (!result || result.deletedCount === 0) {
                    res.status(404).json({ error: "Car not found" });
                    return;
                }
            } catch {
                res.status(400).json({ error: "Invalid Car Id" });
                return;
            }
        
            res.status(200).json({ message: `Car with id '${carId}' deleted successfully` });
            return;
        }

        res.status(500).json({ error: "Internal server error, visit '/stat' endpoint." });
        return;
    }

    /**
     * Buys a car by updating its status to sold and recording the sale in the database.
     * Validates the session token and checks for user authorization before processing the purchase.
     * The buyer must provide the amount paid, which should be equal to the car's price.
     *
     * @param {Request} req - The request object containing car ID and amount paid.
     * @param {Response} res - The response object to send back the result.
     */
    static async buyCar(req: Request, res: Response) {
        const xToken = req.headers['x-token'];
        const carId = req.params.carId;
        const { amountPaid }: { amountPaid: number } = req.body || {};
                
        if (!xToken) {
            res.status(401).json({ error: "Unauthorized, no access token provided, procced to '/login' route " });
            return;
        }
        const { validSession, payload } = protectSession(xToken as string);
        if (!validSession) {
            res.status(401).json({ error: "Invalid session token, or expired session" });
            return;
        }

        if (!carId) {
            res.status(400).json({ error: "Car ID is required" });
            return;
            }

        if (dbClient.isAlive()) {
            let carInfo: WithId<Document> | null; ;
            if (!carId) {
                res.status(400).json({ error: "Car ID is required" });
                return;
            } else {
                const { carPresent, carData } = await checkCarExists(carId);
                if (!carPresent) {
                    res.status(404).json({ error: "Car not found/Invalid car id " });
                    return;
                }
                carInfo = carData;

                if (typeof amountPaid !== 'number' || amountPaid <= 0) {
                    res.status(400).json({ error: "Invalid amount provided, it should be a positive number" });
                    return;
                }

                if (carInfo && carInfo.sold) {
                    res.status(400).json({ error: `Car with id '${carData?._id.toString()}' already sold` });
                    return;
                }

                if (carInfo && (carInfo.price > amountPaid)) {
                    res.status(400).json({ error: `Insufficient amount, the car price is $${carInfo.price}, but you provided $${amountPaid}` });
                    return;
                }
            }
            
            const carsColl = dbClient.db?.collection("cars");
            try {
                const result = await carsColl?.updateOne(
                    { _id: new ObjectId(carId) },
                    { $set: { sold: true } }
                );
                if (!result || result.modifiedCount === 0) {
                    res.status(404).json({ error: "Car not found or already sold" });
                    return;
                }
            } catch {
                res.status(400).json({ error: "Invalid Car Id" });
                return;
            }
        
            try {
                const result = await dbClient.db?.collection("sales").insertOne({
                    carId: new ObjectId(carId),
                    buyerId: new ObjectId(payload.id),
                    brand: carInfo?.brand,
                    model: carInfo?.model,
                    price: carInfo?.price,
                    imgUrl: carInfo?.imgUrl,
                    amountPaid,
                    soldAt: DateTime.utc().toISO(),
                })

                if (result && result.acknowledged) {
                    res.status(200).json({ message: `Purchase successful with purchase id: ${result.insertedId}` });
                    return;
                } else {
                    res.status(500).json({ error: "Error recording the sale, please try again later." });
                    return;
                }
            } catch {
                res.status(500).json({ error: "Error recording the sale, please try again later." });
                return;
            }
        }

        res.status(500).json({ error: "Internal server error, visit '/stat' endpoint." });
        return;
    }
}