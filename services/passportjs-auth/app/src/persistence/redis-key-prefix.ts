
const RedisKeyPrefix = "auth";

export const RedisSessionStorePrefix = `${RedisKeyPrefix}:sess`;

export const RedisUserDataByAuthUserIdPrefix = `${RedisKeyPrefix}:auid`;  // example key: auth:auid:github:ferbs

export const RedisAuthUserIdByEmailPrefix = `${RedisKeyPrefix}:email`;
