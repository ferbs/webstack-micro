import express from "express";
import {AuthUser, AuthUserId, Email} from "src/passportjs-auth-app";


export interface AppWithGuestUserProps {
    sessionData?: any;
}
export function appWithGuestUser(opts=<AppWithGuestUserProps>{}): express.Application {
    const app = express();
    const sessionData = Object.assign({ guestId: true }, opts.sessionData);
    applyMockSessionDataMiddleware(app, sessionData);
    return app;
}


export interface AppWithLoggedInUserProps extends Partial<AuthUser> {
    sessionData?: any;
}
export function appWithLoggedInUser(opts=<Partial<AppWithLoggedInUserProps>>{}): express.Application {
    const { sessionData, ...authUser } = opts;
    const app = express();
    applyMockSessionDataMiddleware(app, sessionData);
    applyAuthUserMiddleware(app, authUser);
    return app;
}


function applyAuthUserMiddleware(app: express.Application, authUser: Partial<AuthUser> | boolean | void) {
    const DefaultAuthInfo = {
        authUserId: 'test:hello123',
        confirmed: true,
        email: 'someone@cur.test',
        displayName: 'Test Account',
        accessToken: 'secret123',
    };
    app.use((req: express.Request, res: express.Response, next: Function) => {
        req.user = authUser === false ? null : Object.assign({}, DefaultAuthInfo, authUser);
        next();
    });
}

function applyMockSessionDataMiddleware(app: express.Application, sessionData?: object) {
    app.use((req: express.Request, res: express.Response, next: Function) => {
        const session = Object.assign({}, sessionData) as any;
        session.guestId = session.guestId === true ? 'guest:test123' : session.guestId;
        req.session = session;
        next();
    });
}
