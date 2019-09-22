# websocket-push

This service uses WebSockets to push/broadcast messages to clients. Another backend service, like a background worker, publishes
 a message over Redis pubsub, with a payload and a destination: a single browser tab window, all of a user's connected tab windows, 
 or to tab windows that have subscribed to a room.

Its focus is on unidirectional messages from the server to the browser. You can certainly modify it to listen for and handle 
 incoming WebSocket messages as well, but the original intent is to keep domain-specific code out of this *websocket-push* service. 
              

### Status

As with the other services in *webstack-micro*, it is experimental and has not yet been used in production. However, it seems 
 like a good candidate to polish up. After a round of feedback, I'll perhaps switch it to TypeScript, add tests, and push 
 its Docker image, letting projects use and update it as a dependency.   


## Usage 

### Connect the browser

The *frontend-web* includes a connection example, setting up auto-reconnect using a [Fibonacci-based backoff time](https://github.com/MathieuTurcotte/node-backoff).  
See: `services/frontend-web/app/src/realtime/internal/websocket-connection.js`

You can connect with any standard WebSocket client. The default/example routes requests for `/server_notifications/connect` to this 
 *websocket-push* service. 
 
In development mode, a basic connection in the browser looks like: `new WebSocket('ws:webstack.loc/server_notifications/connect')` 
  
      
                                   
### Sending messages to the browser

*Websocket-push* listens for messages on the Redis pubsub channel "BackgroundPush", as defined in `shared-constants/redis-names.json`. 

To push a message to the browser, you use the redis [PUBLISH](https://redis.io/commands/publish) command.

The message is a JSON string, containing a **payload** and a destination, either **pushToUser** or **pushToRoom**. 
When sending to a user, you can provide an additional *tabWindowId* filter. 

By default, the *pushToUser* value should correspond with the auth user id used in *passportjs-auth*. (Eg, "twitter:jaredhanson") 
The config section below explains how to use a different value (eg, another x-auth-* header, like email.)    

In the `services/backend-api/app/lib/workers/ai_sort_worker.rb` example, a ruby background worker sends a message to all 
 of the user's connected tab windows with something like this:  

```ruby
redis.publish("BackgroundPush", {
      pushToUser: "github:ferbs",
      payload: { some: 'info' }
    }.to_json)
```

The equivalent in JavaScript looks similar:

```javascript
redis.publish("BackgroundPush", JSON.stringify({
  pushToUser: "github:ferbs",
  payload: { some: 'info' }
}));
```

### Receiving messages in the browser

WebSocket messages are received as normal (eg, `ws.on('message', doStuff)`). The example builds on this, using React hooks 
 such that the server sends messages in a format familiar to those using front-end reducer actions. It dispatches these received
 messages, merging the new data into its React client state, causing affected views to rerender. If you like this approach, 
 take a look at the uses of `useServerDispatch` in the background-push and slidecast demos.  


#### tabWindowId filter

When a WebSocket is first connected, *websocket-push* immediately sends a message containing a random tabWindowId token. If 
 desired, you can include this token in API requests to the backend, and add the token as a "tabWindowId" field next to "pushToUser" 
 and the "payload". When present, *websocket-push* will only send the message to the socket associated with that tabWindowId.    

The React example exposes the value (among others) through the useServerDispatch hook in `server-dispatch-hook.jsx`, eg:

    const { tabWindowId } = useServerDispatch(); 
 
  
### Rooms

*Websocket-push* ignores all incoming WebSocket messages except for the commands to join or leave a room.     
 
```javascript 
// join room:
ws.send(JSON.stringify({ joinRoom: 'slidecast/abc123' }))

// leave room:
ws.send(JSON.stringify({ leaveRoom: 'slidecast/abc123' }))
```

The React example uses a hook to simplify joinRoom/leaveRoom to a single line. See use of *useWebSocketSubscription* in 
 `services/frontend-web/app/src/demo-views/WatchSlidecast.jsx`  


## Configuring websocket-push

The example refactors out a few methods that people might want to customize into a single file: `services/websocket-push/app/lib/setup-ws-behavior.js` 

The most important is `extractWsUserIdFromRequest`, which must return a user id string based on the passed-in upgrade request 
 object. When sending a message with *pushToUser*, the value must match the value returned by this function. By default, it
 uses the 'x-auth-user' or 'x-auth-guest' header set by our *passportjs-auth* service.    

You can restrict connections in the file's `permitUserConnection` and `permitJoiningRoom` functions. 

Note: if you don't want guests to connect with WebSockets at all, you can block the upgrade requests completely by removing 
 the `/server_notifications` path from the *GuestPermittedResource* list in `services/passportjs-auth/app/src/config.ts`.       
                                                                                                         
By default, the same Redis database (*redis-main*) is used for everything Redis. If you prefer to use a different one for 
 PubSub, you can also modify the connection config in this same config file. 
  

## Misc notes

* Why not use Socket.io here? Partly because using pure websockets lets people use any client library they want. A bigger reason 
 is that their documentation says request headers are not available for websockets, making it incompatible out of the box with
 our centralized approach to user authentication. It's probably possible to extract the headers from the http upgrade request 
 (perhaps through `io.engine.on('upgrade')`) but the even more popular [ws](https://www.npmjs.com/package/ws) library directly 
 supports request headers, offers usage examples, and is compatible with any client-side websocket library.     

* *websocket-push* is the only service in *webstack-micro* that uses sticky sessions. Should you scale *websocket-push*, sockets 
 would be assigned by the load balancer and not by user or room. Different servers might manage sockets for the same user or 
 room--something to take into account should you decide to replace Redis PubSub.
