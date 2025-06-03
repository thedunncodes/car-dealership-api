import { sha256 } from 'js-sha256';
import { jwtPayloadProp } from "../../constants/userTypes";
import dbClient from "../../libs/database/db";

export default async function checkUserExists(
    email: string, password: string
  ): Promise<jwtPayloadProp | null> {

    const user = await dbClient.db?.collection("users").findOne({ email, password: sha256(String(password)) });
    if (user) {
        return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        } 
    }
    return null;
}