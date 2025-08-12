import request from "supertest";
import app from "../../src/server";
import dbClient from "../../src/libs/database/db";
import mockData from "../../src/constants/tests/testData";

describe("User Controller Tests", () => {
    
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

    describe("GET /user", () => {
        let token: string = 'no-token';
        
        it("Should return 200 OK and a token on 'POST /login' with valid data", async () => {
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
});