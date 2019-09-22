import React from 'react';
import { Router } from '@reach/router'
import { ThemeProvider } from '@material-ui/styles';
import { CssBaseline, LinearProgress } from '@material-ui/core';
import { buildWebSocketUrl } from './util/url-util';
import { PrivateRoute, PublicRoute } from './auth/routes';
import SignIn from './auth/views/SignIn';
import GuestHome from './demo-views/GuestHome';
import UserHome from './demo-views/UserHome';
import PresentSlidecast from './demo-views/PresentSlidecast';
import WatchSlidecast from './demo-views/WatchSlidecast';
import useAuthContext, { AuthContextProvider } from './auth/auth-context';
import { RealtimeContextProvider } from './realtime/server-dispatch-hook';
import 'typeface-roboto'; // NOTE: Material-UI requires this font. See https://material-ui.com/components/typography/#general
import theme from './material-ui-theme/';
import useStyles from './App.style';
import BackgroundPushDemo from "./demo-views/BackgroundPushDemo";
import {EnvVars} from "./config";



function WebstackMicroDemo() {
  const { initialPageLoading } = useAuthContext();

  if (initialPageLoading) {
    return <InitialPageLoad />
  } else {
    // todo: try path prefix in @reach/router (basepath="/app" ?)
    return <div className="WebstackMicroDemo">
      <ThemeProvider theme={theme}>
        <Router>
          <PublicRoute path="/app/slides/:slidecastId" component={ WatchSlidecast} titlePrefix="Watch Slidecast" />
          <PrivateRoute path="/app/slidecast/present" component={PresentSlidecast} titlePrefix="Present Slidecast" />
          <PrivateRoute path="/app/dashboard" component={UserHome} titlePrefix="Dashboard" />
          <PrivateRoute path="/app/background_push" component={BackgroundPushDemo} titlePrefix="BackgroundPush Demo" />
          <PublicRoute path="/app/sign_in" component={SignIn} titlePrefix="Sign In" />
          <PublicRoute path="/" component={GuestHome} />
          <PublicRoute path="/app" component={GuestHome} />
        </Router>
      </ThemeProvider>
    </div>
  }
}


function InitialPageLoad() {
  const classes = useStyles();

  return <div className={classes.pageLoadingRoot}>
    <LinearProgress />
  </div>
}


function App() {
  const webSocketUrl = buildWebSocketUrl({ host: EnvVars.websocketHost, path: '/server_notifications/' });

  return <AuthContextProvider>
    <RealtimeContextProvider webSocketUrl={webSocketUrl}>
      <CssBaseline />
      <WebstackMicroDemo />
    </RealtimeContextProvider>
  </AuthContextProvider>;
}


export default App;
