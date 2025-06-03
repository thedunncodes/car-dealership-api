import { sha256 } from 'js-sha256';
import { jwtPayloadProp } from "../../constants/userTypes";
import dbClient from "../../libs/database/db";

/**
 * This function checks if a user exists in the database by their email and password.
 * It returns a jwtPayloadProp object if the user is found, or null if not found.
 *
 * @param {string} email - The email of the user to check.
 * @param {string} password - The password of the user to check.
 * @returns {Promise<jwtPayloadProp | null>} - A promise that resolves to a jwtPayloadProp object or null.
 */
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