import request from "supertest";
import express from "express";
import setupAuthCheckForTraefik from "src/middleware/auth-check";
import {appWithLoggedInUser, appWithGuestUser} from "../test-support/mock-app";


const serverBaseUrl = 'http://webstack.test';
// req.headers["x-forwarded-uri"]
const GuestPermittedResource = [
    '/guest',
    /.moo$/,
];

const VerificationPath = '/_auth/verify';

describe("GET /_auth/verify", () => {

    const mountForFakeRequest = (app: express.Application, path: string) => {
        _setupFakeTraefikHeaders(app, path);
        app.get(VerificationPath, setupAuthCheckForTraefik({ serverBaseUrl, GuestPermittedResource }));
        return app;
    };

    // note: this request is from Traefik, it's not the user's request. The response instructs Traefik how to handle the actual user request
    it("should set correct response headers for Traefik", async () => {
        const app = appWithLoggedInUser({ authUserId: 'github:ferbs' } as any);
        mountForFakeRequest(app, '/restricted/area');
        const res = await request(app).get(VerificationPath);
        expect(res.status).toEqual(200);
        const headers = res.header;

        expect(headers['x-auth-user']).toBe('github:ferbs');
        expect(!!headers['x-auth-email']).toBe(true);
        expect(!!headers['x-auth-data']).toBe(true);
        expect(!!headers['x-auth-csrf']).toBe(true);
        expect(!!headers['x-auth-sessionkey']).toBe(true);
    });

    it("should tell Traefik to block guests from restricted areas", async () => {
        const app = appWithGuestUser();
        mountForFakeRequest(app, '/restricted/area');
        const res = await request(app).get(VerificationPath);
        expect(res.status === 403 || res.status === 302).toBe(true);
        const headers = res.header;
        expect(!!headers['x-auth-user']).toBe(false);
    });

    it("should permit whitelisted guest requests but set headers correctly", async () => {
        const app = appWithGuestUser();
        mountForFakeRequest(app, '/guest/area');
        const res = await request(app).get(VerificationPath);
        expect(res.status).toEqual(200);
        const headers = res.header;
        expect(!!headers['x-auth-user']).toBe(false);
        expect(!!headers['x-auth-csrf']).toBe(true);
        expect(!!headers['x-auth-sessionkey']).toBe(true);
    });

    // todo: should accept regex for whitelist

    it("should not clobber existing session data", async () => {
        const app = appWithLoggedInUser({
            sessionData: {
                csrfToken: 'token123'
            }
        });
        mountForFakeRequest(app, '/restricted/area');
        const res = await request(app).get(VerificationPath);
        expect(res.header['x-auth-csrf']).toBe('token123');
    });
});


function _setupFakeTraefikHeaders(app: express.Application, path: string) {
    app.use((req: express.Request, res: express.Response, next: Function) => {
        req.headers["x-forwarded-uri"] = path;
        next();
    });
}
