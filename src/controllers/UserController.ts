import { DateTime } from 'luxon';
import { ObjectId } from 'mongodb';
import { sha256 } from 'js-sha256';
import { Request, Response } from 'express';
import myCache from '../libs/cache';
import dbClient from '../libs/database/db';
import protectSession from '../utils/authUtils/protectSession';
import validateUserInputs from '../utils/inputValidations/validateUserInputs';
import { userData, userDataUpdate } from '../constants/userTypes';
import updateUserData from '../utils/dbUtils/updateUserData';
import validateUpdateData from '../utils/inputValidations/validateUpdateData';

/**
 * UserController handles user-related operations such as registration, retrieval,
 * updating, deletion, and fetching user purchases.
 *
 * @class UserController
 * @static
 */
export default class UserController {
    /**
     * Registers a new user by validating the input data and checking for existing users.
     * If the user is already logged in, it returns a message indicating so.
     *
     * @param {Request} req - The request object containing user data.
     * @param {Response} res - The response object to send back the result.
     */
    static async userReg(req: Request, res: Response) {
        const { name, email, password }: userData = req.body || {};
        const xToken = req.headers['x-token'];

        if (xToken) {
            const { validSession } = protectSession(xToken as string);
            if (validSession) {
                res.status(200).json({ message: "This user is already logged in" });
                return;
            }
        }
        const err = validateUserInputs(name, email, password);
        if (err.error) {
            res.status(400).json({ error: err.error });
            return;
        }

        if (dbClient.isAlive()) {
            const existingPassword = await dbClient.db?.collection("users").findOne({ password: sha256(String(password)) });
            if (existingPassword) {
                res.status(400).json({ error: "Choose a stronger password" });
                return;
            }

            const existingUser = await dbClient.db?.collection("users").findOne({ email: email });
            if (existingUser) {
                res.status(400).json({ error: `User with email '${email}' already exists` });
                return;
            }

            try {
                await dbClient.db?.collection("users").insertOne({
                    name,
                    email,
                    password: sha256(String(password)),
                    role: "user",
                    createdAt: DateTime.utc().toISO(),
                });

                res.status(201).json({ message: `User with email '${email}' created succesfully` });
                return;
            } catch (err) {
                console.error("Error creating user:", err);
                res.status(400).json({ error: "Error creating user, invalid input!" });
                return;
            }
        }

        res.status(500).json({ error: "Internal server error, visit '/stat' endpoint." });
        return;
    }

    /**
     * Retrieves the current user's information based on the session token.
     * If the user is not authenticated or the session is invalid, it returns an error.
     *
     * @param {Request} req - The request object containing headers.
     * @param {Response} res - The response object to send back containing the user information.
     */
    static async getUser(req: Request, res: Response) {
        const xToken = req.headers['x-token'];

        if (!xToken) {
            res.status(401).json({ error: "Unauthorized, no access token provided, procced to '/login' route." });
            return;
        }
        const { validSession, payload } = protectSession(xToken as string);
        if (!validSession) {
            res.status(401).json({ error: "Invalid session token, or expired session" });
            return;
        }

        if (dbClient.isAlive()) {
            const usersColl = dbClient.db?.collection("users");
            const data = await usersColl?.find({ _id: new ObjectId(payload.id) }).toArray() || [];
            const user = data.map(user => ({
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
            }))
    
            res.status(200).json({
                myInfo: user[0]
            });
            return;
        }

        res.status(500).json({ error: "Internal server error, visit '/stat' endpoint." });
        return;
    }

