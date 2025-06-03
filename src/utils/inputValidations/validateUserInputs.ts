/**
 * Validates the inputs for a Registration form.
 * @param {string} email - The email address to validate.
 * @param {string} password - The password to validate.
 * @returns {Object} An object containing an error message if validation fails, or an empty object if validation passes.
 */
export default function validateUserInputs(name:string, email:string, password:string): { error?: string } {
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
        return { error: "Invalid input types: name, email, and password must be strings." };
    }

    if (!name.trim() || !email.trim() || !password.trim()) {
        return { error: "Invalid input values: name, email, and password cannot be empty."};
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return { error: "Invalid email format." };
    }

    if (password.length < 6) {
        return { error: "Password must be at least 6 characters long." };
    }

    return {};
}