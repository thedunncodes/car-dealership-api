import request from "supertest";
import app from "../../src/server";
import dbClient from "../../src/libs/database/db";
import mockData from "../../src/constants/tests/testData";

describe("Auth Controller Tests", () => {
    afterAll(async () => {
        if (dbClient.isAlive()) {
            await dbClient.close();
        }
    });

    describe("POST /login", () => {
        it("Should return 400 Bad Request on 'POST /login' with empty data", async () => {
            const res = await request(app).post('/login').send(mockData[0]);
            expect(res.status).toEqual(400);
        });

        it("Should return 400 Bad Request on 'POST /login' with invalid password", async () => {
            const res = await request(app).post('/login').send(mockData[1]);
            expect(res.status).toEqual(400);
        });

        it("Should return 400 Bad Request on 'POST /login' with invalid email", async () => {
            const res = await request(app).post('/login').send(mockData[2]);
            expect(res.status).toEqual(400);
        });

        it("Should return 400 Bad Request on 'POST /login' with short password", async () => {
            const res = await request(app).post('/login').send(mockData[3]);
            expect(res.status).toEqual(400);
        });

        it("Should return 401 Unauthorized Request on 'POST /login' with unregistered data", async () => {
            const res = await request(app).post('/login').send(mockData[4]);
            expect(res.status).toEqual(401);
        });

        it("Should return 201 Created on 'POST /register' with valid data", async () => {
            const res = await request(app).post('/register').send(mockData[5]);
            if (res.body.error) {
                expect(res.body.error).toEqual(`User with email '${mockData[5].email}' already exists`);
                console.log(res.body.error);
                return;
            }
            expect(res.status).toEqual(201);
        });

        it("Should return 200 OK and a token on 'POST /login' with valid data", async () => {
            const res = await request(app).post('/login').send(mockData[5]);
            expect(res.status).toEqual(200);
            expect(res.body.token).toBeDefined();
        });
    })
})