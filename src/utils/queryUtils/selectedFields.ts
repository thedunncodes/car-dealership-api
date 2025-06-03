import { carQueryData } from "../../constants/carTypes";

/**
 * This function filters the query fields to return only those that are present and have a truthy value.
 * It returns an array of keys from the carQueryData type that are present in the queryFields object.
 *
 * @param {carQueryData} queryFields - The object containing query fields to filter.
 * @returns {(keyof carQueryData)[]} - An array of keys from carQueryData that are present in queryFields.
 */
export default function selectedFields(queryFields: carQueryData): (keyof carQueryData)[]  {
    const presentFields = (Object.keys(queryFields) as (keyof carQueryData)[]).filter((key) => {
        if (queryFields[key]) {
            return key;
        }
    })

    return presentFields;
}