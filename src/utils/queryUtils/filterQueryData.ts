import { WithId, Document } from "mongodb";
import { carQueryData } from "../../constants/carTypes";

export default function filterQueryData (
    queryData: WithId<Document>[], validFields: (keyof carQueryData)[],
    queryFields: carQueryData)  {
    const filteredData: WithId<Document>[] = [];

    for (const car of queryData) {
        const isValid = Object.fromEntries(
            validFields.map((field) => [field, false])
        );  
        (Object.keys(car) as (keyof carQueryData)[]).some((key) => {
            if (key === "brand" && queryFields.brand) {
                isValid.brand = String(car[key]).toLocaleLowerCase().includes(queryFields.brand.toLocaleLowerCase());
            }
            if (key === "model" && queryFields.model) {
                isValid.model = String(car[key]).toLocaleLowerCase().includes(queryFields.model.toLocaleLowerCase());
            }
            if (key === "bodyType" && queryFields.bodyType) {
                isValid.bodyType = (String(car[key]).toLocaleLowerCase().includes(queryFields.bodyType.toLocaleLowerCase()));
            }
            if (key === "transmission" && queryFields.transmission) {
                console.log("ran")
                isValid.transmission = (car[key] === queryFields.transmission);
            }
            if (key === "fuelType" && queryFields.fuelType) {
                isValid.fuelType = (car[key] === queryFields.fuelType);
            }
            if (key === "year" && queryFields.year) {
                isValid.year = (car[key] <= queryFields.year);
            }
            if (key === "price" && queryFields.price) {
                isValid.price = (car[key] <= queryFields.price);
            }
            if (key === "mileage" && queryFields.mileage) {
                isValid.mileage = (car[key] <= queryFields.mileage);
            }
        });

        if (Object.values(isValid).every((value) => value === true)) {
            if (!filteredData.some(existingCar => existingCar._id.equals(car._id))) {
                filteredData.push(car);
            }
        }
    }

    const formattedData = filteredData.map((car) => ({
            id: car._id.toString(),
            brand: car.brand,
            model: car.model,
            bodyType: car.bodyType,
            transmission: car.transmission,
            price: car.price,
            horsePower: car.horsePower,
            fuelType: car.fuelType,
            mileage: car.mileage,
            year: car.year,
            imgUrl: car.imgUrl,
        }));
    return {filteredData, formattedData};

}