
const DefaultHeartbeatDuration = 22000;


/**
 * most all of this is taken from docs and examples in ws lib: https://github.com/websockets/ws
 * @param extractWsUserIdFromRequest. `(req: HttpRequest) => string`. Callback that is passed http request of the original upgrade request. It must return a string
 *  that identifies a user. Used when broadcasting to all of a user's window tabs.
 *
 * @param permitUserConnection. `(userId: string) => boolean`. Callback that determines if a user should be permitted to
 *  connect to this service. It is passed the output of extractWsUserIdFromRequest
 *
 * @param socketAddedForUser. `(ws: WebSocket) => void`. Callback for tracking active socket associated with user. Expects presence of ws.wsUserId
 *
 * @param heartbeatDuration. Optional duration in ms for pinging client to see if its connection is still alive
 * @param httpServer
 * @param wsServer
 */
function setupWsServer({ extractWsUserIdFromRequest, permitUserConnection, socketAddedForUser, heartbeatDuration, httpServer, wsServer }) {
  httpServer.on('upgrade', function upgrade(request, notTheSocket, head) { // it seems "socket" in the docs ("notTheSocket" here) and "ws" do not reference the same object and "socket" is something different
    const wsUserId = extractWsUserIdFromRequest(request);
    if (!permitUserConnection(wsUserId, request)) {
      notTheSocket.terminate(); // or use destroy? example in readme and API docs inconsistent
    } else {
      wsServer.handleUpgrade(request, notTheSocket, head, function done(ws) {
        ws.wsUserId = wsUserId;
        ws.requestHeaders = request.headers;
        ws.isAlive = true;
        ws.tabWindowId = insecureToken();
        wsServer.emit('connection', ws, request);  // todo: ensure not triggered twice
        socketAddedForUser(ws);

        ws.on('pong', _heartbeat);
      });
    }
  });

  _startHeartbeat({ wsServer, heartbeatDuration });
}


let interval;
function _startHeartbeat({ wsServer, heartbeatDuration }) {
  interval = setInterval(function ping() {
    wsServer.clients.forEach(function each(ws) {
      if (ws.isAlive === false) {
        ws.emit('close');
        ws.terminate();
      } else {
        ws.isAlive = false;
        ws.ping(noop);
      }

    });
  }, heartbeatDuration || DefaultHeartbeatDuration);
}

function noop() {}

function _heartbeat() {
  this.isAlive = true;
}

function insecureToken() {
  return Math.floor(1e16 * Math.random()).toString(36).toLowerCase();
}

module.exports = setupWsServer;
