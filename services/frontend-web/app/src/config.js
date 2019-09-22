
// During the build, create-react-app replaces process.env.REACT_APP_* with the actual environment variable.
// See https://create-react-app.dev/docs/adding-custom-environment-variables
const isDevMode = process.env.NODE_ENV === 'development';
const serverHost = process.env.REACT_APP_SERVER_HOST;
const wsHostOverride = process.env.REACT_APP_WEBSOCKET_HOST;

const EnvVars = {
  isDevMode,
  serverHost,
  websocketHost: wsHostOverride || serverHost,
  hasLocalPasswordLogin: isDevMode,
};


const OpenIdConnectHrefByProvider = {
  // facebook: '/auth/connect/facebook',
  github: '/auth/connect/github',
  // google: '/auth/connect/google',
};


export {
  EnvVars,
  OpenIdConnectHrefByProvider,
};