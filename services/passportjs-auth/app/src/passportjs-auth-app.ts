import express from "express";
import {MemoryStore, Store} from "express-session";
import setupFormsAndBasics from "./middleware/forms-basic-middleware";
import setupPassport from "./middleware/passport-user";
import buildExpressSessionMiddleware from "./middleware/session-state";
import setupCurrentUserController from "./middleware/current-user-controller";
import setupLocalPasswordController from "./middleware/local-password-controller";
import setupOpenidAuthRouter from "./middleware/openid-controller";
import setupAuthCheckForTraefik from "./middleware/auth-check";
import {setupRedisAsUserDatabase} from "./persistence/redis-auth-database";
import {
  CurrentUserApiMountPoint,
  InternalAuthVerificationEndPoint,
  LocalPasswordApiMountPoint,
  OpenIdApiMountPoint
} from "./api-endpoints";
import {createRedisPublisher, setupAuthAnnouncements} from "./auth-announcement-handlers";


function initExpressApp(config: Config) {
  const {serverBaseUrl, sessionSecret} = config;
  if (!serverBaseUrl) {
    throw new Error("serverBaseUrl required for passportjs-auth service. ");
  }
  if (!sessionSecret) {
    throw new Error("sessionSecret required. Ensure AUTH_SESSION_SECRET env variable was set");
  }
  const redisAsUserDatabase = setupRedisAsUserDatabase(config.RedisConfig);
  const redisPublisher = createRedisPublisher(config.RedisConfig); // note: if you decide to give this passportjs-auth service its own private db, this redis client should not use it. It is used for pubsub (not for session cookie persistence and such)
  const {onLoginSuccess} = setupAuthAnnouncements(redisPublisher, { ...redisAsUserDatabase }); // todo: { onAuthSuccess, onGuestPermitted, onApiCallPermitted, onLoginSuccess }

  const app = express();

  setupFormsAndBasics(app, config);

  app.use(buildExpressSessionMiddleware(config));

  setupPassport(app, {fetchAuthUser: redisAsUserDatabase.fetchAuthUser}); // note: setupPassport needs to be called after the session middleware is set up, done in buildExpressSessionMiddleware

  app.get(InternalAuthVerificationEndPoint, setupAuthCheckForTraefik(config));


  app.use(OpenIdApiMountPoint, setupOpenidAuthRouter({
    serverBaseUrl,
    providers: config.OpenIdProvider,
    onLoginSuccess,
    ...redisAsUserDatabase
  }));

  if (config.EnableLocalPasswordLoginSystem) {
    app.use(LocalPasswordApiMountPoint, setupLocalPasswordController({
      serverBaseUrl,
      onLoginSuccess, ...redisAsUserDatabase
    }));
  }

  app.use(CurrentUserApiMountPoint, setupCurrentUserController({serverBaseUrl})); // Routes on '/auth/user/*'

  return app;
}


export interface Config {

  /**
   * The origin / base domain of your site. (protocol and host) Eg, https://mysite.com
   * Required. Server.ts sets this using env variable WEBSTACK_HOST (and optionally WEBSTACK_PROTOCOL)
   */
  serverBaseUrl: string;

  /**
   * Crypto secret passed to express-session, for in-browser user session.
   * Required. Server sets this using env variable AUTH_SESSION_SECRET
   */
  sessionSecret: string;

  /**
   * List of X-Auth-* headers passed to Traefik
   */
  internalAuthHeaders: string[];


  /**
   * Default is Redis connection if present. Pass in an express-session store. For tests, pass in a MemoryStore.
   */
  sessionStore?: Store | MemoryStore;

  /**
   * Others in config.ts
   */
  [key: string]: any;
}


export type AuthUserId = string;
export type Email = string;

export interface AuthUser {
  authUserId: AuthUserId;
  confirmed: boolean;
  email?: Email;
  displayName?: string;
  accessToken?: string;
  localAuth?: LocalAuthData;
  updatedAt?: number; // Date.now() epoch ms
  // [key: string]: any;
}

// used only for local password authentication:
export interface LocalAuthData {
  pwdHash: string;
  confToken?: string;
  confExp?: Date;
  resetToken?: string;
  resetExp?: Date;
}


export interface AuthUserPersistence {
  fetchAuthUser: (authUserId: AuthUserId) => Promise<AuthUser | void>;
  saveAuthUser: (authUser: AuthUser) => Promise<any>;
  fetchAuthUserByEmail: (email: Email) => Promise<AuthUser | void>;
}

export type PathPrefixOrRegex = string | RegExp;

export interface OpenIdProvider {
  clientId: string;
  clientSecret: string;
}

export type LoginCallback = (authUser: AuthUser, req: express.Request, res: express.Response) => Promise<any>;

export default initExpressApp;