    /**
     * Updates the current user's information based on the provided data.
     * Validates the session token and checks for valid input data before updating.
     *
     * @param {Request} req - The request object containing headers and body data.
     * @param {Response} res - The response object to send back the result.
     */
    static async updateUser(req: Request, res: Response) {
        const xToken = req.headers['x-token'];
        const { name, email, password }: userDataUpdate = req.body || {};

        if (!xToken) {
            res.status(401).json({ error: "Unauthorized, no access token provided, procced to '/login' route." });
            return;
        }
        const { validSession, payload } = protectSession(xToken as string);
        if (!validSession) {
            res.status(401).json({ error: "Invalid session token, or expired session" });
            return;
        }

        const err = validateUpdateData({name, email, password});
        if (err.error) {
            res.status(400).json({ error: err.error });
            return;
        }

        if (dbClient.isAlive() && payload.id) {
            const result = await updateUserData(payload.id, { name, email, password, });
            if (result.updated) {
                const message = result.passChanged
                    ? "User data updated successfully, Kindly login again to continue."
                    : "User data updated successfully";
                if (result.passChanged && payload.email) {
                    const removed = myCache.del(`jwt:${sha256(payload.email)}`);
                    if (removed === 1) {
                        res.status(200).json({ message });
                        return;
                    }
                }
                if (!result.changes) {
                    res.status(200).json({ message: "No changes made" });
                    return; 
                }

                res.status(200).json({ message });
                return;
            } else {
                res.status(400).json({ error: result.error });
                return;
            }
        }

        res.status(500).json({ error: "Internal server error, visit '/stat' endpoint." });
        return;
    }

    /**
     * Deletes the current user's account based on the session token.
     * Validates the session and removes the user from the database.
     *
     * @param {Request} req - The request object containing headers.
     * @param {Response} res - The response object to send back the result.
     */
    static async deleteUser(req: Request, res: Response) {
        const xToken = req.headers['x-token'];

        if (!xToken) {
            res.status(401).json({ error: "Unauthorized, no access token provided, procced to '/login' route." });
            return;
        }
        const { validSession, payload } = protectSession(xToken as string);
        if (!validSession) {
            res.status(401).json({ error: "Invalid session token, or expired session" });
            return;
        }

        if (dbClient.isAlive() && payload.id && payload.email) {
            const usersColl = dbClient.db?.collection("users");
            try {
                const result = await usersColl?.deleteOne({ _id: new ObjectId(payload.id) });
        
                if (!result || result.deletedCount === 0) {
                    res.status(404).json({ error: "User not found" });
                    return;
                }
            } catch {
                res.status(400).json({ error: "Invalid user Id" });
                return;
            }
            let message = `Your account with id '${payload.id}' has been deleted successfully`;
            const removed = myCache.del(`jwt:${sha256(payload.email)}`);
            if (removed === 1) {
                message = `Your account with id '${payload.id}' and session has been deleted successfully`;
            }


    
            res.status(200).json({ message });
            return;
        }

        res.status(500).json({ error: "Internal server error, visit '/stat' endpoint." });
        return;
    }

    /**
     * Retrieves the purchases made by the current user based on the session token.
     * Validates the session and fetches the user's purchase history from the database.
     *
     * @param {Request} req - The request object containing headers.
     * @param {Response} res - The response object to send back containing the user purchases.
     */
    static async userPurchases(req: Request, res: Response) {
        const xToken = req.headers['x-token'];

        if (!xToken) {
            res.status(401).json({ error: "Unauthorized, no access token provided, procced to '/login' route." });
            return;
        }
        const { validSession, payload } = protectSession(xToken as string);
        if (!validSession) {
            res.status(401).json({ error: "Invalid session token, or expired session" });
            return;
        }

        if (dbClient.isAlive() && payload.id) {
            const salesColl = dbClient.db?.collection("sales");
            const data = await salesColl?.find({ buyerId: new ObjectId(payload.id) }).toArray() || [];
            const purchases = data.map(sale => ({
                id: sale._id.toString(),
                carId: sale.carId.toString(),
                userId: sale.buyerId.toString(),
                brand: sale.brand,
                model: sale.model,
                price: sale.price,
                amountPaid: sale.amountPaid,
                boughtAt: sale.soldAt,
                imgUrl: sale.imgUrl,
            }));

            res.status(200).json({
                totalPurchases: data.length,
                purchases: purchases.slice().reverse()
            });
            return;
        }

        res.status(500).json({ error: "Internal server error, visit '/stat' endpoint." });
        return;
    }
}