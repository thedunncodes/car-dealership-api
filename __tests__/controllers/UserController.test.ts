import request from "supertest";
import app from "../../src/server";
import dbClient from "../../src/libs/database/db";
import mockData from "../../src/constants/tests/testData";

describe("Auth Controller Tests", () => {
    
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
                console.log(res.body.error);
                return;
            }
            expect(res.status).toEqual(201);
        });
    });
});