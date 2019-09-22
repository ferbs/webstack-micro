import React from "react"
import { navigate } from '@reach/router'
import { fetchAuthUser, signOut } from './auth-api';
import { setCsrfToken } from '../util/fetch-util';
import asStateAssigment from "../util/assign-state-util";


const AuthContext = React.createContext({});

export default function useAuthContext() {
  return React.useContext(AuthContext);
}


const DefaultOpts = {
  onSignout: () => navigate('/')
};

export function AuthContextProvider({ children, ...props }) {
  const opts = { ...DefaultOpts, ...props };

  const [ authState, setState ] = React.useState({
    initialPageLoading: true,
    connectionError: false,
    user: null,
  });
  const assignAuthUserState = asStateAssigment(setState);


  const setAuthUserState = (currentUserData) => {
    const { csrfToken, ...authUser } = currentUserData;
    if (csrfToken) {
      setCsrfToken(csrfToken);
    }
    const updates = {
      connectionError: false,
    };
    if (!authUser || !authUser.authUserId) {
      updates.user = null;
    } else {
      updates.user = authUser;
    }
    assignAuthUserState(updates);
  };

  const setConnectionErrorState = (hasTrouble) => assignAuthUserState({ connectionError: !!hasTrouble });

  const submitSignOut = () => signOut()
    .then(() => {
      assignAuthUserState({
        user: null,
        connectionError: false,
      });
      opts.onSignout();
    })
    .catch((err) => {
      console.warn('Error while trying to sign out', err);
      assignAuthUserState({ connectionError: true });
    });

  const fetchAndUpdateAuthState = () => fetchAuthUser()
    .then((currentUserData) => {
      setAuthUserState(currentUserData);
    })
    .catch((err) => {
      console.error('Failed to reach server', err.details);
      assignAuthUserState({ connectionError: true });
    })
    .finally(() =>{
      assignAuthUserState({
        initialPageLoading: false,
        lastChecked: new Date(),
      });
    });

  
  React.useEffect(() => {
    fetchAndUpdateAuthState();
    // eslint-disable-next-line 
  }, []); // conditional firing param of [] tells React to only run effect on initial page load, not on subsequent renders


  const { user } = authState;
  const ctx = {
    ...authState,
    isLoggedIn: !!(user && user.authUserId),

    assignAuthUserState, setAuthUserState,

    submitSignOut,
    setConnectionErrorState,
    fetchAndUpdateAuthState,
  };
  return <AuthContext.Provider value={ ctx }>
    {children}
  </AuthContext.Provider>;
}

export function withAuthContext(children, opts) {
  return <AuthContextProvider { ...opts }>{children}</AuthContextProvider>;
}


