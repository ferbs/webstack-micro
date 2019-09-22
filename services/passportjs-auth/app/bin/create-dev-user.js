#!/usr/bin/env node
const { promisify } = require("util");
const { createConfirmedLocalAuthUser } = require("../dist/support/local-credential-support.js");
const { saveAuthUser, findAuthUserByEmail, createRedisClient } = require("../dist/persistence/redis-auth-database.js");
const {  RedisConfig } = require("../dist/config.js");
const { RedisUserDataByAuthUserIdPrefix } = require("../dist/persistence/redis-key-prefix");



async function createAccountInRedis({ email, password, displayName }) {
    const redisClient = createRedisClient(RedisConfig);

    email = email.trim();
    password = password.trim();
    displayName = displayName.trim();

    if (!email || !password || !displayName) {
        throw new Error("email, password, and displayName required");
    }
    const authUser = await createConfirmedLocalAuthUser({
        saveAuthUser: (authUser) => saveAuthUser(redisClient, authUser),
        findAuthUserByEmail: (email) => findAuthUserByEmail(redisClient, email),
        email, password, displayName
    });
    const redisKey = `${RedisUserDataByAuthUserIdPrefix}:${authUser.authUserId}`;
    const exists = promisify(redisClient.exists).bind(redisClient);
    const isOk = await exists(redisKey);
    await promisify(redisClient.quit).bind(redisClient)();
    if (isOk) {
        console.log(`Saved local dev-mode account in Redis with key "${redisKey}":\n`, JSON.stringify(authUser, null, 2));
        return authUser;
    } else {
        throw new Error("Failed to save authUser to redis");
    }
}

const args = process.argv.slice(2);
const [ email, password, ...nameParts] = args;
const displayName = nameParts.join(" ");
createAccountInRedis({ email, password, displayName }).catch(err => {
    console.error("Failed to create an account", err);
    process.exit();
});
