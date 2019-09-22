import {promisify} from "util";
import redis, {ClientOpts, RedisClient} from "redis";
import {AuthUserPersistence, AuthUser, AuthUserId, Email} from "../passportjs-auth-app";
import {RedisUserDataByAuthUserIdPrefix, RedisAuthUserIdByEmailPrefix} from "./redis-key-prefix";


interface RedisAuthUserPersistence extends AuthUserPersistence {
  redisClient: RedisClient;
}

export function setupRedisAsUserDatabase(redisOpts: ClientOpts): RedisAuthUserPersistence {
  if (!redisOpts || !redisOpts.host) {
    throw new Error('Expecting redis config opts');
  }
  const redisClient = createRedisClient(<ClientOpts>redisOpts) as RedisClient;
  return {
    redisClient,
    fetchAuthUser: fetchAuthUser.bind(null, redisClient),
    saveAuthUser: saveAuthUser.bind(null, redisClient),
    fetchAuthUserByEmail: findAuthUserByEmail.bind(null, redisClient),
  };
}


export function createRedisClient(redisOpts: ClientOpts): RedisClient {
  const redisClient = redis.createClient(redisOpts);
  redisClient.on("error", (err: any) => {
    console.error("Redis connection error", err);
  });
  return redisClient;
}

export async function fetchAuthUser(redisClient: RedisClient, authUserId: AuthUserId): Promise<AuthUser> {
  const redisKey = _authUserRedisKey(authUserId);
  if (!redisKey) {
    return null;
  }
  const get = _promisedCommand(redisClient, "get");
  try {
    const authUserJson = await get(redisKey);
    return JSON.parse(authUserJson);
  } catch (err) {
    console.error(`Redis error while fetching authUser "${authUserId}"`, err);
  }
}


export async function saveAuthUser(redisClient: RedisClient, authUser: AuthUser): Promise<any> {
  if (!authUser || !authUser.authUserId) {
    return Promise.reject({errorCode: "Invalid authUser object", method: "updateAuthUser"});
  }
  const set = _promisedCommand(redisClient, "set");
  if (authUser.email) { // need to keep authUserId by email address indexed. Meh, another downside to using Redis for the user db
    await set(_authUserIdByEmailRedisKey(authUser.email), authUser.authUserId);
  }
  authUser.updatedAt = Date.now();
  return set(_authUserRedisKey(authUser), JSON.stringify(authUser));
}

export async function findAuthUserByEmail(redisClient: RedisClient, email: Email): Promise<AuthUser | void> {
  if (!email) {
    return Promise.resolve(null);
  }
  const get = _promisedCommand(redisClient, "get");
  const authUserId = await get(_authUserIdByEmailRedisKey(email));
  if (authUserId) {
    return fetchAuthUser(redisClient, authUserId);
  }
}


function _authUserRedisKey(authUser: AuthUser | AuthUserId): string {
  const id = typeof authUser === "string" ? authUser : authUser.authUserId;
  return id && `${RedisUserDataByAuthUserIdPrefix}:${id}`;
}

function _authUserIdByEmailRedisKey(email: Email): string {
  if (!email) {
    throw new Error("email required");
  }
  return `${RedisAuthUserIdByEmailPrefix}:${email}`;
}

function _promisedCommand(redisClient: RedisClient, method: string) {
  // @ts-ignore
  const fn = redisClient[method];
  if (!fn) {
    throw new Error(`Redis client does not have method: "${method}"`);
  }
  return promisify(fn).bind(redisClient);
}