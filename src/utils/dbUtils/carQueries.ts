import dbClient from "../../libs/database/db"

export async function brandQuery(brand: string) {
    const carColls = dbClient.db?.collection("cars");
    const carBrands = await carColls?.find({ brand: { $regex: `${brand}`, $options: "i" }, sold: false }).toArray();

    return carBrands || [];
}

export async function modelQuery(model: string) {
    const carColls = dbClient.db?.collection("cars");
    const carBrands = await carColls?.find({ model: { $regex: `${model}`, $options: "i" }, sold: false }).toArray();

    return carBrands || [];
}

export async function bodyTypeQuery(bodyType: string) {
    const validBodyType = [
        'SUV', 'Hatchback', 'Saloon', 'Coupe',
        'Convertible', 'Van', 'Pick-up', 'Chassis Cab'
    ].includes(bodyType)
    if (!validBodyType) {
        return [];
    }
    const carColls = dbClient.db?.collection("cars");
    const carBrands = await carColls?.find({ bodyType, sold: false }).toArray();

    return carBrands || [];
}

export async function transmissionQuery(transmission: string) {
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

export async function fuelTypeQuery(fuelType: string) {
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

export async function yearQuery(year: number) {
    const currentYear = new Date().getFullYear();
    if (year < 1886 || year > currentYear) {
        return [];
    }
    const carColls = dbClient.db?.collection("cars");
    const carBrands = await carColls?.find({ year, sold: false }).toArray();

    return carBrands || [];
}
export async function priceQuery(price: number) {
    if (price < 0) {
        return [];
    }
    const carColls = dbClient.db?.collection("cars");
    const carBrands = await carColls?.find({ price: { $lte: price }, sold: false }).toArray();

    return carBrands || [];
}
export async function mileageQuery(mileage: number) {
    if (mileage < 0) {
        return [];
    }
    const carColls = dbClient.db?.collection("cars");
    const carBrands = await carColls?.find({ mileage: { $lte: mileage }, sold: false }).toArray();

    return carBrands || [];
}