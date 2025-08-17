import request from "supertest";
import app from "../../src/server";
import dbClient from "../../src/libs/database/db";
import mockData from "../../src/constants/tests/testData";


describe("App Controller Tests", () => {
    beforeAll(async () => {
        await dbClient.initiateConnection();
    });
    
    afterAll(async () => {
        if (dbClient.isAlive()) {
            await dbClient.close();
        }
    })
    
    describe("GET /", () => {
        it("Should return 200 OK on 'GET /'", async () => {
            const res = await request(app).get('/')
            expect(res.status).toEqual(200)
        } )
    });

    describe("GET /stat", () => {
        let res: request.Response;

        beforeAll(async () => {
            res = await request(app).get('/stat');
        });

        it("Should return 200 0K on 'GET /stat'", () => {
            expect(res.status).toEqual(200)
        });

        it("Should have a connected database", () => {
            expect(res.body.dbStatus).toBe("Connected")
        });
    })

    describe("GET /cars", () => {
        let res: request.Response;
        let resPgn: request.Response;
        let resQuery: request.Response;

        beforeAll(async () => {
            res = await request(app).get('/cars');
            resPgn = await request(app).get('/cars?page=1&size=5');
            resQuery = await request(app).get('/cars?brand=benz&model=class&bodyType=hatchback&fuelType=diesel&transmission=automatic&price=800000&mileage=650000&year=2020');
        });

        it("Should return 200 OK on 'GET /cars'", () => {
            expect(res.status).toEqual(200);
        });

        it("Should return 200 OK on 'GET /cars' with query or pagination", () => {
            expect(resPgn.status).toEqual(200);
            expect(resQuery.status).toEqual(200);
            expect(resQuery.body.length).toBeGreaterThan(0);
        });

        it("Should return an array of cars", () => {
            expect(Array.isArray(res.body)).toBe(true);
        });

        it("Should return an array of cars with correct properties and pagination size", () => {
            expect(resPgn.body.length).toEqual(5);
            expect(Array.isArray(resPgn.body)).toBe(true);
  
            expect(resPgn.body[0]).toHaveProperty('id');
            expect(resPgn.body[0]).toHaveProperty('brand');
            expect(resPgn.body[0]).toHaveProperty('model');
            expect(resPgn.body[0]).toHaveProperty('bodyType');
            expect(resPgn.body[0]).toHaveProperty('transmission');
            expect(resPgn.body[0]).toHaveProperty('price');
            expect(resPgn.body[0]).toHaveProperty('horsePower');
            expect(resPgn.body[0]).toHaveProperty('fuelType');
            expect(resPgn.body[0]).toHaveProperty('mileage');
            expect(resPgn.body[0]).toHaveProperty('year');
            expect(resPgn.body[0]).toHaveProperty('imgUrl');
        });
    });

    describe("GET /inventory/cars/sales", () => {
        let normalToken: string = 'no-token';
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
            normalToken = loginRes.body.token;

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

        it("Should return 401 Unauthorized on 'GET /inventory/cars/sales' with no token", async () => {
            const res = await request(app).get('/inventory/cars/sales');
            expect(res.status).toEqual(401);
        });

        it("Should return 401 Unauthorized on 'GET /inventory/cars/sales' with invalid token", async () => {
            const res = await request(app).get('/inventory/cars/sales').set('x-token', `invalid-token`);
            expect(res.status).toEqual(401);
        });

        it("Should return 403 forbidden on 'GET /inventory/cars/sales' with a valid user token", async () => {
            const res = await request(app).get('/inventory/cars/sales').set('x-token', normalToken);
            expect(res.status).toEqual(403);
            expect(res.body.error).toEqual("Forbidden, access denied.");
        });

        it("Should return 200 OK and an array of sales on 'GET /inventory/cars/sales' with valid staff user token", async () => {
            const res = await request(app).get('/inventory/cars/sales').set('x-token', staffToken);
            expect(res.status).toEqual(200);
            expect(res.body.totalSales).toBeDefined();
            expect(res.body.sales).toBeInstanceOf(Array);
        });
    });    
})