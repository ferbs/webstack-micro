import express from "express";
import cryptoRandomString from "crypto-random-string";
import { AuthUser, Config, PathPrefixOrRegex} from "../passportjs-auth-app";
import { CurrentUserApiMountPoint, LocalPasswordApiMountPoint, OpenIdApiMountPoint, FrontendPageType, frontendPagePath, } from '../api-endpoints';
import {applySessionDataToResponseHeaders} from "../support/session-data";
import {authForJwtRequest, extractJwtFromHeader} from "../support/json-web-token-support";


export default function setupAuthCheckForTraefik(config: Partial<Config>) {
  const {
    serverBaseUrl,
    internalAuthHeaders,
    EnableLocalPasswordLoginSystem,
    GuestPermittedResource, IsFrontEndDevMode, DevMode_GuestPermittedResource,
    JwtConfig,
  } = config;

  const PublicApiResource = [
    CurrentUserApiMountPoint,
    EnableLocalPasswordLoginSystem && LocalPasswordApiMountPoint,
    OpenIdApiMountPoint,
  ];

  return (req: express.Request, res: express.Response) => {
    const path = req.headers["x-forwarded-uri"] as string;
    if (req.headers['x-auth-user'] || req.headers['x-auth-user']) {
      console.warn('Forbidden x-auth-* header set on incoming request to:', path);
      return res.sendStatus(403);
    }
    internalAuthHeaders.forEach(header => res.set(header, '')); // explicitly clear all values, just in case something in the gateway config goes wrong
    if (IsFrontEndDevMode && _passesPathWhitelist(DevMode_GuestPermittedResource, path)) {
      console.log('Permitting front-end dev-mode resource:', path);
      return res.sendStatus(200);
    }
    const jwtCredentials = JwtConfig && !!JwtConfig.secret && extractJwtFromHeader(req);
    if (jwtCredentials) {
      return authForJwtRequest(req, res, jwtCredentials, JwtConfig)
        .catch((err) => {
          console.info('Failed to verify JWT token', err && err.message);
        });
    }

    // Authenticate user in normal browser session:
    const authUser = req.user as AuthUser;
    let permitted: boolean;
    if (authUser && authUser.confirmed) {
      permitted = true;
      res.set("x-auth-user", authUser.authUserId);
      res.set("x-auth-email", authUser.email);
      res.set("x-auth-data", _extraAuthDataJsonString(authUser));
    } else if (_passesPathWhitelist(PublicApiResource, path) || _passesPathWhitelist(GuestPermittedResource, path)) {
      permitted = true;
      req.session.guestId = req.session.guestId || `guest:${cryptoRandomString({length: 16, type: "hex"})}`;
      res.set("x-auth-guest", req.session.guestId);
    } else {
      permitted = false;
      console.log("BLOCKING unauthorized request to protected resource:", path);
    }

    if (permitted) {
      console.log(`Permitting ${req.method} request from "${authUser ? authUser.authUserId : req.session.guestId}" to:`, path);
      applySessionDataToResponseHeaders(req, res);
      res.sendStatus(200);
    } else if (req.xhr) {
      res.status(403).json('NotAuthorized');
    } else {
      res.redirect(`${serverBaseUrl}${frontendPagePath(FrontendPageType.SignIn)}`);
    }
  };
}


function _extraAuthDataJsonString(authUser: AuthUser) {
  const { displayName } = authUser;
  return JSON.stringify({ displayName });
}

function _passesPathWhitelist(collection: PathPrefixOrRegex[], path: string): boolean {
  return !!collection.find(allow => allow && _testGuestPath(path, allow));
}
function _testGuestPath(actual: string, allowed: PathPrefixOrRegex): boolean {
  if (typeof allowed === "string") {
    return actual.indexOf(allowed) === 0;
  } else {
    return allowed.test(actual);
  }
}