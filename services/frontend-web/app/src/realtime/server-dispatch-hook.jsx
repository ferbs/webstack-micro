import React from "react"
import clientCommands from "../shared-constants.generated/client-commands";
import { RealtimeContextProvider, useRealtimeContext } from './internal/realtime-context';
import { registerReducer, registerReducers, removeReducer } from './internal/server-message-reducer';


export default function useServerDispatch(opts={}) {
  const { onEachConnect, skipOnMount, fetchState } = opts;
  const ctx = useRealtimeContext();
  const { dispatch, webSocketConnection } = ctx;
  const { addWebSocketListener, removeWebSocketListener } = webSocketConnection;
  const [ hasLostConnection, setHasLostConnection ] = React.useState(false);

  const fetchStateNow = () => {
    if (typeof fetchState === 'function') {
      fetchState().then(data => dispatch(data)).catch(err => {
        console.warn('Failed to fetch current state from server', err);
      });
    } else {
      console.warn('Cannot run fetchState function, useServerDispatch was not passed a fetchState function. (note: it should be async or return a promise.)');
    }
  };

  const _onConnect = () => {
    onEachConnect && onEachConnect(dispatch);
    fetchState && fetchStateNow();
  };

  const onClose = () => {
    setHasLostConnection(true);
  };

  const onOpen = () => {
    if (hasLostConnection) {
      _onConnect();
    }
  };

  React.useEffect(() => {
    if (!skipOnMount) {
      _onConnect();
    }
    addWebSocketListener('close', onClose);
    addWebSocketListener('open', onOpen);
    return () => {
      removeWebSocketListener('open', onOpen);
      removeWebSocketListener('close', onClose);
    }
    // eslint-disable-next-line
  }, [ skipOnMount, hasLostConnection, addWebSocketListener, removeWebSocketListener ]);


  // The returned context contains dispatched state plus methods relating to WebSockets and the reducer:
  // todo: refactor into own TypeScript package
  //
  //   return {
  //    // ctx contains state, in the pattern of a normal reducer:
  //    ...state,
  //
  //    // plus methods to dispatch state client-side too if desired:
  //    dispatch, dispatchRootStateAssignment,
  //
  //    // and various WebSocket methods:
  //    tabWindowId, sendWhenConnected, hasWebSocketConnection, isAttemptingWebSocketConnection, getCurrentWebSocket, addWebSocketListener, removeWebSocketListener,
  //   }
  //
  return ctx;
}


export {
  clientCommands,
  registerReducer, registerReducers, removeReducer,
  useRealtimeContext, RealtimeContextProvider,
}

