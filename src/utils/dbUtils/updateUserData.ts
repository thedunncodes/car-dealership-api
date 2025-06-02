import { ObjectId } from "mongodb";
import dbClient from "../../libs/database/db";
import { userDataUpdate } from "../../constants/userTypes";
import { sha256 } from "js-sha256";

export default async function updateUserData(
    userId: string, newData: userDataUpdate
  ): Promise<{ updated: boolean; error: string | null, passChanged?: boolean }> {

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
            return { updated: true, error: null, passChanged: true };
        }
        return { updated: true, error: null };
    }
    if ((updateResult?.modifiedCount === 0 &&  updateResult?.matchedCount === 1)) {
        return { updated: false, error: "No changes made" };
    }

    return { updated: false, error: "User not found" };
}