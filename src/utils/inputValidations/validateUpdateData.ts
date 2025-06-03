import { userDataUpdate } from "../../constants/userTypes";

/**
 * This function validates the data provided for updating user information.
 * It checks if at least one field (email, name, or password) is provided,
 * ensures that all fields are strings, and checks for valid email format and password length.
 *
 * @param {userDataUpdate} data - The data to validate.
 * @returns {{ error?: string }} - An object containing an error message if validation fails.
 */
export default function validateUpdateData(data: userDataUpdate): { error?: string } {
    const result: { error?: string } = {};

    if (!data.email && !data.name && !data.password) {
        return { error: "At least one field (email, name, or password) must be provided for update." };
    }

    (Object.keys(data) as (keyof userDataUpdate)[]).forEach((key) => {
        const value = data[key];
        if (value && typeof value !== 'string') {
            result.error = `Invalid input type for '${String(key)}': field must be a string.`;
        }
        if (value && typeof value === 'string' && !value.trim()) {
            result.error = `Invalid input value for '${String(key)}': field cannot be empty.`;
        }
    });


    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailPattern.test(data.email)) {
        return { error: "Invalid email format." };
    }

    if (data.password && (data.password.length < 6)) {
        return { error: "Password must be at least 6 characters long." };
    }

    return result;
}