import React from "react"
import startWebsocketConnection from './websocket-connection';
import {serverMessageReducer, buildDispatchHandlers, registerReducer} from "./server-message-reducer";



/**
 * Server assigns an ID to each WebSocket on connect. If you pass it to your backend controller with a request, you can have
 * the controller restrict the outgoing WebSocket message to this single tab (rather than broadcast to all of the user's connected
 * tab windows.)
 */
let tabWindowId;

const RealtimeContext = React.createContext({});

export function useRealtimeContext() {
  return React.useContext(RealtimeContext);
}

const UpdateAction = 'Local:UpdateWebSocketState';
registerReducer(UpdateAction, (prevState, updates) => {
  delete updates.type;
  return { ...prevState, ...updates };
}, { scope: 'webSocketConnection' });


export function RealtimeContextProvider({ webSocketUrl, children }) {
  const [ state, dispatch ] = React.useReducer(serverMessageReducer, {
    webSocketConnection: { hasWebSocketConnection: false, isAttemptingWebSocketConnection: false }
  });
  const wsConnectionState = (state || {}).webSocketConnection;
  const { messageHandler, dispatchRootStateAssignment } = buildDispatchHandlers(dispatch);
  const assignWsConnectionState = (updates) => dispatch({ type: UpdateAction, ...updates   });

  React.useEffect(() => {
    _initWebSockets({
      url: webSocketUrl,
      onMessage: messageHandler,
      onEachConnect: () => _processPendingMessages({ wsConnectionState, assignWsConnectionState }),
      assignWsConnectionState,
    });
    // eslint-disable-next-line
  }, [ webSocketUrl ]); // should only run once on mount, not on each render (unless url changes which it doesn't)


  const sendWhenConnected = (data, opts={}) => {
    const { hasWebSocketConnection, pendingMessages, getCurrentWebSocket } = wsConnectionState;
    const msg = JSON.stringify(data);
    if (hasWebSocketConnection) {
      const ws = getCurrentWebSocket();
      ws.send(msg);
    } else {
      const expires = typeof opts.expires === 'number' || opts.expires === false ? opts.expires : Date.now() + 1000 * 30;
      assignWsConnectionState({ pendingMessages: [ ...(pendingMessages || []), { msg, expires } ] });
    }
  };


  const ctx = {
    ...state, // webSocketConnection plus any data dispatched through a reducer
    // note: state.webSocketConnection includes: tabWindowId, hasWebSocketConnection, isAttemptingWebSocketConnection, getCurrentWebSocket, addWebSocketListener, removeWebSocketListener

    sendWhenConnected,
    dispatch,
    dispatchRootStateAssignment,
  };

  return <RealtimeContext.Provider value={ ctx }>
    {children}
  </RealtimeContext.Provider>;
}



function _initWebSockets({ url, assignWsConnectionState, onMessage, onEachConnect }) {
  const { getCurrentWebSocket, addWebSocketListener, removeWebSocketListener } = startWebsocketConnection({
    url,
    onConnectionAttempt: () => assignWsConnectionState({ isAttemptingWebSocketConnection: true }),
  });

  addWebSocketListener('open', (evt) => {
    assignWsConnectionState({ hasWebSocketConnection: true, isAttemptingWebSocketConnection: false });
    onEachConnect && onEachConnect();
  });

  addWebSocketListener('close', (evt) => { // note: both error and close events will trigger, error event first I think
    assignWsConnectionState({ hasWebSocketConnection: false, isAttemptingWebSocketConnection: false });
  });

  addWebSocketListener('error', (evt) => {
    assignWsConnectionState({ hasWebSocketConnection: false, isAttemptingWebSocketConnection: false });
  });

  addWebSocketListener('message', evt => {
    try {
      const data = JSON.parse(evt.data);
      if (data.tabWindowId && Object.keys(data).length === 1) {
        tabWindowId = data.tabWindowId;
        console.log('WebSocket server assigned this tab window the id:', tabWindowId);
      } else {
        onMessage(data);
      }
    } catch (err) {
      console.error('Received invalid command over websockets', evt.data);
    }
  });

  assignWsConnectionState({ getCurrentWebSocket, addWebSocketListener, removeWebSocketListener });
}

function _processPendingMessages({ wsConnectionState, assignWsConnectionState }) {
  const { pendingMessages, getCurrentWebSocket } = wsConnectionState;
  if (pendingMessages && pendingMessages.length) {

    const ws = getCurrentWebSocket();
    pendingMessages.forEach(pm => {
      const { msg, expires } = pm;
      if (expires === false || (typeof expires === 'number' && expires < Date.now())) {
        console.log('Sending delayed WebSocket message', msg);
        ws.send(msg);
      } else {
        console.log('Delayed WebSocket message expired before client reconnected');
      }

    });
    assignWsConnectionState({ pendingMessages: []});
  }
}