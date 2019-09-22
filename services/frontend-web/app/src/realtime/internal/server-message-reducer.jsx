import clientCommands from "../../shared-constants.generated/client-commands";


const RootStateAssignment = clientCommands.RootState.Assign;

const ReducerFunctionsByType = {
  // NOTE: most of the reducers are set/applied using registerReducer function below
  [ RootStateAssignment ]: (prevState, action={}) => {
    if (action && action.type) {
      delete action.type;
    }
    return { ...prevState, ...action };
  },
};

export const serverMessageReducer = (state, action) => {
  const type = action && action.type;
  if (!type) {
    console.warn('Action must include "type". Ignoring:', action);
    return;
  }
  const fn = ReducerFunctionsByType[type];
  if (!fn) {
    console.warn(`Unknown reducer action received over WebSockets. Register "${type}" with realtime-context#applyReducer.`);
    return;
  }
  return fn(state, action);
};


export function registerReducer(actionType, fn, opts={}) {
  const { scope } = opts; // optional namespace. Eg, when "slidecast" only that value is passed to the reducer function
  if (typeof actionType !== 'string') {
    throw new Error('Expecting action type as string');
  }
  if (typeof fn !== 'function') {
    throw new Error(`Expecting handler for action "${actionType}" to be a function of type (prevState, actionData) => updatedState`);
  }
  if (ReducerFunctionsByType[actionType]) {
    console.warn('Clobbering existing reducer:', actionType);
  }
  if (scope) {
    ReducerFunctionsByType[actionType] = (prevState, action={}) => {
      return {
        ...prevState,
        [ scope ]: fn(prevState[scope] || {}, action),
      };
    };
  } else {
    ReducerFunctionsByType[actionType] = fn;
  }
}

export function registerReducers(reducersByType, opts) {
  if (typeof reducersByType === 'string') {
    const scope = reducersByType;
    reducersByType = opts;
    opts = { scope };
  }
  Object.keys(reducersByType).forEach(actionType => registerReducer(actionType, reducersByType[actionType], opts));
}

export function removeReducer(actionType) {
  delete ReducerFunctionsByType[actionType];
}

export function buildDispatchHandlers(dispatch) {
  const dispatchRootStateAssignment = (updates) => dispatch({ type: RootStateAssignment, ...updates });

  const messageHandler = (data) => {
    const actionType = data && data.type;
    if (!actionType) {
      console.warn('Ignoring websocket message because it is not structured as a dispatch for a reducer:', data);
    } else {
      console.log('Received WebSocket message, dispatching as action', data);
      dispatch(data);
    }
  };



  return {
    messageHandler,
    dispatchRootStateAssignment,
  }
}
