const { getSocketsForUser, getSocketsForRoom } = require('./membership-tracking.js');
const { PubSubChannel } = require('./constants.js');
const { parseJson } = require('./support/json-util.js');

const BackgroundPushChannel = PubSubChannel.BackgroundPush;

if (!BackgroundPushChannel) {
  throw new Error('SEVERE: could not load shared constants');
}


const WebSocketState = {  // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
};


// note: if for some reason you want to use a different message-passing mechanism here instead of Redis pubsub, keep in mind that
// the same user or room member might connect to different websocket servers (should you scale it beyond 1.)
function setupRedisSubscriptionForBroadcast({ redisClient }) {
  redisClient.subscribe(BackgroundPushChannel);
// TODO: document message format used. Use typescript in shared-libs? (Or .proto?)
  redisClient.on('message', function(redisChannel, message) {
    if (redisChannel !== BackgroundPushChannel) {
      return;
    }
    const data = parseJson(message);
    if (data && data.payload) {
      _processReceivedMessage(data);
    } else {
      console.warn(`Ignoring invalid message published to Redis "${BackgroundPushChannel}" channel. Expecting a "payload" data object on the message.`);
    }
  });
}



function _processReceivedMessage(data) {
  const { pushToUser, pushToRoom, tabWindowId, payload } = data;
  if (pushToUser) {
    broadcastToUser(pushToUser, tabWindowId, payload);
  } else if (pushToRoom) {
    broadcastToRoom(pushToRoom, tabWindowId, payload);
  } else {
    console.warn(`Invalid message published to Redis "${BackgroundPushChannel}" channel. Expecting json containing a "payload" and either a "pushToTabWindow" or "pushToUser" or "pushToRoom" key.`);
  }
}

function broadcastToUser(wsUserId, tabWindowId, payload) {
  if (!wsUserId) {
    console.warn('broadcastToUser expecting auth user id');
    return;
  }
  const sockets = _filterTabWindowIdWhenPresent(getSocketsForUser(wsUserId), tabWindowId);
  if (tabWindowId) {
    console.log(`broadcastToUser sending to tabWindowId "${ tabWindowId}"`);
  } else {
    console.log(`broadcastToUser sending to ${ sockets.length } socket(s)`);
  }
  _broadcast(sockets, payload);
}

function broadcastToRoom(roomId, tabWindowId, payload) {
  if (!roomId) {
    console.warn('broadcastToRoom expecting roomId');
    return;
  }
  const sockets = _filterTabWindowIdWhenPresent(getSocketsForRoom(roomId), tabWindowId);
  console.log(`broadcastToRoom sending to ${ sockets.length } socket(s) in room "${roomId}"`);
  _broadcast(sockets, payload);
}

function _broadcast(sockets, payload) {
  if (!sockets || !sockets.length) {
    return;
  }
  const msg = JSON.stringify(payload);
  sockets.forEach((ws) => {
    if (ws && ws.isAlive && ws.readyState === WebSocketState.OPEN) {
      ws.send(msg);
    }
  });
}

function _filterTabWindowIdWhenPresent(sockets, tabWindowId) {
  sockets = sockets || [];
  return tabWindowId ? sockets.filter(ws => ws.tabWindowId === tabWindowId) : sockets;
}

module.exports = {
  setupRedisSubscriptionForBroadcast,
};