/**
*  This file defines TypeScript interfaces for car data structures.
* It includes interfaces for car data, car update data, query data, and formatted data.
* These interfaces are used to ensure type safety and consistency across the application.
*/  
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

export interface formattedDataProps {
    id: string;
    brand: string;
    model: string;
    bodyType: string;
    transmission: string;
    price: number;
    horsePower: number;
    fuelType: string;
    mileage: number;
    year: number;
    imgUrl: string;
}