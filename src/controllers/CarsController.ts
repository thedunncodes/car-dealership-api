import { DateTime } from "luxon";
import { Request, Response } from "express";
import dbClient from "../libs/database/db";
import { carsData } from "../constants/carTypes";
import protectSession from "../utils/authUtils/protectSession";
import validateCarData from "../utils/inputValidations/validateCarsInputs";
import { ObjectId } from "mongodb";

export default class CarsController {
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
}