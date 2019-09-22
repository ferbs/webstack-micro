const http = require('http');
const WebSocket = require('ws');
const redis = require("redis");
const { setupWsBehavior, RedisConfig, WebsocketPushPort } = require('./setup-ws-behavior.js');


function start({ port, redisConfig }) {
  console.log('WebsocketPush Server starting on port', port);
  const httpServer = http.Server();
  const wsServer = new WebSocket.Server({ noServer: true });
  const redisClient = redis.createClient(redisConfig);
  redisClient.on('error', (err) => {
    console.error('Redis connection error', err);
  });

  setupWsBehavior({ httpServer, wsServer, redisClient });

  httpServer.listen(port, (err) => {
    if (err) {
      console.error('Failed to start websocket-push-server.js', err);
    } else {
      console.log(`websocket-push started on port ${ port }`);
    }
  });
}

if (!WebsocketPushPort) {
  throw new Error('Environment variable missing: WEBSOCKET_PUSH_PORT');
}
start({ port: WebsocketPushPort, redisConfig: RedisConfig });