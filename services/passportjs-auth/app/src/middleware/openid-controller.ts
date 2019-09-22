import express from "express";
import passport from "passport";
import {AuthUserPersistence, LoginCallback, OpenIdProvider} from "../passportjs-auth-app";
import {frontendPagePath, FrontendPageType, OpenIdApiMountPoint} from "../api-endpoints";
import setupGithubAsProvider from "../openid-providers/github-connect";
import setupFacebookAsProvider from "../openid-providers/facebook-connect";
import setupGoogleAsProvider from '../openid-providers/github-connect';
import {promisedLogin} from "../support/passportjs-support";


interface ProvidersByName {
  [key: string]: OpenIdProvider;
}

export interface OpenIdProviderProps extends OpenIdProvider {
  callbackUrl: string;
}

export interface OpenIdConnectControllerOpts extends AuthUserPersistence {
  serverBaseUrl: string;
  providers: ProvidersByName;
  onLoginSuccess?: LoginCallback;
}

export default function setupOpenidAuthRouter({serverBaseUrl, providers, onLoginSuccess, ...persistenceFunctions}: OpenIdConnectControllerOpts) {
  const router = express.Router();
  const addProviderProps = { router, serverBaseUrl, providers, onLoginSuccess, persistenceFunctions };

  if (providers.facebook && providers.facebook.clientSecret) {
    _addProviderRoutes('facebook', {
      setupFn: setupFacebookAsProvider,
      ...addProviderProps
    });
  }

  if (providers.github && providers.github.clientSecret) {
    _addProviderRoutes('github', {
      setupFn: setupGithubAsProvider,
      scope: [ 'user:email' ],
      ...addProviderProps
    });
  }

  if (providers.google && providers.google.clientSecret) {
    _addProviderRoutes('google', {
      setupFn: setupGoogleAsProvider,
      ...addProviderProps
    });
  }

  return router;
}



interface AddProviderProps extends Partial<OpenIdConnectControllerOpts> {
  setupFn: Function;
  persistenceFunctions: AuthUserPersistence;
  router: express.Router;
  scope?: string[];
}
function _addProviderRoutes(providerCode: string, opts: AddProviderProps) {
  const { setupFn, router, persistenceFunctions, scope, onLoginSuccess, serverBaseUrl, providers } = opts;
  const providerConfig = providers[providerCode];
 const { saveAuthUser } = persistenceFunctions;

  console.log(`Setting up oauth route /auth/connect/${providerCode} and its callback`);
  setupFn({
    ...persistenceFunctions,
    ...providerConfig,
    callbackUrl: _openIdCallbackUrl(serverBaseUrl, providerCode),
  });

  // to start the connection process, browser navigates to this /auth/connect/${providerCode} endpoint
  router.get(`/${providerCode}`, passport.authenticate(providerCode, {
    scope
  }));

  router.get(`/${providerCode}/callback`, function (req, res, next) {
    passport.authenticate(providerCode, function (err, user, successInfo, errorStatus) {
      const _handleAuthenticateCallback = async () => {
        if (err) {
          next(err);
        } else if (!user) {
          console.log('OpenId login failed', errorStatus);
          // note: providing a callback to passport.authenticate bypasses a lot of otherwise probably desired functionality. (kindof annoying)
          // See node_modules/passport/lib/middleware/authenticate.js
          // todo: pass errorStatus w/ flash or param, eg req.flash(type, msg);
          res.redirect(frontendPagePath(FrontendPageType.SignIn));
        } else {
          await saveAuthUser(user);
          await promisedLogin(user, req);
          await onLoginSuccess(user, req, res);
          res.redirect(req.session.returnTo || frontendPagePath(FrontendPageType.UserHome));
          return user;
        }
      };
      _handleAuthenticateCallback().catch(err => {
        console.error(`Error in ${providerCode} authentication handler`, err);
      });
    })(req, res, next);
  });
}


function _openIdCallbackUrl(serverBaseUrl: string, provider: string) {
  return `${serverBaseUrl}${OpenIdApiMountPoint}/${provider}/callback`;
}

