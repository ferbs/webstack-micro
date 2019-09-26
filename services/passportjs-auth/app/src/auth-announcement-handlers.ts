import express from "express";
import {ClientOpts, RedisClient} from "redis";
import {PubSubChannel} from './shared-constants.generated/redis-names.json';
import {AuthUser, AuthUserPersistence} from "./passportjs-auth-app";
import {createRedisClient} from "./persistence/redis-auth-database";


export function createRedisPublisher(redisOpts: ClientOpts): RedisClient {
  return createRedisClient(redisOpts as ClientOpts) as RedisClient;
}

export function setupAuthAnnouncements(publisher: RedisClient, opts?: AuthUserPersistence) {

  // runs on
  const onLoginSuccess = (authUser: AuthUser, req: express.Request, res: express.Response): Promise<any> => {
    announceGuestSignIn(publisher, req.session.guestId, authUser.authUserId);
    req.session.guestId = null;
    // NOTE: you might persist user here
    // you could also put it on x-auth-data response header but this only runs for new login sessions, not on each request.
    return Promise.resolve();
  };

  // todo: onAuthSuccess. Runs for each permitted request (non-guest) Call in auth-check.ts
  // todo: onGuestPermitted
  // todo: onApiCallPermitted (JWT token accepted)
  return {onLoginSuccess};
}


export function announceGuestSignIn(redisPublisher: RedisClient, guestId: string, authUserId: string) {
  const payload = {guestId, authUserId};
  if (!guestId || !authUserId) {
    console.error('announceGuestSignIn called with invalid arguments', payload);
  } else {
    publishPayload(redisPublisher, PubSubChannel.AuthEvent, payload);
  }
}

export function publishPayload(redisPublisher: RedisClient, channel: string, payload: any): void {
  redisPublisher.publish(channel, JSON.stringify(payload));
}
