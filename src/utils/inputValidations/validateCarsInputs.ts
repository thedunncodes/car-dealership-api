import { carsData } from "../../constants/carTypes";

/**
 * This function validates the input data for car details.
 * It checks if all required fields are present and valid.
 * If any validation fails, it returns an error message.
 * If all validations pass, it returns null.
 *
 * @param {carsData} data - The car data to validate.
 * @returns {{ error?: string | null }} - An object containing an error message or null if validation passes.
 */
export default function validateCarsInputs(data: carsData): { error?: string | null } {
    const { transmission, bodyType, fuelType, year } = data;
    const requiredStrings: [keyof carsData][] = [
        ['brand'], ['model'], ['imgUrl']
    ];
    const requiredIntegers: [keyof carsData][] = [
        ['price'], ['horsePower'], ['mileage']
    ];

    for (const [key] of requiredStrings) {
        if (!data[key] || typeof data[key] !== 'string' || data[key].trim() === '') {
        return { error: `'${key}' field is required and must contain a non-empty string.` };
        }
    }

    for (const [key] of requiredIntegers) {
        if (typeof data[key] !== 'number' || data[key] < 0) {
        return { error: `'${key}' field must contain a positive number.` };
        }
    }

    if (!['manual', 'automatic'].includes(transmission)) {
        return { error: "'transmission' field must be either 'manual' or 'automatic'." };
    }


    if (!['petrol', 'diesel', 'electric', 'hybrid'].includes(fuelType)) {
        return { error: "'fuelType' field can only be one of 'petrol', 'diesel', 'electric', or 'hybrid'." };
    }

    if (![
        'SUV', 'Hatchback', 'Saloon', 'Coupe',
        'Convertible', 'Van', 'Pick-up', 'Chassis Cab'
    ].includes(bodyType)) {
        return {
            error: `'bodyType' field can only be one of 'SUV', 'Hatchback','Saloon', 'Coupe','Convertible', 'Van', 'Pick-up', or 'Chassis Cab'.`
        };
    }


    const currentYear = new Date().getFullYear();
    if (typeof year !== 'number' || year < 1886 || year > currentYear) {
        return { error: "'year' field must contain a valid year, between 1886 and current year." };
    }

    const httpCheck = data.imgUrl.startsWith('http://') || data.imgUrl.startsWith('https://');
    if (!httpCheck) {
        return { error: "'imgUrl' field must be a valid URL starting with 'http://' or 'https://'." };
    }
    return { error: null };
}