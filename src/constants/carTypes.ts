export interface carsData {
    brand: string;
    model: string;
    bodyType: string;
    transmission: 'manual' | 'automatic';
    price: number;
    horsePower: number;
    fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
    mileage: number;
    year: number;
    imgUrl: string;    
}