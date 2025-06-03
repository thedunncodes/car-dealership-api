import { ObjectId, WithId, Document } from "mongodb";
import dbClient from "../../libs/database/db";

/**
 * This function checks if a car exists in the database by its ID.
 * It returns the car data if found, or null if not found.
 * 
 * @param {string} carId - The ID of the car to check.
 * @returns {Promise<{ carData: WithId<Document> | null; carPresent: boolean }>} - A promise that resolves to an object containing the car data and a boolean indicating if the car is present.
 */
export default async function checkCarExists(carId: string): Promise<{ carData: WithId<Document> | null; carPresent: boolean }> {
    const carColls = dbClient.db?.collection("cars");
    try {
        const car = await carColls?.findOne({ _id: new ObjectId(carId) });
        if (car) {
            return { carData: car, carPresent: true  }
        }
    } catch {
        return { carData: null, carPresent: false };
    }

    return { carData: null, carPresent: false };
}
