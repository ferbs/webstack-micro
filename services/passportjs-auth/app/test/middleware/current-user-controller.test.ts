import request from "supertest";
import express from "express";
import setupCurrentUserController from "src/middleware/current-user-controller";
import {appWithLoggedInUser, appWithGuestUser} from "../test-support/mock-app";
import {AuthUser} from "src/passportjs-auth-app";




describe("GET /current", () => {
    const mountController = (app: express.Application) => {
        app.use('/test', setupCurrentUserController({ serverBaseUrl: 'http://site.test' }));
        return app;
    };

    it("should return whitelisted user attribs", async () => {
        const authUser = {
            authUserId: 'test:id001',
            email: 'some@test.loc',
            displayName: 'Tess',
            accessToken: 'secret',
        } as AuthUser;
        const app = mountController(appWithLoggedInUser(authUser));
        const res = await request(app).get("/test/current");
        expect(res.status).toEqual(200);
        expect(res.type).toMatch('/json');
        const { authUserId, email, displayName, accessToken } = res.body;
        expect(!!accessToken).toBe(false);
        expect(authUserId).toBe('test:id001');
        expect(email).toBe(authUser.email);
        expect(displayName).toBe(authUser.displayName);
    });

    it("should support guest accounts", async () => {
        const app = mountController(appWithGuestUser());
        const res = await request(app).get("/test/current");
        expect(res.status).toEqual(200);
        const { isGuest, authUserId, guestId } = res.body;
        expect(isGuest).toBe(true);
        expect(!!authUserId).toBe(false);
        expect(typeof guestId).toBe('string');
    });
});
