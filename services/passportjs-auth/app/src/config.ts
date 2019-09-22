import {PathPrefixOrRegex} from "./passportjs-auth-app";


/**
 * All environment variables used by passportjs-auth are either in this file or in server.ts
 *
 * It also contains most constants that might change from app to app.
 */

export const AuthSessionSecret = process.env.AUTH_SESSION_SECRET;
export const UseDebugErrorHandler = !!process.env.DEBUG_ERROR_HANDLER;


/**
 * Oauth / OpenId Settings
 *
 * To disable, just remove the client secret or make sure it is not set. If you completely delete the entire const declaration,
 *   you'll also need to remove its reference in openid-controller.ts
 */
export const OpenIdProvider = {
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
};


/**
 * Guest Resources
 *
 * Any request that traefik-gateway sees as a protected resource will be sent to this passportjs-auth service. We'll block
 * the request for non-authenticated users, but can also mark some as ok for guest access.
 * If so, the request is permitted to continue, but the x-auth-* headers are updated for use by the target service.
 *
 * If an item in the list is a string, it is used to check path PREFIX. The requested path must start with that string for
 *   it to receive guest permission.
 * If an item is a regular expression, any partial match will be permitted. (Tip: start the regular expression
 *   with "^" to indicate it should match the beginning of the path or end with "$" to indicate it must end with the
 *   match. Also, do not use the "/g" global switch (it will cause the test to return false after the first match.)
 *
 * Note: traefik-gateway is configured to completely skip authentication for some paths (eg, /static and /assets)
 *
 * See `auth-check.ts` for source.
 *
 */
export const GuestPermittedResource = [
  /^\/$/,
  '/app',
  '/guest',
  '/welcome',
  '/server_notifications', // this allows guest websocket connections. Remove if you want to block non-authenticated users from connecting
] as PathPrefixOrRegex[];


/**
 * When in dev mode, grant guest access to these additional resources.
 * Initially added to support the frontend-web's create-react-app in watch/server mode--it uses them for hot-reload.
 */
const frontendDevSwitch = process.env.FRONTEND_DEV_RESOURCES;
export const IsFrontEndDevMode = frontendDevSwitch === 'guest' || frontendDevSwitch === '1' ||
  (typeof frontendDevSwitch === 'undefined' && process.env.NODE_ENV === 'development');
export const DevMode_GuestPermittedResource = <PathPrefixOrRegex[]>[
  '/sockjs-node',
  /hot-update\.(js|js\.map|json)$/,
  '/__webpack',

  // the following are not used in the frontend-web example but are by Next or Gatsby:
  '/page-data',
  '/common',
  '/socket.io/',
  '/_next', "/.next", // not sure about these
  // other common ones?
];


/**
 * Config used for express-session middleware managing browser session state.
 * See its docs at https://github.com/expressjs/session
 * See use/src in app/src/middleware/session-state.ts
 */
export const SessionConfig = {
  name: "sess.center",
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 15, // 15 days
    sameSite: "lax",  // https://www.owasp.org/index.php/SameSite
    httpOnly: true, // make this cookie invisible to browser javascript

    // note: explicitly setting "domain" to the base domain tells browser to include the cookie on subdomains. https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
    // not including it (and restricting to same origin) is more secure.
    domain: process.env.WEBSTACK_HOST,
  },
  saveUninitialized: true,
  resave: false,
};


/**
 * When JwtConfig.secret is present, it will verify & decode JsonWebTokens.
 * The decoded data is applied to "x-auth-jwt"
 * Note: if a token is present on a request, the other x-auth-* are not applied.
 */

export const JwtConfig = {
  secret: process.env.AUTH_JWT_SECRET, // secretOrPublicKey. Or an async function.
  options: { // see https://www.npmjs.com/package/jsonwebtoken
  },
};


export const RedisConfig = {
  host: 'redis-main'
};


// At present, OpenId Connect is used in production, with password-based login enabled in dev mode for working offline and
// without third-party API keys. (See README)
export const EnableLocalPasswordLoginSystem = process.env.NODE_ENV === "development";


// using library default; higher is better/slower. Consider installing argon2 to better defend against offline attacks (should an attacker get a copy of your database and all of the hashed passwords)
export const BcryptHashSalt = 10;


