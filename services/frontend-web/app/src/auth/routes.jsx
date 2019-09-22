import React from 'react'
import { Redirect } from '@reach/router'
import useAuthContext from './auth-context';


const DocumentTitleBase = 'WebstackMicro';

export function PrivateRoute(props) {
  const { isLoggedIn } = useAuthContext();
  if (!isLoggedIn) {
    return <Redirect to="/app/sign_in" noThrow />
  }
  return <PageRoute { ...props } />;
}


function PageRoute(props) {
  const { component: Component, titlePrefix, location, ...rest } = props;
  React.useEffect(() => {
    document.title = (titlePrefix ? [ titlePrefix, DocumentTitleBase] : [ DocumentTitleBase ]).join(' - ');
    return () => {
      document.title = DocumentTitleBase; // or will this flicker?
    }
  }, [ titlePrefix ]);
  return <Component {...rest} />;
}


export const PublicRoute = PageRoute;
