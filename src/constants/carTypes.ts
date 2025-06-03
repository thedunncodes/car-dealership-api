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

export interface carsUpdateData {
    brand?: string;
    model?: string;
    bodyType?: string;
    transmission?: 'manual' | 'automatic';
    price?: number;
    horsePower?: number;
    fuelType?: 'petrol' | 'diesel' | 'electric' | 'hybrid';
    mileage?: number;
    year?: number;
    imgUrl?: string;
    sold?: boolean;
}

export interface carQueryData {
    brand?: string;
    model?: string;
    bodyType?: string;
    transmission?: 'manual' | 'automatic';
    price?: number;
    fuelType?: 'petrol' | 'diesel' | 'electric' | 'hybrid';
    mileage?: number;
    year?: number;
}