import { ObjectId } from "mongodb";
import dbClient from "../../libs/database/db";

export default async function checkCarExists(carId: string): Promise<{ carData: unknown; carPresent: boolean }> {
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
