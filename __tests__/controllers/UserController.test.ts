import request from "supertest";
import app from "../../src/server";
import dbClient from "../../src/libs/database/db";
import mockData from "../../src/constants/tests/testData";
import { mockCarsData } from "../../src/constants/tests/carTestData";

describe("User Controller Tests", () => {
    beforeAll(async () => {
        await dbClient.initiateConnection();
    });

    afterAll(async () => {
        if (dbClient.isAlive()) {
            await dbClient.close();
        }
    })
    describe("POST /register", () => {
        it("Should return 400 Bad Request on 'POST /register' with empty data", async () => {
            const res = await request(app).post('/register').send(mockData[0]);
            expect(res.status).toEqual(400);
        });

        it("Should return 400 Bad Request on 'POST /register' with invalid password", async () => {
            const res = await request(app).post('/register').send(mockData[1]);
            expect(res.status).toEqual(400);
        });

        it("Should return 400 Bad Request on 'POST /register' with invalid email", async () => {
            const res = await request(app).post('/register').send(mockData[2]);
            expect(res.status).toEqual(400);
        });

        it("Should return 400 Bad Request on 'POST /register' with short password", async () => {
            const res = await request(app).post('/register').send(mockData[3]);
            expect(res.status).toEqual(400);
        });

        it("Should return 201 Created on 'POST /register' with valid data", async () => {
            const res = await request(app).post('/register').send(mockData[5]);
            if (res.body.error) {
                expect(res.body.error).toEqual(`User with email '${mockData[5].email}' already exists`);
                return;
            }
            expect(res.status).toEqual(201);
        });
    });

    describe("Tests on protected routes", () => {
        let token: string = 'no-token';
        let staffToken: string = 'no-token';
        
        it("Should return 200 OK and 2 tokens on 'POST /login' with valid data for a staff and a normal user", async () => {
            // create a non-staff user
            const res = await request(app).post('/register').send(mockData[5]);
            if (res.body.error) {
                expect(res.body.error).toEqual(`User with email '${mockData[5].email}' already exists`);
            } else {
                expect(res.status).toEqual(201);
            }
            const loginRes = await request(app).post('/login').send(mockData[5]);
            expect(loginRes.status).toEqual(200);
            expect(loginRes.body.token).toBeDefined();
            token = loginRes.body.token;

            // Create a staff user
            const staffRes = await request(app).post(`/admin/register/${process.env.ADMIN_SLUG}`).send(mockData[7]);
            if (staffRes.body.error) {
                expect(staffRes.body.error).toEqual(`User with email '${mockData[7].email}' already exists`);
            } else {
                expect(staffRes.status).toEqual(201);
                expect(staffRes.body.message).toEqual(`Staff with email '${mockData[7].email}' created succesfully`);
            }
            const staffLoginRes = await request(app).post('/login').send(mockData[7]);

            expect(staffLoginRes.status).toEqual(200);
            expect(staffLoginRes.body.token).toBeDefined();
            staffToken = staffLoginRes.body.token;
        });

        describe("GET /user", () => {
            it("Should return 401 Unauthorized on 'GET /user' with no token", async () => {
                const res = await request(app).get('/user');
                expect(res.status).toEqual(401);
            });

            it("Should return 401 Unauthorized on 'GET /user' with invalid token", async () => {
                const res = await request(app).get('/user').set('x-token', `invalid-token`);
                expect(res.status).toEqual(401);
            });
            
            it("Should return user information on 'GET /user' with valid token", async () => {
                const res = await request(app).get('/user').set('x-token', token);
                const userData = res.body.myInfo;
                expect(res.status).toEqual(200);
                expect(userData).toHaveProperty('id');
                expect(userData).toHaveProperty('name');
                expect(userData).toHaveProperty('email');
                expect(userData).toHaveProperty('role');
                expect(userData.id).toBeDefined();
                expect(userData.email).toEqual(mockData[5].email);
                expect(['user', 'admin', 'staff']).toContain(userData.role);
            })
        });

        describe("PUT /user/update", () => {
            it("Should return 401 Unauthorized on 'PUT /user/update' with no token", async () => {
                const res = await request(app).put('/user/update');
                expect(res.status).toEqual(401);
            });

            it("Should return 401 Unauthorized on 'PUT /user/update' with invalid token", async () => {
                const res = await request(app).put('/user/update').set('x-token', `invalid-token`);
                expect(res.status).toEqual(401);
            })

            it("Should return 200 OK on 'PUT /user/update' with valid data", async () => {
                const res = await request(app).put('/user/update').set('x-token', token).send({
                    name: "User Updated"
                })
                expect(res.status).toEqual(200);
                expect(["User data updated successfully, Kindly login again to continue.",
                    "User data updated successfully", "No changes made"
                ]).toContain(res.body.message);
            });
        });

        describe("GET /user/purchases", () => {
            let carId: string;
            it("Should make a purchase for a user and return 200 OK", async () => {
                // Create a car to purchase
                const res = await request(app).post('/inventory/cars/create').send(mockCarsData[7]).set('x-token', staffToken);
                expect(res.status).toEqual(201);
                expect(res.body.message).toEqual(`Car '${mockCarsData[7].brand} ${mockCarsData[7].model}' created and added to inventory succesfully`);

                const url = `/cars?brand=${mockCarsData[7].brand.toLowerCase()}` +
                    `&model=${mockCarsData[7].model.toLowerCase()}` +
                    `&bodyType=${mockCarsData[7].bodyType.toLowerCase()}` +
                    `&fuelType=${mockCarsData[7].fuelType}` +
                    `&transmission=${mockCarsData[7].transmission}` +
                    `&price=${mockCarsData[7].price}` +
                    `&mileage=${mockCarsData[7].mileage}` +
                    `&year=${mockCarsData[7].year}`
                const carRes = await request(app).get(url);
                expect(carRes.status).toEqual(200);
                carId = carRes.body[0].id;

                // Make a purchase with user token
                const purchaseRes = await request(app).post(`/inventory/cars/buy/${carId}`).send({ amountPaid: mockCarsData[7].price }).set('x-token', token);
                expect(purchaseRes.status).toEqual(200);
                expect(purchaseRes.body.message).toContain("Purchase successful with purchase id")

            });

            it("Should return 401 Unauthorized on 'GET /user/purchases' with no token", async () => {
                const res = await request(app).get('/user/purchases');
                expect(res.status).toEqual(401);
            });

            it("Should return 401 Unauthorized on 'GET /user/purchases' with invalid token", async () => {
                const res = await request(app).get('/user/purchases').set('x-token', `invalid-token`);
                expect(res.status).toEqual(401);
            });

            it("Should return 200 OK and user purchases on 'GET /user/purchases' with valid token", async () => {
                const res = await request(app).get('/user/purchases').set('x-token', token);
                expect(res.status).toEqual(200);
                expect(res.body.totalPurchases).toBeGreaterThanOrEqual(1);
                expect(res.body.purchases).toBeDefined();
                expect(res.body.purchases).toBeInstanceOf(Array);
                expect(res.body.purchases).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            carId,
                        })
                    ])
                );
            });
        });

        describe("DELETE /user/delete", () => {
            it("Should return 401 Unauthorized on 'DELETE /user/delete' with no token", async () => {
                const res = await request(app).delete('/user/delete');
                expect(res.status).toEqual(401);
            });

            it("Should return 401 Unauthorized on 'DELETE /user/delete' with invalid token", async () => {
                const res = await request(app).delete('/user/delete').set('x-token', `invalid-token`);
                expect(res.status).toEqual(401);
            });

            it("Should return 200 OK on 'DELETE /user/delete' with valid token", async () => {
                const res = await request(app).delete('/user/delete').set('x-token', token);
                expect(res.status).toEqual(200);
            });
        });
    });
});