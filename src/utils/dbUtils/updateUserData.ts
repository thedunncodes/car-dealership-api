import { ObjectId } from "mongodb";
import dbClient from "../../libs/database/db";
import { userDataUpdate } from "../../constants/userTypes";
import { sha256 } from "js-sha256";

/**
 * This function updates user data in the database.
 * It checks if the new email already exists, compares the new data with the existing data,
 * and updates only the fields that have changed.
 * If the password is changed, it hashes the new password before saving it.
 *
 * @param {string} userId - The ID of the user to update.
 * @param {userDataUpdate} newData - The new data to update the user with.
 * @returns {Promise<{ updated: boolean; changes?: boolean; error?: string; passChanged?: boolean }>} - A promise that resolves to an object indicating the result of the update operation.
 */
export default async function updateUserData(
    userId: string, newData: userDataUpdate
  ): Promise<{ updated: boolean; changes?: boolean; error?: string; passChanged?: boolean }> {

    const userColl = dbClient.db?.collection("users");
    const oldData = await userColl?.findOne({ _id: new ObjectId(userId) });

    if (newData.email && (newData.email !== oldData?.email)) {
        const existingEmail = await userColl?.findOne({ email: newData.email });
        if (existingEmail) {
            return { updated: false, error: `User with email '${newData.email}' already exists` };
        }
    }

    const tempData: userDataUpdate = {};
    if (oldData) {
        (Object.keys(newData) as (keyof userDataUpdate)[]).forEach((key) => {
            if ((newData[key] !== oldData[key]) && newData[key]) {
                if (key === "password") {
                    tempData[key] = sha256(String(newData[key]));
                } else tempData[key] = newData[key];
            } else tempData[key] = oldData[key];
        })
    }
    
    const updateResult = await userColl?.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { ...tempData } }
    )

    if (updateResult?.modifiedCount !== 0) {
        if (newData.password && (sha256(String(newData.password)) !== oldData?.password)) {
            return { updated: true, changes: true, passChanged: true };
        }
        return { updated: true, changes: true };
    }
    if ((updateResult?.modifiedCount === 0 &&  updateResult?.matchedCount === 1)) {
        return { updated: true, changes: false };
    }

    return { updated: false, error: "User not found" };
}