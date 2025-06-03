import dbClient from "../../libs/database/db";
import { ObjectId } from "mongodb";
import { DateTime } from "luxon";
import { carsUpdateData } from "../../constants/carTypes";

export default async function updateCarData(
    carId: string, userId: string, newData: carsUpdateData
): Promise<{ updated: boolean; changes?: boolean; error?: string; code?: number }> {
    const carColls = dbClient.db?.collection("cars");
    const oldData = await carColls?.findOne({ _id: new ObjectId(carId) });

    const tempData: { [K in keyof carsUpdateData]?: string | number | boolean } = {};
    if (oldData) {
        (Object.keys(newData) as (keyof carsUpdateData)[]).forEach((key) => {
            if ((newData[key] !== oldData[key]) && newData[key]) {
                tempData[key] = newData[key];
            } else tempData[key] = oldData[key];
        })
    }

    const result = await carColls?.updateOne(
        { _id: new ObjectId(carId) },
        { $set: { ...tempData, updatedAt: DateTime.utc().toISO(), updatedBy: new ObjectId(userId) } }
    )
    if (result?.modifiedCount !== 0) {
        return { updated: true, changes: true };
    }
    if ((result?.modifiedCount === 0 && result?.matchedCount === 1)) {
        return { updated: true, changes: false };
    }

    return { updated: false, error: "Internal server error", code: 500 };
}