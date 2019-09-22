import backoff from 'backoff';

const DefaultOpts = {
  /**
   * URL for WebSocket server.
   * Required.
   * Eg: ws.webstack.loc/server_notifications/
   */
  url: null,

  /**
   * Factory function for creating a WebSocket instance. Optional.
   * override if you want to use a special WebSocket implementation (or in unit tests).
   * Note: this already implements its own auto-reconnect/backoff, disable it in your private implementation or remove the related code here.
   * @param url
   * @returns {WebSocket}
   */
  webSocketFactory: (url) => new WebSocket(url),


  /**
   * Callback that is passed a freshly-created WebSocket.
   * Optional.
   * @param (ws: WebSocket) => void
   */
  onConnectionAttempt: null,

};

export default function startWebsocketConnection(opts) {
  const { url, onConnectionAttempt, webSocketFactory } = Object.assign({}, DefaultOpts, opts);
  const listenersByEvent = {};
  let webSocket;

  const addWebSocketListener = (type, fn) => {
    // TODO: check event type is used: open, close, error, message
    if (typeof fn !== 'function') {
      console.error('addWebSocketListener expecting an event handler function');
      return;
    }
    if (webSocket) {
      webSocket.addEventListener(type, fn);
    }
    listenersByEvent[type] = listenersByEvent[type] || [];
    listenersByEvent[type].push(fn);
  };

  const removeWebSocketListener = (eventType, fn) => {
    if (!listenersByEvent[eventType]) {
      return;
    }
    if (typeof fn !== 'function') {
      console.error('Reference to specific listener required'); // because not currently distinguishing between lower-level ones set in realtime-context.jsx and view-specific listeners
      return;
    }
    if (webSocket) {
      webSocket.removeEventListener(eventType, fn);
    }
    const ndx = listenersByEvent[eventType].findIndex(existing => existing === fn);
    if (ndx >= 0) {
      listenersByEvent[eventType].splice(ndx, 1);
    }
  };

  const getCurrentWebSocket = () => webSocket;

  const fibonacciBackoff = backoff.fibonacci({
    randomisationFactor: 0,
    initialDelay: 1200,
    maxDelay: 1000 * 60 * 4
  });


  const triggerEventListeners = (eventType, evt) =>{
    (listenersByEvent[eventType] || []).forEach(fn => {
      try {
        fn(evt);
      } catch (err) {
        console.error(`Uncaught error in WebSocket "${eventType}" listener"`, err);
      }
    });
  };

  const attemptConnection = () => {
    webSocket = webSocketFactory(url);

    webSocket.addEventListener('open', function(evt) {
      fibonacciBackoff.reset();
      triggerEventListeners('open', evt);
    });

    webSocket.addEventListener('close', function(evt) {
      fibonacciBackoff.backoff();
      triggerEventListeners('close', evt);
    });

    webSocket.addEventListener('error', function(evt) {
      // ws errors are useless, they carry no info (intentionally by the spec to protect something or other serverside)
      triggerEventListeners('error', evt);
      // console.warn('WebSocket error:', evt);
    });

    onConnectionAttempt && onConnectionAttempt(webSocket);
  };

  fibonacciBackoff.on('ready', function(number, delay) {
    attemptConnection();
  });

  attemptConnection();

  return {
    getCurrentWebSocket,
    addWebSocketListener,
    removeWebSocketListener,
  }
}
