

// Socket associations with users and rooms are tracked here.
// Not persisted because it doesn't use much memory and if the server crashes, the clients must reconnect anyway, websockets use sticky sessions.
// Still, might be smart to use a time-rotating cache to avoid memory leaks.
const socketsByAuthUserId = {};
const socketsByRoomId = {};


// There might be multiple instances of this websocket service, but all subscribe to the same redis notification channel,
// and act

/**
 * Callback for tracking active socket associated with user
 * @param ws. newly connected websocket
 * @param wsUserId. string, as determined by extractWsUserIdFromRequest
 */
function socketAddedForUser(ws) {
  _trackSocket(ws, socketsByAuthUserId, ws.wsUserId);
  ws.on('close', () => _stopTrackingUserSocket(ws));
}

function joinRoom(ws, roomId) {
  _trackSocket(ws, socketsByRoomId, roomId);
  ws.on('close', () => leaveRoom(ws, roomId));
}

function leaveRoom(ws, roomId) {
  _stopTrackingSocket(ws, socketsByRoomId, roomId);
}

function getSocketsForUser(wsUserId) {
  return socketsByAuthUserId[wsUserId] || [];
}

function getSocketsForRoom(roomId) {
  return socketsByRoomId[roomId] || [];
}

/**
 * To support the edge case of a user first connecting as a guest then logging in (without full page nav causing a reconnect)
 *
 * @param prevAuthUserId
 * @param wsUserId
 */
function changeAuthUserId(prevAuthUserId, wsUserId) {
  const sockets = socketsByAuthUserId[prevAuthUserId] || [];
  delete socketsByAuthUserId[prevAuthUserId];
  sockets.forEach(ws => {
    _stopTrackingUserSocket(ws);
    ws.wsUserId = wsUserId;
    _trackSocket(ws, socketsByAuthUserId, wsUserId);
  });
  socketsByAuthUserId[wsUserId] = sockets;
}

function getMembershipStats() {
  const userKeys = Object.keys(socketsByAuthUserId);
  const roomKeys = Object.keys(socketsByRoomId);
  return {
    uniqueUsers: userKeys.length,
    uniqueRooms: roomKeys.length,
  };
}

function _trackSocket(ws, collection, id) {
  if (!id || !ws) {
    return;
  }
  const sockets = collection[id] || [];
  if (!sockets.find(existing => existing === ws)) {
    sockets.push(ws);
  }
  collection[id] = sockets;
}

function _stopTrackingUserSocket(ws) {
  _stopTrackingSocket(ws, socketsByAuthUserId, ws.wsUserId);
}

function _stopTrackingSocket(ws, collection, id) {
  const sockets = collection[id];
  if (!Array.isArray(sockets)) {
    return;
  }
  for (let i=0; i < sockets.length; i++) {
    if (sockets[i].tabWindowId === ws.tabWindowId) {
      sockets.splice(i, 1);
    }
  }
  if (!sockets.length) {
    delete collection[id];
  }
}



module.exports = {
  getSocketsForUser,
  getSocketsForRoom,
  joinRoom,
  leaveRoom,
  changeAuthUserId,
  socketAddedForUser,
  getMembershipStats,
};