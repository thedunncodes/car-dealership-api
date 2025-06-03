import { carQueryData } from "../../constants/carTypes";

export default function selectedFields(queryFields: carQueryData): (keyof carQueryData)[]  {
    const presentFields = (Object.keys(queryFields) as (keyof carQueryData)[]).filter((key) => {
        if (queryFields[key]) {
            return key;
        }
    })

    return presentFields;
}