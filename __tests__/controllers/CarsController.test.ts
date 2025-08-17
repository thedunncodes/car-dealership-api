import request from "supertest";
import { ObjectId } from 'mongodb';
import app from "../../src/server";
import dbClient from "../../src/libs/database/db";
import mockData from "../../src/constants/tests/testData";
import { mockCarsData } from "../../src/constants/tests/carTestData";

describe("Cars Controller Tests", () => {    
    beforeAll(async () => {
        await dbClient.initiateConnection();
    });
    
    afterAll(async () => {
        if (dbClient.isAlive()) {
            await dbClient.close();
        }
    });

    const carData = { ...mockCarsData[7] };
    carData.model = 'G-toBeCreatedAndDeleted';
    let adminToken: string = 'no-token';
    let userToken: string = 'no-token';
    let carId: string = '';


    it("Should return 200 OK and 2 tokens on 'POST /login' with valid data for admin and normal user", async () => {
        const adminRes = await request(app).post(`/admin/register/${process.env.ADMIN_SLUG}`).send(mockData[6]);
        const userRes = await request(app).post('/register').send(mockData[5]);
        if (adminRes.body.error) {
            expect(adminRes.body.error).toEqual(`Unauthorized, Admin User already exists`);
        } else {
            expect(adminRes.status).toEqual(201);
        }
        if (userRes.body.error) {
            expect(userRes.body.error).toEqual(`User with email '${mockData[5].email}' already exists`);
        } else {
            expect(userRes.status).toEqual(201);
        }
        const adminLoginRes = await request(app).post('/login').send(mockData[6]);
        const userLoginRes = await request(app).post('/login').send(mockData[5]);

        expect(adminLoginRes.status).toEqual(200);
        expect(userLoginRes.status).toEqual(200);

        expect(adminLoginRes.body.token).toBeDefined();
        expect(userLoginRes.body.token).toBeDefined();
        adminToken = adminLoginRes.body.token;
        userToken = userLoginRes.body.token;
    });

    it("Should create a car, return 201 created and set carId", async () => {
        const res = await request(app).post('/inventory/cars/create').send(carData).set('x-token', adminToken);
        expect(res.status).toEqual(201);
        expect(res.body.message).toEqual(`Car '${carData.brand} ${carData.model}' created and added to inventory succesfully`);

        const url = `/cars?brand=${carData.brand.toLowerCase()}` +
            `&model=${carData.model.toLowerCase()}` +
            `&bodyType=${carData.bodyType.toLowerCase()}` +
            `&fuelType=${carData.fuelType}` +
            `&transmission=${carData.transmission}` +
            `&price=${carData.price}` +
            `&mileage=${carData.mileage}` +
            `&year=${carData.year}`
        const carRes = await request(app).get(url);
        carId = carRes.body[0].id;
    });


    describe("POST /inventory/cars/create", () => {
        it("Should return 401 Unauthorized on 'POST /inventory/cars/create' with no token", async () => {
            const res = await request(app).post('/inventory/cars/create');
            expect(res.status).toEqual(401);
        });

        it("Should return 401 Unauthorized on 'POST /inventory/cars/create' with invalid token", async () => {
            const res = await request(app).post('/inventory/cars/create').set('x-token', `invalid-token`);
            expect(res.status).toEqual(401);
        });

        it("Should return 403 forbidden on 'POST /inventory/cars/create' with a valid user token", async () => {
            const res = await request(app).post('/inventory/cars/create').set('x-token', userToken);
            expect(res.status).toEqual(403);
            expect(res.body.error).toEqual("Forbidden, access denied.");
        });

        it("Should return 400 Bad Request on 'POST /inventory/cars/create' with data that has empty string fields", async () => {
            const res = await request(app).post('/inventory/cars/create').send(mockCarsData[0]).set('x-token', adminToken);
            expect(res.status).toEqual(400);
        });

        it("Should return 400 Bad Request on 'POST /inventory/cars/create' with data that has empty integer fields", async () => {
            const res = await request(app).post('/inventory/cars/create').send(mockCarsData[1]).set('x-token', adminToken);
            expect(res.status).toEqual(400);
        });

        it("Should return 400 Bad Request on 'POST /inventory/cars/create' with data that has an invalid 'bodyType' field", async () => {
            const res = await request(app).post('/inventory/cars/create').send(mockCarsData[2]).set('x-token', adminToken);
            expect(res.status).toEqual(400);
        });

        it("Should return 400 Bad Request on 'POST /inventory/cars/create' with data that has an invalid 'transmission' field", async () => {
            const res = await request(app).post('/inventory/cars/create').send(mockCarsData[3]).set('x-token', adminToken);
            expect(res.status).toEqual(400);
        });

        it("Should return 400 Bad Request on 'POST /inventory/cars/create' with data that has an invalid 'fuelType' field", async () => {
            const res = await request(app).post('/inventory/cars/create').send(mockCarsData[4]).set('x-token', adminToken);
            expect(res.status).toEqual(400);
        });

        it("Should return 400 Bad Request on 'POST /inventory/cars/create' with data that has an invalid 'year' field", async () => {
            const res = await request(app).post('/inventory/cars/create').send(mockCarsData[5]).set('x-token', adminToken);
            expect(res.status).toEqual(400);
        });

        it("Should return 400 Bad Request on 'POST /inventory/cars/create' with data that has an invalid 'imgUrl' field", async () => {
            const res = await request(app).post('/inventory/cars/create').send(mockCarsData[6]).set('x-token', adminToken);
            expect(res.status).toEqual(400);
        });

        it("Should return 201 Created on 'POST /inventory/cars/create' with valid data", async () => {
            const res = await request(app).post('/inventory/cars/create').send(mockCarsData[7]).set('x-token', adminToken);
            expect(res.status).toEqual(201);
            expect(res.body.message).toEqual(`Car '${mockCarsData[7].brand} ${mockCarsData[7].model}' created and added to inventory succesfully`);
        });
    });

    describe("PUT /inventory/cars/update/:carId", () => {
        it("Should return 401 Unauthorized on 'PUT /inventory/cars/update/:carId' with no token", async () => {
            const res = await request(app).put(`/inventory/cars/update/${carId}`);
            expect(res.status).toEqual(401);
        });

        it("Should return 401 Unauthorized on 'PUT /inventory/cars/update/:carId' with invalid token", async () => {
            const res = await request(app).put(`/inventory/cars/update/${carId}`).set('x-token', `invalid-token`);
            expect(res.status).toEqual(401);
        });
        
        it("Should return 403 forbidden on 'PUT /inventory/cars/update/:carId' with a valid user token", async () => {
            const res = await request(app).put(`/inventory/cars/update/${carId}`).set('x-token', userToken);
            expect(res.status).toEqual(403);
            expect(res.body.error).toEqual("Forbidden, access denied.");
        });

        it("Should return 404 Not Found on 'PUT /inventory/cars/update/:carId' with a valid token and non-existing carId", async () => {
            const res = await request(app).put(`/inventory/cars/update/${new ObjectId()}`).send({ price: 3000 }).set('x-token', adminToken);
            expect(res.status).toEqual(404);
            expect(res.body.error).toEqual("Car not found");
        });
        
        it("Should return 404 Not Found on 'PUT /inventory/cars/update/:carId' with a valid token and invalid carId", async () => {
            const res = await request(app).put('/inventory/cars/update/60d5-invalid-id').send({ price: 3000 }).set('x-token', adminToken);
            expect(res.status).toEqual(404);
            expect(res.body.error).toEqual("Car not found");
        });

        it("Should return 400 Bad Request on 'PUT /inventory/cars/update/:carId' with empty data", async () => {
            const res = await request(app).put(`/inventory/cars/update/${carId}`).send({}).set('x-token', adminToken);
            expect(res.status).toEqual(400);
        });

        it("Should return 400 Bad Request on 'PUT /inventory/cars/update/:carId' with data that has an invalid 'bodyType' field", async () => {
            const res = await request(app).put(`/inventory/cars/update/${carId}`).send(mockCarsData[2]).set('x-token', adminToken);
            expect(res.status).toEqual(400);
        });

        it("Should return 400 Bad Request on 'PUT /inventory/cars/update/:carId' with data that has an invalid 'transmission' field", async () => {
            const res = await request(app).put(`/inventory/cars/update/${carId}`).send(mockCarsData[3]).set('x-token', adminToken);
            expect(res.status).toEqual(400);
        });

        it("Should return 400 Bad Request on 'PUT /inventory/cars/update/:carId' with data that has an invalid 'fuelType' field", async () => {
            const res = await request(app).put(`/inventory/cars/update/${carId}`).send(mockCarsData[4]).set('x-token', adminToken);
            expect(res.status).toEqual(400);
        });

        it("Should return 400 Bad Request on 'PUT /inventory/cars/update/:carId' with data that has an invalid 'year' field", async () => {
            const res = await request(app).put(`/inventory/cars/update/${carId}`).send(mockCarsData[5]).set('x-token', adminToken);
            expect(res.status).toEqual(400);
        });

        it("Should return 400 Bad Request on 'PUT /inventory/cars/update/:carId' with data that has an invalid 'imgUrl' field", async () => {
            const res = await request(app).put(`/inventory/cars/update/${carId}`).send(mockCarsData[6]).set('x-token', adminToken);
            expect(res.status).toEqual(400);
        });

        it("Should return 200 OK on 'PUT /inventory/cars/update/:carId' with valid data", async () => {
            const res = await request(app).put(`/inventory/cars/update/${carId}`).send(mockCarsData[7]).set('x-token', adminToken);
            expect(res.status).toEqual(200);
            expect(res.body.message).toEqual(`Car with id '${carId}' updated successfully`);
        });
    });

    describe("POST /inventory/cars/buy/:carId", () => {
        const amountPaid: number = 30 

        it("Should return 401 Unauthorized on 'POST /inventory/cars/buy/:carId' with no token", async () => {
                const res = await request(app).post(`/inventory/cars/buy/${carId}`);
                expect(res.status).toEqual(401);
            });

            it("Should return 401 Unauthorized on 'POST /inventory/cars/buy/:carId' with invalid token", async () => {
                const res = await request(app).post(`/inventory/cars/buy/${carId}`).set('x-token', `invalid-token`);
                expect(res.status).toEqual(401);
            })

            it("Should return 404 Not Found on 'POST /inventory/cars/buy/:carId' with incorrect car Id", async () => {
                const res = await request(app).post(`/inventory/cars/buy/${new ObjectId()}`).set('x-token', adminToken);
                expect(res.status).toEqual(404);
                expect(res.body.error).toEqual("Car not found/Invalid car id ");
            });

            it("Should return 404 Not Found on 'POST /inventory/cars/buy/:carId' with invalid car Id", async () => {
                const res = await request(app).post(`/inventory/cars/buy/60d5-invalid-id`).set('x-token', adminToken);
                expect(res.status).toEqual(404);
                expect(res.body.error).toEqual("Car not found/Invalid car id ");
            });

            it("Should return 400 Bad Request on 'POST /inventory/cars/buy/:carId' with no amount paid", async () => {
                const res = await request(app).post(`/inventory/cars/buy/${carId}`).set('x-token', adminToken);
                expect(res.status).toEqual(400);
                expect(res.body.error).toEqual("Invalid amount provided, it should be a positive number");
            });

            it("Should return 400 Bad Request on 'POST /inventory/cars/buy/:carId' with Insufficient amount paid", async () => {
                const res = await request(app).post(`/inventory/cars/buy/${carId}`).send({ amountPaid }).set('x-token', adminToken);
                expect(res.status).toEqual(400);
                expect(res.body.error).toEqual(`Insufficient amount, the car price is $${carData.price}, but you provided $${amountPaid}`);
            });

            it("Should return 200 OK on 'POST /inventory/cars/buy/:carId' with valid carId and amount paid", async () => {
                const res = await request(app).post(`/inventory/cars/buy/${carId}`).send({ amountPaid: carData.price }).set('x-token', adminToken);
                expect(res.status).toEqual(200);
                expect(res.body.message).toContain("Purchase successful with purchase id")
            });

            it("Should return 400 Bad Request on 'POST /inventory/cars/buy/:carId' with valid carId and amount paid, indicating the car is sold", async () => {
                const res = await request(app).post(`/inventory/cars/buy/${carId}`).send({ amountPaid: carData.price }).set('x-token', adminToken);
                expect(res.status).toEqual(400);
                expect(res.body.error).toEqual(`Car with id '${carId}' already sold`)
            });
    });

    describe("DELETE /inventory/cars/delete/:carId", () => {
        it("Should return 401 Unauthorized on 'DELETE /inventory/cars/delete/:carId' with no token", async () => {
                const res = await request(app).delete(`/inventory/cars/delete/${carId}`);
                expect(res.status).toEqual(401);
            });

            it("Should return 401 Unauthorized on 'DELETE /inventory/cars/delete/:carId' with invalid token", async () => {
                const res = await request(app).delete(`/inventory/cars/delete/${carId}`).set('x-token', `invalid-token`);
                expect(res.status).toEqual(401);
            })

            it("Should return 404 Not Found on 'DELETE /inventory/cars/delete/:carId' with incorrect car Id", async () => {
                const res = await request(app).delete(`/inventory/cars/delete/${new ObjectId()}`).set('x-token', adminToken);
                expect(res.status).toEqual(404);
                expect(res.body.error).toEqual("Car not found");
            });
            
            it("Should return 400 Bad Request on 'DELETE /inventory/cars/delete/:carId' with invalid car Id", async () => {
                const res = await request(app).delete(`/inventory/cars/delete/60d5-invalid-id`).set('x-token', adminToken);
                expect(res.status).toEqual(400);
                expect(res.body.error).toEqual("Invalid Car Id");
            });
            
            it("Should return 403 forbidden on 'DELETE /inventory/cars/delete/:carId' with a valid user token", async () => {
                const res = await request(app).delete(`/inventory/cars/delete/${carId}`).set('x-token', userToken);
                expect(res.status).toEqual(403);
                expect(res.body.error).toEqual("Forbidden, access denied.");
            });

            it("Should return 200 OK on 'DELETE /inventory/cars/delete/:carId' with valid admin user token and carId", async () => {
                const res = await request(app).delete(`/inventory/cars/delete/${carId}`).set('x-token', adminToken);
                expect(res.status).toEqual(200);
                expect(res.body.message).toEqual(`Car with id '${carId}' deleted successfully`);
            });
    });
});