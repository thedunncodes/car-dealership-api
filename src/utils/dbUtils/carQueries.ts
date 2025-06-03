import { WithId, Document } from "mongodb";
import dbClient from "../../libs/database/db"


/**
 * This function queries the database for cars with a specific brand.
 * It uses a regular expression to match the brand name case-insensitively.
 * If no cars are found, it returns an empty array.
 * 
 * @param {string} brand - The brand name to search for.
 * @returns {Promise<WithId<Document>[]>} - A promise that resolves to an array of car objects or an empty array if no cars are found.
 */
export async function brandQuery(brand: string): Promise<WithId<Document>[]> {
    const carColls = dbClient.db?.collection("cars");
    const carBrands = await carColls?.find({ brand: { $regex: `${brand}`, $options: "i" }, sold: false }).toArray();

    return carBrands || [];
}

/**
 * This function queries the database for cars with a specific model.
 * It uses a regular expression to match the model name case-insensitively.
 * If no cars are found, it returns an empty array.
 * 
 * @param {string} model - The model name to search for.
 * @returns {Promise<WithId<Document>[]>} - A promise that resolves to an array of car objects or an empty array if no cars are found.
 */
export async function modelQuery(model: string): Promise<WithId<Document>[]> {
    const carColls = dbClient.db?.collection("cars");
    const carBrands = await carColls?.find({ model: { $regex: `${model}`, $options: "i" }, sold: false }).toArray();

    return carBrands || [];
}

/**
 * This function queries the database for cars with a specific body type.
 * It checks if the body type is valid from a predefined list.
 * If the body type is invalid or no cars are found, it returns an empty array.
 * 
 * @param {string} bodyType - The body type to search for.
 * @returns {Promise<WithId<Document>[]>} - A promise that resolves to an array of car objects or an empty array if no cars are found.
 */
export async function bodyTypeQuery(bodyType: string): Promise<WithId<Document>[]> {
    const validBodyType = [
        'suv', 'hatchback', 'saloon', 'coupe',
        'convertible', 'van', 'pick-up', 'chassis Cab'
    ].includes(bodyType)
    if (!validBodyType) {
        return [];
    }
    const carColls = dbClient.db?.collection("cars");
    const carBrands = await carColls?.find({ bodyType: { $regex: `^${bodyType}$`, $options: "i" }, sold: false }).toArray();

    return carBrands || [];
}

/**
 * This function queries the database for cars with a specific transmission type.
 * It checks if the transmission type is valid from a predefined list.
 * If the transmission type is invalid or no cars are found, it returns an empty array.
 * 
 * @param {string} transmission - The transmission type to search for.
 * @returns {Promise<WithId<Document>[]>} - A promise that resolves to an array of car objects or an empty array if no cars are found.
 */
export async function transmissionQuery(transmission: string): Promise<WithId<Document>[]> {
    const validtransmission = [
        'manual', 'automatic'
    ].includes(transmission)
    if (!validtransmission) {
        return [];
    }
    const carColls = dbClient.db?.collection("cars");
    const carBrands = await carColls?.find({ transmission, sold: false }).toArray();

    return carBrands || [];
}

/**
 * This function queries the database for cars with a specific fuel type.
 * It checks if the fuel type is valid from a predefined list.
 * If the fuel type is invalid or no cars are found, it returns an empty array.
 * 
 * @param {string} fuelType - The fuel type to search for.
 * @returns {Promise<WithId<Document>[]>} - A promise that resolves to an array of car objects or an empty array if no cars are found.
 */
export async function fuelTypeQuery(fuelType: string): Promise<WithId<Document>[]> {
    const validFuelType = [
        'petrol', 'diesel', 'electric', 'hybrid'
    ].includes(fuelType)
    if (!validFuelType) {
        return [];
    }
    const carColls = dbClient.db?.collection("cars");
    const carBrands = await carColls?.find({ fuelType, sold: false }).toArray();

    return carBrands || [];
}

/**
 * This function queries the database for cars manufactured in a specific year.
 * It checks if the year is within a valid range (1886 to current year).
 * If the year is invalid or no cars are found, it returns an empty array.
 * 
 * @param {number} year - The year of manufacture to search for.
 * @returns {Promise<WithId<Document>[]>} - A promise that resolves to an array of car objects or an empty array if no cars are found.
 */
export async function yearQuery(year: number): Promise<WithId<Document>[]> {
    const currentYear = new Date().getFullYear();
    if (year < 1886 || year > currentYear) {
        return [];
    }
    const carColls = dbClient.db?.collection("cars");
    const carBrands = await carColls?.find({ year, sold: false }).toArray();

    return carBrands || [];
}

/**
 * This function queries the database for cars with a price less than or equal to a specified amount.
 * If the price is negative, it returns an empty array.
 * 
 * @param {number} price - The maximum price to search for.
 * @returns {Promise<WithId<Document>[]>} - A promise that resolves to an array of car objects or an empty array if no cars are found.
 */
export async function priceQuery(price: number): Promise<WithId<Document>[]> {
    if (price < 0) {
        return [];
    }
    const carColls = dbClient.db?.collection("cars");
    const carBrands = await carColls?.find({ price: { $lte: price }, sold: false }).toArray();

    return carBrands || [];
}

/**
 * This function queries the database for cars with mileage less than or equal to a specified amount.
 * If the mileage is negative, it returns an empty array.
 * 
 * @param {number} mileage - The maximum mileage to search for.
 * @returns {Promise<WithId<Document>[]>} - A promise that resolves to an array of car objects or an empty array if no cars are found.
 */
export async function mileageQuery(mileage: number): Promise<WithId<Document>[]> {
    if (mileage < 0) {
        return [];
    }
    const carColls = dbClient.db?.collection("cars");
    const carBrands = await carColls?.find({ mileage: { $lte: mileage }, sold: false }).toArray();

    return carBrands || [];
}