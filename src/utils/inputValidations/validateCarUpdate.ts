import { carsUpdateData } from "../../constants/carTypes";

export default function validateCarUpdate(data: carsUpdateData): { error?: string | null } {
    const { transmission, bodyType, fuelType, year } = data;
    
    const allUndefined = Object.values(data).every((value) => {
        if (!value) return true;
    })
    if (allUndefined) {
        return { error: "At least one field (brand, model, bodyType...) must be provided for a car update." };
    }
    
    const requiredStrings: [keyof carsUpdateData][] = [
        ['brand'], ['model'], ['imgUrl']
    ];
    const requiredIntegers: [keyof carsUpdateData][] = [
        ['price'], ['horsePower'], ['mileage']
    ];

    for (const [key] of requiredStrings) {
        if (data[key] && (typeof data[key] !== 'string' || data[key].trim() === '')) {
        return { error: `'${key}' field must contain a non-empty string.` };
        }
    }

    for (const [key] of requiredIntegers) {
        if (data[key] && (typeof data[key] !== 'number' || data[key] < 0)) {
        return { error: `'${key}' field must contain a positive number.` };
        }
    }

    if (transmission && (!['manual', 'automatic'].includes(transmission))) {
        return { error: "'transmission' field must be either 'manual' or 'automatic'." };
    }


    if (fuelType && (!['petrol', 'diesel', 'electric', 'hybrid'].includes(fuelType))) {
        return { error: "'fuelType' field can only be one of 'petrol', 'diesel', 'electric', or 'hybrid'." };
    }

    if (bodyType && (![
        'SUV', 'Hatchback', 'Saloon', 'Coupe',
        'Convertible', 'Van', 'Pick-up', 'Chassis Cab'
    ].includes(bodyType))) {
        return {
            error: `'bodyType' field can only be one of 'SUV', 'Hatchback','Saloon', 'Coupe','Convertible', 'Van', 'Pick-up', or 'Chassis Cab'.`
        };
    }


    const currentYear = new Date().getFullYear();
    if (year && (typeof year !== 'number' || year < 1886 || year > currentYear)) {
        return { error: "'year' field must contain a valid year, between 1886 and current year." };
    }

    const httpCheck = data.imgUrl && (data.imgUrl.startsWith('http://') || data.imgUrl.startsWith('https://'));
    if (!httpCheck && data.imgUrl) {
        return { error: "'imgUrl' field must be a valid URL starting with 'http://' or 'https://'." };
    }

    if (data.sold && typeof data.sold !== 'boolean') {
        return { error: "'sold' field must be a boolean value." };
    }
    return { error: null };
}