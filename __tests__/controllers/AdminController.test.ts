import request from "supertest";
import { ObjectId } from 'mongodb';
import app from "../../src/server";
import dbClient from "../../src/libs/database/db";
import mockData from "../../src/constants/tests/testData";

describe("Admin Controller Tests", () => {    
    afterAll(async () => {
        if (dbClient.isAlive()) {
            await dbClient.close();
        }
    });

    describe("POST /admin/register/:adminSlug", () => {
        it("Should return 401 Unauthorized on 'POST /admin/register/:adminSlug' with invalid admin slug", async () => {
            const res = await request(app).post('/admin/register/:adminSlug').send(mockData[6]);
            expect(res.status).toEqual(401);
            expect(res.body.error).toEqual("Unauthorized");
        });

        it("Should return 400 Bad Request on 'POST /admin/register/:adminSlug' with empty data", async () => {
            const res = await request(app).post(`/admin/register/${process.env.ADMIN_SLUG}`).send(mockData[0]);
            expect(res.status).toEqual(400);
        });

        it("Should return 400 Bad Request on 'POST /admin/register/:adminSlug' with invalid password", async () => {
            const res = await request(app).post(`/admin/register/${process.env.ADMIN_SLUG}`).send(mockData[1]);
            expect(res.status).toEqual(400);
        });

        it("Should return 400 Bad Request on 'POST /admin/register/:adminSlug' with invalid email", async () => {
            const res = await request(app).post(`/admin/register/${process.env.ADMIN_SLUG}`).send(mockData[2]);
            expect(res.status).toEqual(400);
        });

        it("Should return 400 Bad Request on 'POST /admin/register/:adminSlug' with short password", async () => {
            const res = await request(app).post(`/admin/register/${process.env.ADMIN_SLUG}`).send(mockData[3]);
            expect(res.status).toEqual(400);
        });

        it("Should return 201 Created on 'POST /admin/register/:adminSlug' with valid data of an admin user", async () => {
            const res = await request(app).post(`/admin/register/${process.env.ADMIN_SLUG}`).send(mockData[6]);
            if (res.body.error) {
                if (res.status === 400) {
                    expect(res.body.error).toEqual(`User with email '${mockData[6].email}' already exists`);
                    return;
                }
                if (res.status === 401) {
                    expect(res.body.error).toEqual("Unauthorized, Admin User already exists");
                    return;
                }
            }
            expect(res.status).toEqual(201);
            expect(res.body.message).toEqual(`Admin with email '${mockData[6].email}' created succesfully`);
        });

        it("Should return 201 Created on 'POST /admin/register/:adminSlug' with valid data of a staff user", async () => {
            const res = await request(app).post(`/admin/register/${process.env.ADMIN_SLUG}`).send(mockData[7]);
            if (res.body.error) {
                expect(res.body.error).toEqual(`User with email '${mockData[7].email}' already exists`);
                return;
            }
            expect(res.status).toEqual(201);
            expect(res.body.message).toEqual(`Staff with email '${mockData[7].email}' created succesfully`);
        });
    });

    describe("Tests on protected routes", () => {
        let adminToken: string = 'no-token';
        let userToken: string = 'no-token';
        
        it("Should return 200 OK and a token on 'POST /login' with valid data", async () => {
            const adminRes = await request(app).post('/register').send(mockData[6]);
            const userRes = await request(app).post('/register').send(mockData[5]);
            if (adminRes.body.error) {
                expect(adminRes.body.error).toEqual(`User with email '${mockData[6].email}' already exists`);
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

        describe("GET /admin/staff ", () => {
            it("Should return 401 Unauthorized on 'GET /admin/staff' with no token", async () => {
                const res = await request(app).get('/admin/staff');
                expect(res.status).toEqual(401);
            });

            it("Should return 401 Unauthorized on 'GET /admin/staff' with invalid token", async () => {
                const res = await request(app).get('/admin/staff').set('x-token', `invalid-token`);
                expect(res.status).toEqual(401);
            })

            it("Should return 403 forbidden on 'GET /admin/staff' with a valid user token", async () => {
                const res = await request(app).get('/admin/staff').set('x-token', userToken);
                expect(res.status).toEqual(403);
                expect(res.body.error).toEqual("Forbidden, access denied.");
            })
            
            it("Should return all staff information on 'GET /admin/staff' with valid admin user token", async () => {
                const res = await request(app).get('/admin/staff').set('x-token', adminToken);
                const staffInfo = res.body;
                expect(res.status).toEqual(200);
                expect(staffInfo).toHaveProperty('totalStaff');
                expect(staffInfo).toHaveProperty('admin');
                expect(staffInfo).toHaveProperty('staff');
                expect(staffInfo.totalStaff).toBeDefined();
                expect(staffInfo.admin).toBeInstanceOf(Array);
                expect(staffInfo.staff).toBeInstanceOf(Array);
                expect(staffInfo.totalStaff).toBeGreaterThanOrEqual(1);
                expect(staffInfo.admin.length).toEqual(1);
            })
        });

        describe("DELETE /admin/delete/:staffId", () => {
            let staffId: string = '';

            it("Should create a staff user, return 201 created and get the staff ID for deletion test", async () => {
                const res = await request(app).post(`/admin/register/${process.env.ADMIN_SLUG}`).send(mockData[7]);
                if (res.body.error) {
                    expect(res.body.error).toEqual(`User with email '${mockData[7].email}' already exists`);
                } else {
                    expect(res.status).toEqual(201);
                    expect(res.body.message).toEqual(`Staff with email '${mockData[7].email}' created succesfully`);
                }

                const loginRes = await request(app).post('/login').send(mockData[7]);
                expect(loginRes.status).toEqual(200);
                expect(loginRes.body.token).toBeDefined();

                const staffRes = await request(app).get('/user').set('x-token', loginRes.body.token);
                const staffData = staffRes.body.myInfo;
                expect(staffData.id).toBeDefined();
                expect(staffData.email).toEqual(mockData[7].email);
                expect(staffData.role).toEqual('staff');
                staffId = staffData.id;
            });

            it("Should return 401 Unauthorized on 'DELETE /admin/delete/:staffId' with no token", async () => {
                const res = await request(app).delete(`/admin/delete/${staffId}`);
                expect(res.status).toEqual(401);
            });

            it("Should return 401 Unauthorized on 'DELETE /admin/delete/:staffId' with invalid token", async () => {
                const res = await request(app).delete(`/admin/delete/${staffId}`).set('x-token', `invalid-token`);
                expect(res.status).toEqual(401);
            })

            it("Should return 404 Not Found on 'DELETE /admin/delete/:staffId' with incorrect staff ID", async () => {
                const res = await request(app).delete(`/admin/delete/${new ObjectId()}`).set('x-token', adminToken);
                expect(res.status).toEqual(404);
                expect(res.body.error).toEqual("Staff not found");
            });

            it("Should return 400 Bad Request on 'DELETE /admin/delete/:staffId' with invalid staff ID", async () => {
                const res = await request(app).delete(`/admin/delete/60d5-invalid-id`).set('x-token', adminToken);
                expect(res.status).toEqual(400);
                expect(res.body.error).toEqual("Invalid Staff Id");
            });

            it("Should return 403 forbidden on 'DELETE /admin/delete/:staffId' with a valid user token", async () => {
                const res = await request(app).delete(`/admin/delete/${staffId}`).set('x-token', userToken);
                expect(res.status).toEqual(403);
                expect(res.body.error).toEqual("Forbidden, access denied.");
            })

            it("Should return 200 OK on 'DELETE /admin/delete/:staffId' with valid admin user token and staffId", async () => {
                const res = await request(app).delete(`/admin/delete/${staffId}`).set('x-token', adminToken);
                expect(res.status).toEqual(200);
            });
        });
    });
});