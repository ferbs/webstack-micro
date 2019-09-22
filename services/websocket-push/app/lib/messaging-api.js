const { joinRoom, leaveRoom } = require('./membership-tracking.js');


function setupInboundWsMessages({ wsServer, permitJoiningRoom }) {
  wsServer.on('connection', function connection(ws) {
    ws.on('message', function incoming(msg) {
      const data = _extractData(msg);
      if (!data) {
        console.warn('Ignoring empty or invalid JSON message', msg);
        return;
      }
      if (typeof data.joinRoom === 'string') {
        const roomId = data.joinRoom;
        permitJoiningRoom(ws.wsUserId, roomId, { requestHeaders: ws.requestHeaders })
          .then(canJoin => {
            if (canJoin) {
              joinRoom(ws, roomId);
            }
          })
          .catch(err => {
            console.error('Unexpected error in permitJoiningRoom callback', err);
          });
      } else if (typeof data.leaveRoom === 'string') {
        const roomId = data.leaveRoom;
        leaveRoom(ws, roomId);
      }
      // maybe todo: option for user to leave room in all tabs/sockets; option to destroy entire roome
    });

    ws.send(JSON.stringify({
      tabWindowId: ws.tabWindowId,
    }));
  });
}

function _extractData(msg) {
  let data;
  if (typeof msg === 'string') {
    try {
      data = JSON.parse(msg);
    } catch (err) {
      data = null;
    }
  } else if (typeof msg === 'object') {
    data = msg;
  }
  return data;
}

module.exports = setupInboundWsMessages;
