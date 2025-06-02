import { sha256 } from 'js-sha256';
import { DateTime } from 'luxon';
import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import dbClient from '../libs/database/db';
import validateUserInputs from '../utils/inputValidations/validateUserInputs';
import protectSession from '../utils/authUtils/protectSession';

interface adminData {
    name: string;
    email: string;
    password: string;
    admin?: boolean; 
}

export default class AdminController {
    static async adminReg(req: Request, res: Response) {
        const { name, email, password, admin }: adminData = req.body || {};
        const adminSlug = req.params.adminSlug;
        const xToken = req.headers['x-token'] || '';
        
        if (xToken) {
            const { validSession, payload } = protectSession(xToken as string);
            if (validSession) {
                if (payload.role === "user") {
                    res.status(403).json({ error: "Forbidden, access denied." });
                    return;
                }
                res.status(200).json({ message: "This admin/staff is already logged in" });
                return;
            }
        }

        // Check if the admin slug is valid to prevent unauthorized access i.e a user randomly to access the admin endpoint
        if (adminSlug !== process.env.ADMIN_SLUG) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const err = validateUserInputs(name, email, password);
        if (err.error) {
            res.status(400).json({ error: err.error });
            return;
        }
        
        if (dbClient.isAlive()) {
            if (admin) {
                const existingAdmin = await dbClient.db?.collection("users").findOne({ role: "admin" });
                if (existingAdmin) {
                    res.status(401).json({ error: `Unauthorized, Admin User already exists` })
                    return;
                }
            }

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
                    role: admin ? "admin" : "staff",
                    createdAt: DateTime.utc().toISO(),
                });

                res.status(201).json({ message: `${admin ? "Admin" : "Staff"} with email '${email}' created succesfully` });
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

    static async getStaff(req: Request, res: Response) {
        const xToken = req.headers['x-token'];
        
        if (!xToken) {
            res.status(401).json({ error: "Unauthorized, no access token provided, procced to '/login' route " });
            return;
        }
        const { validSession, payload } = protectSession(xToken as string);
        if (validSession) {
            if (payload.role === "user") {
                res.status(403).json({ error: "Forbidden, access denied." });
                return;
            }
        } else {
            res.status(401).json({ error: "Invalid session token, or expired session" });
            return;
        }

        if (dbClient.isAlive()) {
            const usersColl = dbClient.db?.collection("users");
            const dataColl = await usersColl?.find({ role: { $in: ['admin', 'staff'] } }).toArray() || [];
            const staff = dataColl.map(user => ({
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
            }))
    
            res.status(200).json({
                totalStaff: staff.length,
                admin: staff.filter(user => user.role === 'admin'),
                staff: staff.filter(user => user.role === 'staff'),
            });
            return;
        }

        res.status(500).json({ error: "Internal server error, visit '/stat' endpoint." });
        return;
    }

    static async deleteStaff(req: Request, res: Response) {
        const xToken = req.headers['x-token'];
        const staffId = req.params.staffId;
        
        if (!xToken) {
            res.status(401).json({ error: "Unauthorized, no access token provided, procced to '/login' route " });
            return;
        }
        const { validSession, payload } = protectSession(xToken as string);
        if (validSession) {
            if (payload.role === "user" || payload.role === "staff") {
                res.status(403).json({ error: "Forbidden, access denied." });
                return;
            }
        } else {
            res.status(401).json({ error: "Invalid session token, or expired session" });
            return;
        }

        if (!staffId) {
            res.status(400).json({ error: "Staff ID required" });
            return;
        }

        if (dbClient.isAlive()) {
            const usersColl = dbClient.db?.collection("users");
            try {
                const result = await usersColl?.deleteOne({ _id: new ObjectId(staffId), role: 'staff' });
        
                if (!result || result.deletedCount === 0) {
                    res.status(404).json({ error: "Staff not found" });
                    return;
                }
            } catch {
                res.status(400).json({ error: "Invalid Staff Id" });
                return;
            }
    
            res.status(200).json({ message: `Staff with id '${staffId}' deleted successfully` });
            return;
        }

        res.status(500).json({ error: "Internal server error, visit '/stat' endpoint." });
        return;
    }
}