import {RequestHandler} from "express";

const connectRedisSession = require("connect-redis");
import session from "express-session";
import {Config} from "../passportjs-auth-app";
import {RedisSessionStorePrefix} from '../persistence/redis-key-prefix';


export default function buildExpressSessionMiddleware(config: Config): RequestHandler {
  let store = config.sessionStore;
  if (!store) {
    const RedisStore = connectRedisSession(session);
    store = new RedisStore(Object.assign({
        prefix: `${RedisSessionStorePrefix}`,
      },
      config.redisClient ? {client: config.redisClient} : config.RedisConfig));
  }

  return session(Object.assign({}, config.SessionConfig, {
    secret: config.sessionSecret,
    store,
  }));
}