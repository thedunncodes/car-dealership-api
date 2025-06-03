/* * This file defines TypeScript interfaces for car data structures.
 * It includes interfaces for user data, login data, JWT payload, and user data updates.
 * These interfaces are used to ensure type safety and consistency across the application.
 */
export interface userData {
    name: string;
    email: string;
    password: string;
}

export interface loginData {
    name: string;
    email: string;
    password: string;
}

export interface jwtPayloadProp {
    id: string;
    email: string;
    role: string;
}

export interface userDataUpdate {
    name?: string;
    email?: string;
    password?: string;
}