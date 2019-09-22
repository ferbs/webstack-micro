const { PubSubChannel } = require('./constants.js');
const { parseJson } = require('./support/json-util.js');
const { changeAuthUserId } = require('./membership-tracking.js');

const AuthEventChannel = PubSubChannel.AuthEvent;



function setupRedisSubscriptionForUserLogin({ redisClient }) {
  redisClient.subscribe(AuthEventChannel);

  redisClient.on('message', function(redisChannel, message) {
    if (redisChannel !== AuthEventChannel) {
      return;
    }
    const data = parseJson(message);
    const { guestId, authUserId } = data || {};
    if (guestId && authUserId) {
      changeAuthUserId(guestId, authUserId);
    } else {
      console.warn(`Ignoring invalid message published to Redis "${AuthEventChannel}" channel. Expecting both "authUserId" and "guestId" attribs.`);
    }
  });
}

module.exports = setupRedisSubscriptionForUserLogin;