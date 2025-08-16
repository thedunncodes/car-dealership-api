import request from "supertest";
// import { ObjectId } from 'mongodb';
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

    let adminToken: string = 'no-token';
    let userToken: string = 'no-token';


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
});