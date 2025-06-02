import { DateTime } from 'luxon';
import { ObjectId } from 'mongodb';
import { sha256 } from 'js-sha256';
import { Request, Response } from 'express';
import dbClient from '../libs/database/db';
import protectSession from '../utils/authUtils/protectSession';
import validateUserInputs from '../utils/inputValidations/validateUserInputs';
import { userData, userDataUpdate } from '../constants/userTypes';
import updateUserData from '../utils/dbUtils/updateUserData';
import validateUpdateData from '../utils/inputValidations/validateUpdateData';


export default class UserController {
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
                console.log(result);
                // disconnect on pass change
                res.status(200).json({ message: "User data updated successfully" });
                return;
            } else {
                res.status(400).json({ error: result.error });
                return;
            }
        }

        res.status(500).json({ error: "Internal server error, visit '/stat' endpoint." });
        return;
    }
}