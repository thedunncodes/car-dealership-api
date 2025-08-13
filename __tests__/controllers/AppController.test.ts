import request from "supertest";
import app from "../../src/server";
import dbClient from "../../src/libs/database/db";


describe("App Controller Tests", () => {
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
})