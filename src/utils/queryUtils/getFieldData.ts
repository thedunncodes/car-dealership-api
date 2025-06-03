import { WithId, Document } from "mongodb";
import { carQueryData } from "../../constants/carTypes";
import {
    brandQuery, modelQuery, bodyTypeQuery, transmissionQuery,
    fuelTypeQuery, yearQuery, priceQuery, mileageQuery
} from "../dbUtils/carQueries";

/**
 * This function retrieves car data based on the provided valid fields and query fields.
 * It queries the database for each field and returns an array of documents that match the criteria.
 *
 * @param {keyof carQueryData[]} validFields - The fields that are valid for querying.
 * @param {carQueryData} queryFields - The fields to query by.
 * @returns {Promise<WithId<Document>[]>} - A promise that resolves to an array of car documents.
 */
export default async function getFieldData (
    validFields: (keyof carQueryData)[], queryFields: carQueryData): Promise<WithId<Document>[]> {
    const queryData: WithId<Document>[] = [];

    for (const field of validFields) {
        if (field === "brand" && queryFields[field]) {
            const carBrands = await brandQuery(queryFields[field]);
            queryData.push(...carBrands);
        }

        if (field === "model" && queryFields[field]) {
            const carModels = await modelQuery(queryFields[field]);
            queryData.push(...carModels);
        }
        if (field === "bodyType" && queryFields[field]) {
            const carBodyTypes = await bodyTypeQuery(queryFields[field]);
            queryData.push(...carBodyTypes);
        }
        if (field === "transmission" && queryFields[field]) {
            const carTransmissions = await transmissionQuery(queryFields[field]);
            queryData.push(...carTransmissions);
        }
        if (field === "fuelType" && queryFields[field]) {
            const carFuelTypes = await fuelTypeQuery(queryFields[field]);
            queryData.push(...carFuelTypes);
        }
        if (field === "year" && queryFields[field]) {
            const carYears = await yearQuery(Number(queryFields[field]));
            queryData.push(...carYears);
        }
        if (field === "price" && queryFields[field]) {
            const carPrices = await priceQuery(Number(queryFields[field]));
            queryData.push(...carPrices);
        }
        if (field === "mileage" && queryFields[field]) {
            const carMileages = await mileageQuery(Number(queryFields[field]));
            queryData.push(...carMileages);
        }
    }

    return queryData;
}