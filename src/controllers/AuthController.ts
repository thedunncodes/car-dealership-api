import jwt from "jsonwebtoken";
import { sha256 } from "js-sha256";
import { Request, Response } from "express";
import myCache from "../libs/cache";
import dbClient from '../libs/database/db';
import { loginData } from "../constants/userTypes";
import validateLoginInputs from "../utils/inputValidations/validateLoginInputs";
import checkUserExists from "../utils/dbUtils/checkUserExists";
import protectSession from "../utils/authUtils/protectSession";
import cacheJWT from "../utils/authUtils/cacheJWT";

export default class AuthController {
    static async login(req: Request, res: Response) {
        const { email, password }: loginData = req.body || {};
        const xToken = req.headers['x-token'];

        if (xToken) {
            const { validSession } = protectSession(xToken as string);
            if (validSession) {
                res.status(200).json({ message: "This user is already logged in" });
                return;
            }
        }

        const err = validateLoginInputs( email, password);
        if (err.error) {
            res.status(400).json({ error: err.error });
            return;
        }

        if (dbClient.isAlive()) {
            const userExists = await checkUserExists(email, password);
            if (userExists) {
                const token = jwt.sign(userExists, process.env.JWT_SECRET_KEY || 'secret-key', { expiresIn: '5m' });   
                cacheJWT(token, userExists.email);         
    
                // Cookie is sent to satisfy front end consumption, but for this RESTful API
                // cookies won't be used for authentication, only JWTs sent in the Authorization header.
                res.status(200).cookie("token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict', 
                    maxAge: 1000 * 60 * 5 // 5 minutes
                }).json({
                    "token": token
                });
                return;
            }
    
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }

        res.status(500).json({ error: "Internal server error, visit '/stat' endpoint." });
        return;
    }

    static async logout(req: Request, res: Response) {
        const xToken = req.headers['x-token'];
        if (xToken) {
            const { validSession, payload } = protectSession(xToken as string);
            if (validSession && payload.email) {
                const removed = myCache.del(`jwt:${sha256(payload.email)}`);
                if (removed === 1) {
                    res.status(200).json({ message: "Logged out successfully" });
                    return;
                }
            }
        }
        res.status(401).json({ error: "Unauthorized, invalid session" });
        return;
    }
}